const express = require("express")
const router = express.Router()
const User = require("../models/User")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1h", // Token expires in 1 hour
  })
}

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body

  try {
    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ message: "User already exists" })
    }

    user = await User.create({
      name,
      email,
      password,
    })

    const token = generateToken(user._id)

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure in production
      maxAge: 3600000, // 1 hour
      sameSite: "Lax", // Or 'None' if cross-site, but requires secure: true
    })

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id)

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000, // 1 hour
        sameSite: "Lax",
      })

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
      })
    } else {
      res.status(401).json({ message: "Invalid credentials" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/auth/logout
// @desc    Logout user & clear cookie
// @access  Private
router.get("/logout", (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0), // Expire immediately
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  })
  res.status(200).json({ message: "Logged out successfully" })
})

// @route   POST /api/auth/google
// @desc    Login/Register with Google (Placeholder)
// @access  Public
router.post("/google", async (req, res) => {
  // This is a placeholder. In a real app, you'd verify the Google token
  // sent from the client, find or create the user, and then issue your own JWT.
  console.log("Google OAuth endpoint hit (placeholder)")
  res.status(200).json({ message: "Google OAuth not fully implemented yet." })
})

module.exports = router

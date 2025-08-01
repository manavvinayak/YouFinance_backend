const express = require("express")
const router = express.Router()
const { protect } = require("../middleware/auth")
const User = require("../models/User")

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")
    if (user) {
      res.json(user)
    } else {
      res.status(404).json({ message: "User not found" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", protect, async (req, res) => {
  const { name, email, currency } = req.body

  try {
    const user = await User.findById(req.user._id)

    if (user) {
      user.name = name || user.name
      user.email = email || user.email
      user.currency = currency || user.currency

      await user.save()
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
      })
    } else {
      res.status(404).json({ message: "User not found" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   PUT /api/users/budgets
// @desc    Set/Update monthly budgets
// @access  Private
router.put("/budgets", protect, async (req, res) => {
  const { budgets } = req.body // budgets should be an array of { category, amount }

  try {
    const user = await User.findById(req.user._id)

    if (user) {
      user.budgets = budgets // Overwrite or merge as needed
      await user.save()
      res.json(user.budgets)
    } else {
      res.status(404).json({ message: "User not found" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   PUT /api/users/alerts
// @desc    Set alert thresholds
// @access  Private
router.put("/alerts", protect, async (req, res) => {
  const { alertThresholds } = req.body

  try {
    const user = await User.findById(req.user._id)

    if (user) {
      user.alertThresholds = alertThresholds
      await user.save()
      res.json({ alertThresholds: user.alertThresholds })
    } else {
      res.status(404).json({ message: "User not found" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router

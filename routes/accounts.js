const express = require("express")
const router = express.Router()
const { protect } = require("../middleware/auth")
const Account = require("../models/Account")

// @route   GET /api/accounts
// @desc    Get all accounts for a user
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id })
    res.json(accounts)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/accounts
// @desc    Create a new account
// @access  Private
router.post("/", protect, async (req, res) => {
  const { name, type, initialBalance } = req.body

  try {
    const newAccount = new Account({
      user: req.user._id,
      name,
      type,
      initialBalance,
      currentBalance: initialBalance, // Initial balance is also current balance
    })

    const account = await newAccount.save()
    res.status(201).json(account)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   PUT /api/accounts/:id
// @desc    Update an account
// @access  Private
router.put("/:id", protect, async (req, res) => {
  const { name, type } = req.body // Only allow updating name and type for simplicity

  try {
    const account = await Account.findById(req.params.id)

    if (!account) {
      return res.status(404).json({ message: "Account not found" })
    }

    // Make sure user owns the account
    if (account.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to update this account" })
    }

    account.name = name || account.name
    account.type = type || account.type

    await account.save()
    res.json(account)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   DELETE /api/accounts/:id
// @desc    Delete an account
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const account = await Account.findById(req.params.id)

    if (!account) {
      return res.status(404).json({ message: "Account not found" })
    }

    // Make sure user owns the account
    if (account.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to delete this account" })
    }

    await Account.deleteOne({ _id: req.params.id })
    res.json({ message: "Account removed" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router

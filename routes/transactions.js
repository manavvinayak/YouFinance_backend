const express = require("express")
const router = express.Router()
const { protect } = require("../middleware/auth")
const Transaction = require("../models/Transaction")
const Account = require("../models/Account")

// @route   GET /api/transactions
// @desc    Get all transactions for a user (with filters)
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const { accountId, category, startDate, endDate } = req.query
    const query = { user: req.user._id }

    if (accountId) {
      query.account = accountId
    }
    if (category) {
      query.category = category
    }
    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = new Date(startDate)
      if (endDate) query.date.$lte = new Date(endDate)
    }

    const transactions = await Transaction.find(query).populate("account", "name type").sort({ date: -1 })
    res.json(transactions)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/transactions
// @desc    Add a new transaction
// @access  Private
router.post("/", protect, async (req, res) => {
  const { accountId, date, amount, type, category, description } = req.body

  try {
    const account = await Account.findById(accountId)
    if (!account || account.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Account not found or not owned by user" })
    }

    const newTransaction = new Transaction({
      user: req.user._id,
      account: accountId,
      date,
      amount,
      type,
      category,
      description,
    })

    const transaction = await newTransaction.save()

    // Update account balance
    if (type === "Income") {
      account.currentBalance += amount
    } else if (type === "Expense") {
      account.currentBalance -= amount
    }
    // For 'Transfer', you'd need to handle two accounts, which is more complex
    // For simplicity, we'll assume transfers are handled as two separate transactions (expense from one, income to another)
    await account.save()

    res.status(201).json(transaction)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   PUT /api/transactions/:id
// @desc    Update a transaction
// @access  Private
router.put("/:id", protect, async (req, res) => {
  const { date, amount, type, category, description, accountId } = req.body

  try {
    const transaction = await Transaction.findById(req.params.id)
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" })
    }

    // Make sure user owns the transaction
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to update this transaction" })
    }

    // Revert old transaction's effect on account balance
    const oldAccount = await Account.findById(transaction.account)
    if (oldAccount) {
      if (transaction.type === "Income") {
        oldAccount.currentBalance -= transaction.amount
      } else if (transaction.type === "Expense") {
        oldAccount.currentBalance += transaction.amount
      }
      await oldAccount.save()
    }

    // Update transaction fields
    transaction.date = date || transaction.date
    transaction.amount = amount || transaction.amount
    transaction.type = type || transaction.type
    transaction.category = category || transaction.category
    transaction.description = description || transaction.description
    transaction.account = accountId || transaction.account // Allow changing account

    // Apply new transaction's effect on account balance
    const newAccount = await Account.findById(transaction.account)
    if (newAccount) {
      if (transaction.type === "Income") {
        newAccount.currentBalance += transaction.amount
      } else if (transaction.type === "Expense") {
        newAccount.currentBalance -= transaction.amount
      }
      await newAccount.save()
    }

    await transaction.save()
    res.json(transaction)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" })
    }

    // Make sure user owns the transaction
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to delete this transaction" })
    }

    // Revert transaction's effect on account balance
    const account = await Account.findById(transaction.account)
    if (account) {
      if (transaction.type === "Income") {
        account.currentBalance -= transaction.amount
      } else if (transaction.type === "Expense") {
        account.currentBalance += transaction.amount
      }
      await account.save()
    }

    await Transaction.deleteOne({ _id: req.params.id })
    res.json({ message: "Transaction removed" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router

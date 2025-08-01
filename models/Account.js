const mongoose = require("mongoose")

const AccountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["Checking", "Savings", "Credit Card", "Cash", "Investment", "Other"],
    required: true,
  },
  initialBalance: {
    type: Number,
    required: true,
    default: 0,
  },
  currentBalance: {
    type: Number,
    required: true,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Account", AccountSchema)

const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    default: "USD",
  },
  budgets: [
    {
      category: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      spent: {
        type: Number,
        default: 0,
      },
    },
  ],
  alertThresholds: {
    type: Number,
    default: 0, // e.g., notify if spending exceeds this amount
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next()
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model("User", UserSchema)

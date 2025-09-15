require("dotenv").config({ path: ".env" })
const express = require("express")
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const connectDB = require("../config/db")

const authRoutes = require("../routes/auth")
const accountRoutes = require("../routes/accounts")
const transactionRoutes = require("../routes/transactions")
const userRoutes = require("../routes/users")

// Connect to database
connectDB()

const app = express()

// Middleware
app.use(
  cors({
    origin: "https://you-finance-frontend.vercel.app/", // Allow frontend origin
    credentials: true, // Allow cookies to be sent
  }),
)
app.use(express.json()) // Body parser for JSON
app.use(cookieParser()) // Cookie parser

// Route Middlewares
app.use("/api/auth", authRoutes)
app.use("/api/accounts", accountRoutes)
app.use("/api/transactions", transactionRoutes)
app.use("/api/users", userRoutes)

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send("Something broke!")
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

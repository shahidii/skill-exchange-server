const express = require("express");
const { httpLogger } = require("../utils/logger");
const connectDB = require("../config/db");
const errorHandler = require("../middleware/error.middleware");
const cors = require("cors");
const routes = require("../routes");
const path = require("path");

const app = express();

// Connect to the database 
connectDB();

// Middleware setup
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json()); // Parse JSON bodies
app.use(httpLogger); // Log HTTP requests
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // Serve static files from uploads directory

// Define routes
app.use("/api", routes); // Mount all routes under /api

// Default route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Skill Swap API is running",
        data: {
            service: "skill-swap-api",
            version: "0.1.0",
            environment: process.env.NODE_ENV || "development",
            timestamp: new Date().toISOString()
        }
    });
});

// Error handling middleware
app.use(errorHandler); // Handle errors using errorHandler middleware

module.exports = app;

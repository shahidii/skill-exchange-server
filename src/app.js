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
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON bodies
app.use(httpLogger); // Log HTTP requests
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // Serve static files from uploads directory

// Define routes
app.use("/api", routes); // Mount all routes under /api

// Default route
app.get("/", (req, res) => {
    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);
    const uptime = `${hours}h ${minutes}m ${seconds}s`;

    res.status(200).json({
        success: true,
        message: "Skill Swap API is running",
        data: {
            status: "ok",
            service: "skill-swap-api",
            version: "0.1.0",
            environment: process.env.NODE_ENV || "development",
            timestamp: new Date().toISOString(),
            uptime: uptime
        }
    });
});

// Error handling middleware
app.use(errorHandler); // Handle errors using errorHandler middleware

module.exports = app;

const express = require("express");
const dotenv = require("dotenv").config();
const { httpLogger, logger } = require("./utility/pino");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorhandler");
const cors = require("cors");
const app = express();

// Connect to the database 
connectDB();

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON bodies
app.use(httpLogger); // Log HTTP requests

// Define routes
app.use("/api/auth", require("./routes/authRoutes")); // Authentication routes

// Default route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to the Skill Exchange API!" });
});

// Error handling middleware
app.use(errorHandler); // Handle errors using errorHandler middleware

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
});

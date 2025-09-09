const express = require("express");
const dotenv = require("dotenv").config();
const { httpLogger , logger } = require("./utility/pino");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorhandler");
const cors = require("cors");
const app = express();

connectDB();

//Middleware
app.use(cors());
app.use(express.json());
app.use(httpLogger);

// Routes
app.use("/api/auth", require("./routes/authRoutes"));

app.get("/", (req, res) => {
    res.json({ message: "Welcome to the Skill Exchange API!" });
});

// Error Handler
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
});

const mongoose = require('mongoose');
const { logger } = require('../utility/pino');

const connectDB = async () => {
    try {
        // Attempt to connect to MongoDB Atlas
        await mongoose.connect(process.env.MONGO_URI_ATLAS);
        logger.info("Database connected successfully to MongoDB Atlas!");
    } catch (error) {
        logger.error("MongoDB Atlas connection failed:", error.message);

        try {
            // Fallback to local MongoDB connection if Atlas fails
            await mongoose.connect(process.env.MONGO_URI_LOCAL);
            logger.info("Connected to local MongoDB!");
        } catch (localError) {
            logger.error("Local MongoDB connection failed:", localError.message);
            process.exit(1); // Exit the process with failure
        }
    }
};

module.exports = connectDB;

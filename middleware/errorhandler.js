const { logger } = require("../utility/pino");

const errorHandler = (err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" , error: err.message || "Internal Server Error"});
};

module.exports = errorHandler;

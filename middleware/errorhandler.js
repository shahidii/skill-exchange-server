const { logger } = require("../utility/pino");

const errorHandler = (err, req, res, next) => {
    logger.error(err.stack);
    res.status(err.statusCode || 500).json({ success: false , error: {code: err.code , message: err.message || "Internal Server Error" }});
};

module.exports = errorHandler;

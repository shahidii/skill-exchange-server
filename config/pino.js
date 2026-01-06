const pino = require("pino");

const isDev = process.env.NODE_ENV == "production";

const logger = pino({
    level: isDev ? "debug" : "info",
    transport: isDev
        ? {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "SYS:dd-mm-yyyy HH:MM:ss",
                singleLine: true,
                ignore: "pid,hostname",
            },
        }
        : undefined,
});

module.exports = { logger };

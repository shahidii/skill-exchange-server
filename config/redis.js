const { logger } = require('../utils/logger');

let client;
let fallbackLogged = false;

async function getClient() {
    if (client && client.isOpen) return client;

    let redis;
    try {
        redis = require('redis');
    } catch (e) {
        if (!fallbackLogged) {
            logger.warn('Redis package not installed, using in-memory fallback.');
            fallbackLogged = true;
        }
        client = null;
        return null;
    }

    const { REDIS_URL, REDIS_LOCAL_URL, REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD } = process.env;

    // Only attempt Redis if we have configuration
    if (!REDIS_URL && !REDIS_LOCAL_URL && !(REDIS_HOST && REDIS_PORT)) {
        if (!fallbackLogged) {
            logger.info('No Redis configuration found, using in-memory fallback.');
            fallbackLogged = true;
        }
        client = null;
        return null;
    }

    try {
        if (REDIS_HOST && REDIS_PORT) {
            client = redis.createClient({
                username: REDIS_USERNAME,
                password: REDIS_PASSWORD,
                socket: { host: REDIS_HOST, port: Number(REDIS_PORT) }
            });
        } else if (REDIS_URL) {
            client = redis.createClient({ url: REDIS_URL });
        } else if (REDIS_LOCAL_URL) {
            logger.info('Using local Redis');
            client = redis.createClient({ url: REDIS_LOCAL_URL });
        }

        await client.connect();
        logger.info('Redis connected');
        return client;
    } catch (err) {
        logger.error({ err }, 'Failed to connect Redis, using fallback.');
        client = null;
        return null;
    }
}

module.exports = { getClient };

const { logger } = require('./pino');

let client;
let fallbackStore = new Map(); // in-memory fallback
let fallbackLogged = false; // <--- new

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

async function setJsonWithTtl(key, value, ttlSeconds) {
  const c = await getClient();
  if (c) {
    await c.set(key, JSON.stringify(value), { EX: ttlSeconds });
    logger.info('Redis set');
  } else {
    // fallback in-memory store with TTL
    const expiresAt = Date.now() + ttlSeconds * 1000;
    fallbackStore.set(key, { value, expiresAt });
    logger.info('Redis not Connected, using fallback');
  }
}

async function getJson(key) {
  const c = await getClient();
  if (c) {
    const str = await c.get(key);
    if (!str) return null;
    try { return JSON.parse(str); } catch { return null; }
  } else {
    const record = fallbackStore.get(key);
    if (!record) return null;
    if (record.expiresAt && record.expiresAt < Date.now()) {
      fallbackStore.delete(key);
      return null;
    }
    return record.value;
  }
}

async function delKey(key) {
  const c = await getClient();
  if (c) {
    await c.del(key);
  } else {
    fallbackStore.delete(key);
  }
}

module.exports = { getClient, setJsonWithTtl, getJson, delKey };

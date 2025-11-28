const { logger } = require('./logger');


const { getClient } = require('../config/redis');

let fallbackStore = new Map(); // in-memory fallback

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

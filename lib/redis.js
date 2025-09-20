// lib/redis.js — optional Redis client with safe fallbacks
import { createClient } from "redis";

let client = null;
let connecting = null;

function hasRedisUrl() {
  return !!process.env.REDIS_URL;
}

export async function getRedis() {
  if (!hasRedisUrl()) return null; // No Redis configured
  if (client) return client;
  if (connecting) return connecting;

  client = createClient({ url: process.env.REDIS_URL });
  client.on("error", (err) => console.error("Redis error:", err));
  connecting = client.connect().then(() => client);
  return connecting;
}

// Convenience helpers (no-op if Redis is not configured)
export async function cacheGet(key) {
  const redis = await getRedis();
  if (!redis) return null;
  return redis.get(key);
}

export async function cacheSet(key, value, ttlSeconds = 3600) {
  const redis = await getRedis();
  if (!redis) return false;
  if (ttlSeconds > 0) {
    await redis.set(key, value, { EX: ttlSeconds });
  } else {
    await redis.set(key, value);
  }
  return true;
}

export async function cacheDel(key) {
  const redis = await getRedis();
  if (!redis) return 0;
  return redis.del(key);
}

export async function cacheIncr(key) {
  const redis = await getRedis();
  if (!redis) return 0;
  return redis.incr(key);
}

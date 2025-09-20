// lib/rateLimit.js — simple rate limiter using Redis if available, else memory
import { cacheIncr, getRedis } from "./redis";

const memory = new Map();

export async function rateLimit({ key, limit = 20, windowSec = 60 }) {
  const redis = await getRedis();
  const now = Math.floor(Date.now() / 1000);
  const bucket = `${key}:${Math.floor(now / windowSec)}`;

  if (redis) {
    const count = await cacheIncr(bucket);
    if (count === 1) {
      // set TTL ~ window
      await redis.expire(bucket, windowSec);
    }
    if (count > limit) return false;
    return true;
  }

  // Fallback in-memory (non-distributed)
  const entry = memory.get(bucket) || { count: 0, expires: now + windowSec };
  if (entry.expires < now) {
    entry.count = 0;
    entry.expires = now + windowSec;
  }
  entry.count += 1;
  memory.set(bucket, entry);
  return entry.count <= limit;
}
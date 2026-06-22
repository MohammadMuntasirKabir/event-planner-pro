/**
 * Simple in-memory rate limiter.
 * Allows max `maxRequests` per `windowMs` per IP address.
 *
 * Not suitable for multi-instance deployments — use Redis or similar
 * for production horizontal scaling.
 */

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

const MAX_REQUESTS = 30;
const WINDOW_MS = 60_000; // 1 minute

// Clean up expired entries every 5 minutes
const CLEANUP_INTERVAL_MS = 300_000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function scheduleCleanup() {
  if (cleanupTimer !== null) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now >= entry.resetAt) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);
}

scheduleCleanup();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now >= entry.resetAt) {
    // New window
    const resetAt = now + WINDOW_MS;
    store.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetAt: entry.resetAt };
}

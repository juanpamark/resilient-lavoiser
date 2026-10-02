export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
}

/**
 * High-performance In-Memory Sliding Window Rate Limiter
 * Tracks access timestamps per key and automatically purges expired entries
 */
export class SlidingWindowRateLimiter {
  private requests: Map<string, number[]> = new Map();

  /**
   * Evaluates if a request is allowed within the sliding window
   *
   * @param key - Unique identifier (e.g. phone number, IP, tenant ID)
   * @param maxRequests - Maximum requests permitted in the window
   * @param windowMs - Sliding window duration in milliseconds (e.g. 60,000 for 1 min)
   */
  limit(key: string, maxRequests: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    const windowStart = now - windowMs;

    let timestamps = this.requests.get(key) || [];

    // Purge timestamps older than the sliding window start
    timestamps = timestamps.filter((t) => t > windowStart);

    if (timestamps.length >= maxRequests) {
      const oldest = timestamps[0] || now;
      const resetInMs = Math.max(0, oldest + windowMs - now);

      this.requests.set(key, timestamps);
      return {
        allowed: false,
        remaining: 0,
        resetInMs,
      };
    }

    // Append current timestamp and update map
    timestamps.push(now);
    this.requests.set(key, timestamps);

    return {
      allowed: true,
      remaining: maxRequests - timestamps.length,
      resetInMs: windowMs,
    };
  }

  /**
   * WhatsApp Webhook Sender Rate Limit:
   * Max 20 messages per minute per phone number
   */
  checkWhatsAppSenderLimit(phoneNumber: string): RateLimitResult {
    return this.limit(`wa_sender_${phoneNumber}`, 20, 60_000);
  }

  /**
   * Login & Authentication Rate Limit:
   * Max 5 attempts per minute per IP to prevent brute-force attacks
   */
  checkLoginAttemptLimit(ipAddress: string): RateLimitResult {
    return this.limit(`login_ip_${ipAddress}`, 5, 60_000);
  }

  /**
   * Clears state for testing or administrative resets
   */
  clear(): void {
    this.requests.clear();
  }
}

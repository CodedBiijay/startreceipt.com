/**
 * Rate Limiter Service
 * Prevents abuse by limiting requests per user per time period
 */

interface RateLimitRecord {
  timestamp: number;
}

interface RateLimitConfig {
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  maxRequestsPerDay: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequestsPerMinute: 5,   // 5 requests per minute
  maxRequestsPerHour: 30,     // 30 requests per hour
  maxRequestsPerDay: 100,     // 100 requests per day
};

const DEMO_CONFIG: RateLimitConfig = {
  maxRequestsPerMinute: 3,   // More restrictive for demo users
  maxRequestsPerHour: 10,
  maxRequestsPerDay: 20,
};

class RateLimiter {
  private records: Map<string, RateLimitRecord[]> = new Map();

  /**
   * Check if a request is allowed for a user
   */
  checkLimit(userEmail: string, isDemo: boolean = false): {
    allowed: boolean;
    reason?: string;
    retryAfter?: number; // seconds until next request allowed
  } {
    const config = isDemo ? DEMO_CONFIG : DEFAULT_CONFIG;
    const now = Date.now();

    // Get user's request history
    let userRecords = this.records.get(userEmail) || [];

    // Clean up old records (older than 24 hours)
    const dayAgo = now - (24 * 60 * 60 * 1000);
    userRecords = userRecords.filter(r => r.timestamp > dayAgo);
    this.records.set(userEmail, userRecords);

    // Check per-minute limit
    const minuteAgo = now - (60 * 1000);
    const recentMinute = userRecords.filter(r => r.timestamp > minuteAgo);
    if (recentMinute.length >= config.maxRequestsPerMinute) {
      const oldestRequest = Math.min(...recentMinute.map(r => r.timestamp));
      const retryAfter = Math.ceil((oldestRequest + 60 * 1000 - now) / 1000);
      return {
        allowed: false,
        reason: `Rate limit exceeded: Maximum ${config.maxRequestsPerMinute} requests per minute. Please try again in ${retryAfter} seconds.`,
        retryAfter,
      };
    }

    // Check per-hour limit
    const hourAgo = now - (60 * 60 * 1000);
    const recentHour = userRecords.filter(r => r.timestamp > hourAgo);
    if (recentHour.length >= config.maxRequestsPerHour) {
      const oldestRequest = Math.min(...recentHour.map(r => r.timestamp));
      const retryAfter = Math.ceil((oldestRequest + 60 * 60 * 1000 - now) / 1000);
      return {
        allowed: false,
        reason: `Rate limit exceeded: Maximum ${config.maxRequestsPerHour} requests per hour. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`,
        retryAfter,
      };
    }

    // Check per-day limit
    if (userRecords.length >= config.maxRequestsPerDay) {
      const oldestRequest = Math.min(...userRecords.map(r => r.timestamp));
      const retryAfter = Math.ceil((oldestRequest + 24 * 60 * 60 * 1000 - now) / 1000);
      return {
        allowed: false,
        reason: `Daily limit exceeded: Maximum ${config.maxRequestsPerDay} requests per day. Please try again in ${Math.ceil(retryAfter / 3600)} hours.`,
        retryAfter,
      };
    }

    return { allowed: true };
  }

  /**
   * Record a successful request
   */
  recordRequest(userEmail: string): void {
    const userRecords = this.records.get(userEmail) || [];
    userRecords.push({ timestamp: Date.now() });
    this.records.set(userEmail, userRecords);

    console.log(`⏱️ Rate limit check passed for ${userEmail}. Recent requests:`, {
      lastMinute: userRecords.filter(r => r.timestamp > Date.now() - 60 * 1000).length,
      lastHour: userRecords.filter(r => r.timestamp > Date.now() - 60 * 60 * 1000).length,
      lastDay: userRecords.length,
    });
  }

  /**
   * Get current usage for a user
   */
  getUsage(userEmail: string): {
    lastMinute: number;
    lastHour: number;
    lastDay: number;
  } {
    const userRecords = this.records.get(userEmail) || [];
    const now = Date.now();

    return {
      lastMinute: userRecords.filter(r => r.timestamp > now - 60 * 1000).length,
      lastHour: userRecords.filter(r => r.timestamp > now - 60 * 60 * 1000).length,
      lastDay: userRecords.length,
    };
  }

  /**
   * Clear rate limit for a user (admin function)
   */
  clearUser(userEmail: string): void {
    this.records.delete(userEmail);
    console.log(`🗑️ Rate limit cleared for ${userEmail}`);
  }

  /**
   * Clear all rate limits (admin function)
   */
  clearAll(): void {
    this.records.clear();
    console.log('🗑️ All rate limits cleared');
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

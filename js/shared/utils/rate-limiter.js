/* ANCHOR: rate_limiter_utility */
/* REUSABLE LOGIC: Rate limiting for API calls and user actions */
/* SCALED FOR: DDoS and spam protection with configurable limits */
/* UPDATED COMMENTS: Session-based rate limiting with sliding window */

/**
 * RateLimiter class - Prevents spam and DDoS attacks
 * CRITICAL: Tracks action timestamps and enforces limits
 * REUSED: Can be used for any action that needs rate limiting
 * 
 * @class RateLimiter
 */
export class RateLimiter {
  constructor(options = {}) {
    // SCALED FOR: Configurable limits per action type
    this.limits = {
      maxAttempts: options.maxAttempts || 10,
      windowMs: options.windowMs || 60000, // 1 minute default
      ...options.limits
    };
    
    // CRITICAL: Store timestamps of actions in memory
    // UPDATED COMMENTS: Map of action types to timestamp arrays
    this.actionHistory = new Map();
  }

  /**
   * Check if action is allowed
   * CRITICAL: Sliding window algorithm for rate limiting
   * UPDATED COMMENTS: Returns true if action is allowed, false if rate limit exceeded
   * 
   * @param {string} actionType - Type of action (e.g., 'send-message')
   * @returns {boolean} - True if action is allowed
   */
  isAllowed(actionType) {
    const now = Date.now();
    const history = this.actionHistory.get(actionType) || [];
    
    // CRITICAL: Remove timestamps outside the time window
    // UPDATED COMMENTS: Sliding window - only keep recent actions
    const recentActions = history.filter(timestamp => {
      return now - timestamp < this.limits.windowMs;
    });
    
    // SCALED FOR: Check if limit exceeded
    if (recentActions.length >= this.limits.maxAttempts) {
      console.warn(`⚠️ Rate limit exceeded for ${actionType}:`, {
        attempts: recentActions.length,
        maxAttempts: this.limits.maxAttempts,
        windowMs: this.limits.windowMs
      });
      return false;
    }
    
    return true;
  }

  /**
   * Record action attempt
   * CRITICAL: Must be called after successful action
   * UPDATED COMMENTS: Adds timestamp to action history
   * 
   * @param {string} actionType - Type of action
   */
  recordAction(actionType) {
    const now = Date.now();
    const history = this.actionHistory.get(actionType) || [];
    
    // CRITICAL: Add current timestamp
    history.push(now);
    
    // SCALED FOR: Clean up old timestamps to prevent memory leak
    const recentActions = history.filter(timestamp => {
      return now - timestamp < this.limits.windowMs;
    });
    
    this.actionHistory.set(actionType, recentActions);
    
    console.log(`✅ Action recorded: ${actionType}`, {
      totalActions: recentActions.length,
      maxAttempts: this.limits.maxAttempts
    });
  }

  /**
   * Get remaining attempts for action type
   * REUSED: Useful for showing user how many attempts left
   * 
   * @param {string} actionType - Type of action
   * @returns {number} - Number of remaining attempts
   */
  getRemainingAttempts(actionType) {
    const now = Date.now();
    const history = this.actionHistory.get(actionType) || [];
    
    // CRITICAL: Count recent actions
    const recentActions = history.filter(timestamp => {
      return now - timestamp < this.limits.windowMs;
    });
    
    return Math.max(0, this.limits.maxAttempts - recentActions.length);
  }

  /**
   * Get time until next attempt is allowed
   * SCALED FOR: User feedback on when they can try again
   * 
   * @param {string} actionType - Type of action
   * @returns {number} - Milliseconds until next attempt allowed (0 if allowed now)
   */
  getTimeUntilNextAttempt(actionType) {
    const now = Date.now();
    const history = this.actionHistory.get(actionType) || [];
    
    // CRITICAL: Get recent actions
    const recentActions = history.filter(timestamp => {
      return now - timestamp < this.limits.windowMs;
    });
    
    // UPDATED COMMENTS: If under limit, can try now
    if (recentActions.length < this.limits.maxAttempts) {
      return 0;
    }
    
    // CRITICAL: Find oldest action in window
    const oldestAction = Math.min(...recentActions);
    const timeUntilExpiry = (oldestAction + this.limits.windowMs) - now;
    
    return Math.max(0, timeUntilExpiry);
  }

  /**
   * Reset rate limit for specific action type
   * REUSED: Useful for testing or admin override
   * 
   * @param {string} actionType - Type of action to reset
   */
  reset(actionType) {
    if (actionType) {
      this.actionHistory.delete(actionType);
      console.log(`🔄 Rate limit reset for: ${actionType}`);
    } else {
      this.actionHistory.clear();
      console.log('🔄 All rate limits reset');
    }
  }

  /**
   * Clear expired entries to prevent memory leak
   * SCALED FOR: Long-running sessions
   */
  cleanup() {
    const now = Date.now();
    
    for (const [actionType, history] of this.actionHistory.entries()) {
      const recentActions = history.filter(timestamp => {
        return now - timestamp < this.limits.windowMs;
      });
      
      if (recentActions.length === 0) {
        this.actionHistory.delete(actionType);
      } else {
        this.actionHistory.set(actionType, recentActions);
      }
    }
  }
}

/**
 * Global rate limiter instance
 * CRITICAL: Singleton pattern for consistent rate limiting across app
 * REUSED: Import this instance in any component that needs rate limiting
 */
export const globalRateLimiter = new RateLimiter({
  maxAttempts: 10,
  windowMs: 60000 // 1 minute
});

// SCALED FOR: Periodic cleanup to prevent memory leaks
// UPDATED COMMENTS: Clean up every 5 minutes
setInterval(() => {
  globalRateLimiter.cleanup();
}, 5 * 60 * 1000);

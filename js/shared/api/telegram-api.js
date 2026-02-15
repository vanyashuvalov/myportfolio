/* ANCHOR: telegram_api */
/* FSD: shared/api → Telegram channel data API client */
/* REUSED: Fetch-based API client with caching and error handling */
/* SCALED FOR: Production use with retry logic and fallbacks */

import { getChannelConfig, getChannelMockData, formatViewCount, formatTimestamp } from '../config/telegram-channels.js';

/**
 * Telegram API Client
 * UPDATED COMMENTS: Client for fetching channel data from Python backend
 * Handles caching, error recovery, and mock data fallbacks
 * 
 * @class TelegramApiClient
 */
export class TelegramApiClient {
  constructor(options = {}) {
    // UPDATED COMMENTS: API configuration with environment detection
    this.baseUrl = options.baseUrl || this.detectApiUrl();
    this.timeout = options.timeout || 10000; // 10 seconds
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000; // 1 second
    
    // REUSED: In-memory cache for API responses
    this.cache = new Map();
    this.cacheTTL = options.cacheTTL || 300000; // 5 minutes
    
    // SCALED FOR: Request tracking and rate limiting
    this.requestQueue = new Map();
    this.lastRequestTime = 0;
    this.minRequestInterval = 100; // 100ms between requests
  }

  /**
   * Detect API URL based on environment
   * UPDATED COMMENTS: Auto-detection for development vs production
   */
  detectApiUrl() {
    // REUSED: Environment detection logic
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:8000';
      } else {
        // SCALED FOR: Production API endpoint
        return 'https://api.your-domain.com';
      }
    }
    
    return 'http://localhost:8000'; // Default fallback
  }

  /**
   * Make HTTP request with retry logic
   * REUSED: Robust HTTP client with error handling
   * 
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} API response
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
    
    // UPDATED COMMENTS: Check cache first
    const cached = this.getCachedResponse(cacheKey);
    if (cached) {
      return cached;
    }
    
    // SCALED FOR: Request deduplication
    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey);
    }
    
    // REUSED: Rate limiting
    await this.enforceRateLimit();
    
    const requestPromise = this.executeRequest(url, options);
    this.requestQueue.set(cacheKey, requestPromise);
    
    try {
      const response = await requestPromise;
      this.setCachedResponse(cacheKey, response);
      return response;
    } finally {
      this.requestQueue.delete(cacheKey);
    }
  }

  /**
   * Execute HTTP request with retry logic
   * UPDATED COMMENTS: Implements exponential backoff retry strategy
   */
  async executeRequest(url, options, attempt = 1) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
      
    } catch (error) {
      // SCALED FOR: Retry logic with exponential backoff
      if (attempt < this.retryAttempts && !error.name === 'AbortError') {
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);
        return this.executeRequest(url, options, attempt + 1);
      }
      
      throw error;
    }
  }

  /**
   * Get channel information
   * REUSED: Channel data fetching with fallback to mock data
   * 
   * @param {string} username - Channel username without @
   * @returns {Promise<Object>} Channel information
   */
  async getChannelInfo(username) {
    try {
      return await this.makeRequest(`/api/channels/${username}`);
    } catch (error) {
      console.warn(`Failed to fetch channel info for ${username}:`, error);
      return this.getMockChannelInfo(username);
    }
  }

  /**
   * Get channel posts
   * UPDATED COMMENTS: Posts fetching with pagination support
   * 
   * @param {string} username - Channel username without @
   * @param {number} limit - Number of posts to fetch (1-20)
   * @returns {Promise<Object>} Channel posts
   */
  async getChannelPosts(username, limit = 5) {
    try {
      return await this.makeRequest(`/api/channels/${username}/posts?limit=${limit}`);
    } catch (error) {
      console.warn(`Failed to fetch posts for ${username}:`, error);
      return this.getMockChannelPosts(username, limit);
    }
  }

  /**
   * Get latest post for widget display
   * SCALED FOR: Widget-optimized data fetching
   * 
   * @param {string} username - Channel username without @
   * @returns {Promise<Object>} Latest post data
   */
  async getLatestPost(username) {
    try {
      return await this.makeRequest(`/api/channels/${username}/latest`);
    } catch (error) {
      console.warn(`Failed to fetch latest post for ${username}:`, error);
      return this.getMockLatestPost(username);
    }
  }

  /**
   * Get all available channels
   * REUSED: Channels list for configuration and selection
   */
  async getAllChannels() {
    try {
      return await this.makeRequest('/api/channels');
    } catch (error) {
      console.warn('Failed to fetch channels list:', error);
      return this.getMockChannelsList();
    }
  }

  /**
   * Check API health
   * UPDATED COMMENTS: Health check for monitoring and debugging
   */
  async checkHealth() {
    try {
      return await this.makeRequest('/health');
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // ANCHOR: cache_management
  /**
   * Get cached response if not expired
   * REUSED: Cache management utilities
   */
  getCachedResponse(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    
    if (cached) {
      this.cache.delete(key); // Clean expired cache
    }
    
    return null;
  }

  /**
   * Set cached response with timestamp
   * UPDATED COMMENTS: Cache storage with TTL tracking
   */
  setCachedResponse(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // SCALED FOR: Memory management - limit cache size
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Clear all cached responses
   * REUSABLE LOGIC: Cache invalidation
   */
  clearCache() {
    this.cache.clear();
  }

  // ANCHOR: rate_limiting
  /**
   * Enforce rate limiting between requests
   * SCALED FOR: API rate limit compliance
   */
  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      await this.sleep(this.minRequestInterval - timeSinceLastRequest);
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Sleep utility for delays
   * REUSED: Promise-based delay utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ANCHOR: mock_data
  /**
   * Mock channel info for development/fallback
   * UPDATED COMMENTS: Realistic mock data using channel configuration
   */
  getMockChannelInfo(username) {
    const channelConfig = getChannelConfig(username);
    const mockData = getChannelMockData(username);
    
    return {
      channel: {
        username: username,
        title: channelConfig.displayName,
        description: channelConfig.description,
        subscribers_count: mockData.stats.subscribers,
        verified: channelConfig.verified
      },
      last_updated: new Date().toISOString(),
      posts_available: mockData.stats.posts_count,
      mock_data: true
    };
  }

  /**
   * Mock channel posts for development/fallback
   * REUSED: Mock data generation with realistic structure from configuration
   */
  getMockChannelPosts(username, limit) {
    const channelConfig = getChannelConfig(username);
    const mockData = getChannelMockData(username);
    
    // UPDATED COMMENTS: Generate multiple mock posts based on configuration
    const mockPosts = [
      {
        id: 123,
        text: mockData.latestPost.text,
        views: mockData.latestPost.views,
        forwards: Math.floor(mockData.latestPost.views * 0.05),
        replies: Math.floor(mockData.latestPost.views * 0.02),
        formatted_date: formatTimestamp(mockData.latestPost.date),
        formatted_views: formatViewCount(mockData.latestPost.views),
        link: mockData.latestPost.link
      },
      {
        id: 122,
        text: 'новый проект в портфолио - редизайн медицинской системы',
        views: Math.floor(mockData.stats.avg_views * 0.8),
        forwards: Math.floor(mockData.stats.avg_views * 0.04),
        replies: Math.floor(mockData.stats.avg_views * 0.015),
        formatted_date: '1d ago',
        formatted_views: formatViewCount(Math.floor(mockData.stats.avg_views * 0.8)),
        link: `https://t.me/${username}/122`
      }
    ];

    return {
      posts: mockPosts.slice(0, limit),
      channel: username,
      total_returned: Math.min(mockPosts.length, limit),
      last_updated: new Date().toISOString(),
      mock_data: true
    };
  }

  /**
   * Mock latest post for widget display
   * SCALED FOR: Widget-specific mock data with real channel configuration
   */
  getMockLatestPost(username) {
    const channelConfig = getChannelConfig(username);
    const mockData = getChannelMockData(username);
    
    return {
      channel: {
        username: username,
        title: channelConfig.displayName,
        avatar_url: channelConfig.avatar,
        description: channelConfig.description,
        verified: channelConfig.verified
      },
      latest_post: {
        text: mockData.latestPost.text,
        views: mockData.latestPost.views,
        formatted_date: formatTimestamp(mockData.latestPost.date),
        formatted_views: formatViewCount(mockData.latestPost.views),
        link: mockData.latestPost.link
      },
      last_updated: new Date().toISOString(),
      mock_data: true
    };
  }

  /**
   * Mock channels list
   * UPDATED COMMENTS: Mock data using real channel configurations
   */
  getMockChannelsList() {
    const channelConfig1 = getChannelConfig('vanyashuvalov');
    const channelConfig2 = getChannelConfig('designchannel');
    const mockData1 = getChannelMockData('vanyashuvalov');
    const mockData2 = getChannelMockData('designchannel');
    
    return {
      channels: [
        {
          username: 'vanyashuvalov',
          title: channelConfig1.displayName,
          description: channelConfig1.description,
          subscribers_count: mockData1.stats.subscribers,
          verified: channelConfig1.verified,
          posts_count: mockData1.stats.posts_count
        },
        {
          username: 'designchannel',
          title: channelConfig2.displayName,
          description: channelConfig2.description,
          subscribers_count: mockData2.stats.subscribers,
          verified: channelConfig2.verified,
          posts_count: mockData2.stats.posts_count
        }
      ],
      total: 2,
      last_updated: new Date().toISOString(),
      mock_data: true
    };
  }
}

// REUSED: Singleton instance for global use
export const telegramApi = new TelegramApiClient();

// ANCHOR: utility_functions - moved to telegram-channels.js config
// REUSED: Import formatViewCount and formatTimestamp from config
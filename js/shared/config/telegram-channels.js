/* ANCHOR: telegram_channels_config */
/* FSD: shared/config → Telegram channels configuration */
/* REUSED: Centralized channel data management */
/* SCALED FOR: Multiple channels with real data */

/**
 * Telegram Channels Configuration
 * UPDATED COMMENTS: Real channel data for widgets and API integration
 * Contains channel usernames, display names, and mock data for development
 * 
 * @constant {Object} TELEGRAM_CHANNELS
 */
export const TELEGRAM_CHANNELS = {
  // ANCHOR: main_channels
  vanyashuvalov: {
    username: 'vanyashuvalov',
    displayName: 'Ваня Кнопочкин',
    description: 'Product Designer & Creative',
    url: 'https://t.me/vanyashuvalov',
    avatar: 'assets/images/telegram-avatar.jpg',
    verified: false,
    
    // UPDATED COMMENTS: Mock data for development when API unavailable
    mockData: {
      latestPost: {
        text: 'москва газ соревнования по счету в уме',
        views: 43,
        date: '2026-02-04T10:30:00Z',
        formatted_date: '2h ago',
        formatted_views: '43',
        link: 'https://t.me/vanyashuvalov/123'
      },
      stats: {
        subscribers: 1250,
        posts_count: 87,
        avg_views: 156
      }
    }
  },
  
  // ANCHOR: additional_channels
  vanya_knopochkin: {
    username: 'vanya_knopochkin',
    displayName: 'Ваня Кнопочкин',
    description: 'Vanya Knopochkin Channel',
    url: 'https://t.me/vanya_knopochkin',
    avatar: null,
    verified: false,
    
    // REUSED: Mock data structure
    mockData: {
      latestPost: {
        text: 'новый пост в канале',
        views: 125,
        date: '2026-02-14T09:00:00Z',
        formatted_date: '3h ago',
        formatted_views: '125',
        link: 'https://t.me/vanya_knopochkin/1'
      },
      stats: {
        subscribers: 850,
        posts_count: 45,
        avg_views: 200
      }
    }
  },
  
  designchannel: {
    username: 'designchannel',
    displayName: 'Design Channel',
    description: 'UI/UX Design Inspiration',
    url: 'https://t.me/designchannel',
    avatar: null,
    verified: true,
    
    // REUSED: Mock data structure
    mockData: {
      latestPost: {
        text: 'новые тренды в дизайне интерфейсов 2026',
        views: 2847,
        date: '2026-02-04T08:15:00Z',
        formatted_date: '4h ago',
        formatted_views: '2.8K',
        link: 'https://t.me/designchannel/456'
      },
      stats: {
        subscribers: 15600,
        posts_count: 342,
        avg_views: 3200
      }
    }
  }
};

/**
 * Default channel configuration
 * SCALED FOR: Fallback when specific channel not found
 */
export const DEFAULT_CHANNEL_CONFIG = {
  username: 'unknown',
  displayName: 'Unknown Channel',
  description: 'Channel information unavailable',
  url: 'https://t.me/',
  avatar: null,
  verified: false,
  mockData: {
    latestPost: {
      text: 'Channel data loading...',
      views: 0,
      date: new Date().toISOString(),
      formatted_date: 'Loading...',
      formatted_views: '0',
      link: '#'
    },
    stats: {
      subscribers: 0,
      posts_count: 0,
      avg_views: 0
    }
  }
};

/**
 * Get channel configuration by username
 * REUSED: Channel data retrieval utility
 * 
 * @param {string} username - Channel username without @
 * @returns {Object} Channel configuration object
 */
export function getChannelConfig(username) {
  return TELEGRAM_CHANNELS[username] || {
    ...DEFAULT_CHANNEL_CONFIG,
    username: username,
    displayName: username.charAt(0).toUpperCase() + username.slice(1),
    url: `https://t.me/${username}`
  };
}

/**
 * Get all configured channels
 * UPDATED COMMENTS: Returns array of all channel configurations
 * 
 * @returns {Array} Array of channel objects with usernames as keys
 */
export function getAllChannels() {
  return Object.entries(TELEGRAM_CHANNELS).map(([username, config]) => ({
    username,
    ...config
  }));
}

/**
 * Get channel mock data for development
 * SCALED FOR: Development workflow without API dependencies
 * 
 * @param {string} username - Channel username
 * @returns {Object} Mock data object
 */
export function getChannelMockData(username) {
  const config = getChannelConfig(username);
  return config.mockData;
}

/**
 * Format view count for display
 * REUSABLE LOGIC: Number formatting utility
 * 
 * @param {number} views - View count number
 * @returns {string} Formatted view count
 */
export function formatViewCount(views) {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  } else {
    return views.toString();
  }
}

/**
 * Format timestamp for display
 * UPDATED COMMENTS: Human-readable time formatting
 * 
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted time string
 */
export function formatTimestamp(dateString) {
  if (!dateString) return 'Unknown';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  } catch (error) {
    return 'Unknown';
  }
}

/**
 * Validate channel username format
 * CRITICAL: Input validation for security
 * 
 * @param {string} username - Channel username to validate
 * @returns {boolean} True if valid username format
 */
export function isValidChannelUsername(username) {
  if (!username || typeof username !== 'string') return false;
  
  // UPDATED COMMENTS: Telegram username validation rules
  // - 5-32 characters
  // - Can contain a-z, 0-9, and underscores
  // - Must start with a letter
  // - Cannot end with underscore
  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{4,31}[a-zA-Z0-9]$/;
  return usernameRegex.test(username);
}
/* ANCHOR: social_links_config */
/* FSD: shared/config → centralized social media and contact links */
/* REUSED: Single source of truth for all external links */
/* CRITICAL: All social links must be managed here, nowhere else */

/**
 * Social Links Configuration
 * Centralized configuration for all social media and contact links
 * Used across widgets, navigation, and other components
 * 
 * @constant {Object} SOCIAL_LINKS
 */
export const SOCIAL_LINKS = {
  // ANCHOR: primary_contacts
  telegram: {
    url: 'https://t.me/vanyashuvalov',
    username: '@vanyashuvalov',
    displayName: 'Telegram',
    icon: 'telegram' // References icon-park-outline_telegram.svg
  },
  
  email: {
    url: 'mailto:intjivan@gmail.com',
    address: 'intjivan@gmail.com',
    displayName: 'Email',
    icon: 'email'
  },
  
  // ANCHOR: professional_links
  linkedin: {
    url: 'https://linkedin.com/in/ivanshuvalov',
    username: 'ivanshuvalov',
    displayName: 'LinkedIn',
    icon: 'linkedin'
  },
  
  github: {
    url: 'https://github.com/ivanshuvalov',
    username: 'ivanshuvalov',
    displayName: 'GitHub',
    icon: 'github'
  },
  
  // ANCHOR: portfolio_links
  portfolio: {
    url: 'https://ivanshuvalov.design',
    displayName: 'Portfolio',
    icon: 'external-link'
  },
  
  resume: {
    url: '/assets/documents/ivan-shuvalov-resume.pdf',
    displayName: 'Resume PDF',
    icon: 'download'
  },
  
  // ANCHOR: telegram_channels
  // CRITICAL: Telegram channel configuration for widgets
  telegramChannel: {
    username: 'vanya_knopochkin', // Channel username without @
    url: 'https://t.me/vanya_knopochkin',
    displayName: 'Telegram Channel',
    icon: 'telegram'
  }
};

/**
 * Icon paths configuration
 * Maps icon names to their file paths in assets
 * 
 * @constant {Object} ICON_PATHS
 */
export const ICON_PATHS = {
  telegram: '/assets/icons/icon-park-outline_telegram.svg',
  email: '/assets/icons/iconamoon_email-fill.svg',
  linkedin: '/assets/icons/mdi_linkedin.svg',
  github: '/assets/icons/mdi_github.svg',
  download: '/assets/icons/iconamoon_download.svg',
  copy: '/assets/icons/iconamoon_copy.svg',
  'external-link': '/assets/icons/iconamoon_arrow-down-2.svg'
};

/**
 * Get social link by key
 * REUSED: Utility function for accessing social links
 * 
 * @param {string} key - Social link key
 * @returns {Object|null} Social link object or null if not found
 */
export function getSocialLink(key) {
  return SOCIAL_LINKS[key] || null;
}

/**
 * Get icon path by key
 * SCALED FOR: Icon path resolution utility
 * 
 * @param {string} key - Icon key
 * @returns {string|null} Icon path or null if not found
 */
export function getIconPath(key) {
  return ICON_PATHS[key] || null;
}

/**
 * Get all social links as array
 * UPDATED COMMENTS: Utility for iterating over all social links
 * 
 * @returns {Array} Array of social link objects with keys
 */
export function getAllSocialLinks() {
  return Object.entries(SOCIAL_LINKS).map(([key, link]) => ({
    key,
    ...link
  }));
}
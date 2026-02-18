/* ANCHOR: toast_messages_config */
/* REUSABLE LOGIC: Centralized toast message texts for i18n support */
/* SCALED FOR: Multiple message types, easy localization */
/* UPDATED COMMENTS: All toast notification texts in one place */

/**
 * Toast message texts - centralized configuration
 * CRITICAL: All user-facing toast messages defined here for easy maintenance
 * REUSED: Across all components that trigger notifications
 * 
 * @constant {Object} TOAST_MESSAGES
 */
export const TOAST_MESSAGES = {
  // Contact form messages
  MESSAGE_SENT: 'Message sent, thank you!',
  MESSAGE_ERROR: 'Failed to send message. Please try again',
  MESSAGE_TOO_SHORT: 'Message must be at least 10 characters',
  CONTACT_REQUIRED: 'Please provide contact information',
  CONTACT_TOO_SHORT: 'Contact info must be at least 5 characters',
  RATE_LIMIT_EXCEEDED: 'You have sent too many messages. Please wait a moment',
  
  // Share/Copy messages
  RESUME_COPIED: 'Resume copied to clipboard',
  EMAIL_COPIED: 'Email copied to clipboard',
  COPY_ERROR: 'Failed to copy',
  
  // Future messages (examples)
  CAT_FED: 'Cat is happy! Meow~',
  PROJECT_SAVED: 'Project saved successfully',
  THEME_CHANGED: 'Theme updated',
  COPY_SUCCESS: 'Copied to clipboard'
};

/**
 * Toast type constants for styling and icons
 * UPDATED COMMENTS: Type system for different notification styles
 * 
 * @constant {Object} TOAST_TYPES
 */
export const TOAST_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning'
};

/**
 * Toast icon paths by type
 * REUSED: Icon system from existing assets
 * 
 * @constant {Object} TOAST_ICONS
 */
export const TOAST_ICONS = {
  [TOAST_TYPES.INFO]: 'assets/icons/iconamoon_information-circle.svg',
  [TOAST_TYPES.SUCCESS]: 'assets/icons/iconamoon_information-circle.svg', // Same icon, different color
  [TOAST_TYPES.ERROR]: 'assets/icons/iconamoon_information-circle.svg',
  [TOAST_TYPES.WARNING]: 'assets/icons/iconamoon_information-circle.svg'
};

/**
 * Toast colors by type
 * UPDATED COMMENTS: Color system matching design palette
 * 
 * @constant {Object} TOAST_COLORS
 */
export const TOAST_COLORS = {
  [TOAST_TYPES.INFO]: '#C248A3',      // Pink from modal
  [TOAST_TYPES.SUCCESS]: '#10B981',   // Green from variables
  [TOAST_TYPES.ERROR]: '#EF4444',     // Red from variables
  [TOAST_TYPES.WARNING]: '#F59E0B'    // Orange from variables
};

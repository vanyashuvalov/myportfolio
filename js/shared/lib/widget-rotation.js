/* ANCHOR: widget_rotation */
/* REUSED: Universal widget rotation system */
/* SCALED FOR: Consistent rotation values across all widget instances */

/**
 * Widget Rotation System - Centralized rotation management
 * Provides individual rotation angles for each widget type
 * 
 * @module WidgetRotation
 */

/**
 * Get individual rotation angle for specific widget type
 * UPDATED COMMENTS: Each widget type has its own carefully chosen rotation
 * REUSED: Single source of truth for all widget rotation values
 * 
 * @param {string} widgetType - Type of widget (clock, sticker, resume, etc.)
 * @returns {number} Rotation angle in degrees
 */
export function getWidgetRotation(widgetType) {
  // CRITICAL: Individual rotation angles for each widget type
  const widgetRotations = {
    'clock': 0,        // Clock needs to be perfectly straight for readability
    'sticker': -1,     // Slight left tilt for casual note appearance (UPDATED: -2° → -1°)
    'resume': 1,       // Slight right tilt for document realism
    'folder': -1,      // Slight left tilt for natural folder placement
    'cat': 0,          // Cat should be level for proper animation
    'feed-button': 2   // Slight right tilt for button dynamics
  };
  
  // SCALED FOR: Return specific rotation or default to 0
  return widgetRotations[widgetType] || 0;
}

/**
 * Get all available widget types and their rotations
 * UPDATED COMMENTS: Utility for debugging and widget management
 * 
 * @returns {Object} Map of widget types to rotation angles
 */
export function getAllWidgetRotations() {
  return {
    'clock': 0,
    'sticker': -1,     // UPDATED: Changed from -2° to -1°
    'resume': 1,
    'folder': -1,
    'cat': 0,
    'feed-button': 2
  };
}

/**
 * Validate widget rotation angle
 * REUSED: Input validation for rotation values
 * 
 * @param {number} rotation - Rotation angle to validate
 * @returns {boolean} True if rotation is valid
 */
export function isValidRotation(rotation) {
  return typeof rotation === 'number' && 
         rotation >= -10 && 
         rotation <= 10 && 
         !isNaN(rotation);
}

// REUSABLE LOGIC: Export rotation constants for external use
export const WIDGET_ROTATIONS = {
  CLOCK: 0,
  STICKER: -1,       // UPDATED: Changed from -2 to -1 degrees
  RESUME: 1,
  FOLDER: -1,
  CAT: 0,
  FEED_BUTTON: 2
};
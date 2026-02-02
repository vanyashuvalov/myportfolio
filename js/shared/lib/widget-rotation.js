/* ANCHOR: widget_rotation */
/* REUSED: Universal widget rotation system */
/* SCALED FOR: Consistent rotation values across all widget instances */

/**
 * Widget Rotation System - Centralized rotation management
 * Provides individual rotation angles for each widget type
 * 
 * @module WidgetRotation
 */

// REUSABLE LOGIC: Single source of truth for all widget rotation values
// UPDATED COMMENTS: Centralized rotation constants - no duplication
export const WIDGET_ROTATIONS = {
  'clock': 0,        // Clock needs to be perfectly straight for readability
  'sticker': -1,     // Slight left tilt for casual note appearance
  'resume': 1,       // Slight right tilt for document realism
  'folder': -1,      // Slight left tilt for natural folder placement
  'cat': 0,          // Cat should be level for proper animation
  'feed-button': 2   // Slight right tilt for button dynamics
};

/**
 * Get individual rotation angle for specific widget type
 * UPDATED COMMENTS: Uses WIDGET_ROTATIONS constants - no duplication
 * REUSED: Single source of truth for all widget rotation values
 * 
 * @param {string} widgetType - Type of widget (clock, sticker, resume, etc.)
 * @returns {number} Rotation angle in degrees
 */
export function getWidgetRotation(widgetType) {
  // CRITICAL: Use constants to avoid duplication
  return WIDGET_ROTATIONS[widgetType] || 0;
}

/**
 * Get all available widget types and their rotations
 * UPDATED COMMENTS: Returns the constants object directly - no duplication
 * 
 * @returns {Object} Map of widget types to rotation angles
 */
export function getAllWidgetRotations() {
  // REUSED: Return constants object directly
  return { ...WIDGET_ROTATIONS };
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
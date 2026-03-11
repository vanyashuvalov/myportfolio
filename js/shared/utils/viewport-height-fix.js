/* ANCHOR: viewport_height_fix */
/* REUSABLE LOGIC: iOS Safari viewport height fix */
/* SCALED FOR: Dynamic viewport height calculation for iOS Safari */
/* UPDATED COMMENTS: Handles iOS Safari address bar show/hide behavior */

/**
 * ViewportHeightFix - Calculates and updates real viewport height for iOS Safari
 * 
 * iOS Safari's viewport height changes when address bar shows/hides.
 * This utility sets a CSS custom property with the actual viewport height.
 * 
 * Usage in CSS:
 * .element {
 *   height: var(--app-height, 100vh); // fallback to 100vh
 * }
 * 
 * @class ViewportHeightFix
 */
export class ViewportHeightFix {
  constructor() {
    this.isInitialized = false;
    this.rafId = null;
    
    // CRITICAL: Bind methods for event listeners
    this.handleResize = this.handleResize.bind(this);
    this.updateHeight = this.updateHeight.bind(this);
  }

  /**
   * Initialize viewport height fix
   * UPDATED COMMENTS: Sets up resize listener and initial height
   * CRITICAL: Completely disabled on iOS - viewport-fit=cover handles it better
   */
  init() {
    // CRITICAL: Skip initialization entirely on iOS devices
    // UPDATED COMMENTS: iOS Safari with viewport-fit=cover doesn't need JS height calculation
    // REF: https://webkit.org/blog/7929/designing-websites-for-iphone-x/
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (isIOS) {
      console.log('✓ ViewportHeightFix: Skipped on iOS (viewport-fit=cover handles viewport)');
      // CRITICAL: Remove any existing inline styles that might have been set
      document.documentElement.style.removeProperty('--app-height');
      document.documentElement.style.removeProperty('--app-width');
      
      // CRITICAL: Set interval to continuously remove inline styles on iOS
      // UPDATED COMMENTS: Aggressive cleanup every 100ms to prevent any JS from setting them
      this.iosCleanupInterval = setInterval(() => {
        const htmlStyle = document.documentElement.style;
        if (htmlStyle.getPropertyValue('--app-height') || htmlStyle.getPropertyValue('--app-width')) {
          console.warn('⚠️ Removing inline viewport styles on iOS (cleanup interval)');
          htmlStyle.removeProperty('--app-height');
          htmlStyle.removeProperty('--app-width');
        }
      }, 100);
      
      return;
    }
    
    if (this.isInitialized) {
      console.warn('ViewportHeightFix already initialized');
      return;
    }

    // CRITICAL: Set initial height
    this.updateHeight();

    // SCALED FOR: Debounced resize handling with RAF
    window.addEventListener('resize', this.handleResize);
    
    // UPDATED COMMENTS: Also update on orientation change
    window.addEventListener('orientationchange', this.handleResize);

    this.isInitialized = true;
  }

  /**
   * Handle resize event with RAF debouncing
   * SCALED FOR: Performance optimization with requestAnimationFrame
   * CRITICAL: Skip on iOS devices
   */
  handleResize() {
    // CRITICAL: Double-check iOS on every resize (safety check)
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (isIOS) {
      // CRITICAL: Remove any inline styles if they somehow got set
      document.documentElement.style.removeProperty('--app-height');
      document.documentElement.style.removeProperty('--app-width');
      return;
    }
    
    // CRITICAL: Cancel previous RAF if exists
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }

    // UPDATED COMMENTS: Schedule update on next frame
    this.rafId = requestAnimationFrame(this.updateHeight);
  }

  /**
   * Update CSS custom property with current viewport height
   * CRITICAL: Uses window.innerHeight for accurate iOS Safari height
   * UPDATED COMMENTS: Disabled on iOS - viewport-fit=cover + safe-area-inset handle it better
   */
  updateHeight() {
    // CRITICAL: Skip on iOS devices - viewport-fit=cover handles viewport properly
    // UPDATED COMMENTS: iOS Safari with viewport-fit=cover doesn't need JS height calculation
    // REF: https://webkit.org/blog/7929/designing-websites-for-iphone-x/
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (isIOS) {
      // CRITICAL: On iOS, remove any existing --app-height to let CSS handle it
      document.documentElement.style.removeProperty('--app-height');
      document.documentElement.style.removeProperty('--app-width');
      return;
    }
    
    // CRITICAL: Get actual viewport height (accounts for iOS Safari bars)
    const vh = window.innerHeight;
    
    // UPDATED COMMENTS: Set CSS custom property on document root
    document.documentElement.style.setProperty('--app-height', `${vh}px`);
    
    // SCALED FOR: Also set viewport width for completeness
    const vw = window.innerWidth;
    document.documentElement.style.setProperty('--app-width', `${vw}px`);
    
    // Clear RAF ID
    this.rafId = null;
  }

  /**
   * Destroy viewport height fix and clean up
   * REUSED: Standard cleanup pattern
   */
  destroy() {
    if (!this.isInitialized) return;

    // CRITICAL: Remove event listeners
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('orientationchange', this.handleResize);

    // Cancel pending RAF
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    // CRITICAL: Clear iOS cleanup interval if exists
    if (this.iosCleanupInterval) {
      clearInterval(this.iosCleanupInterval);
      this.iosCleanupInterval = null;
    }

    // Remove CSS custom properties
    document.documentElement.style.removeProperty('--app-height');
    document.documentElement.style.removeProperty('--app-width');

    this.isInitialized = false;
  }

  /**
   * Get current viewport height
   * REUSED: Utility method for external access
   * @returns {number} Current viewport height in pixels
   */
  getHeight() {
    return window.innerHeight;
  }

  /**
   * Get current viewport width
   * REUSED: Utility method for external access
   * @returns {number} Current viewport width in pixels
   */
  getWidth() {
    return window.innerWidth;
  }
}

// ANCHOR: singleton_instance
// REUSED: Singleton pattern for global viewport height fix
let instance = null;

/**
 * Get singleton instance of ViewportHeightFix
 * SCALED FOR: Single instance across entire application
 * @returns {ViewportHeightFix} Singleton instance
 */
export function getViewportHeightFix() {
  if (!instance) {
    instance = new ViewportHeightFix();
  }
  return instance;
}

/**
 * Initialize viewport height fix (convenience function)
 * REUSED: Simple initialization for common use case
 */
export function initViewportHeightFix() {
  const fix = getViewportHeightFix();
  fix.init();
  return fix;
}

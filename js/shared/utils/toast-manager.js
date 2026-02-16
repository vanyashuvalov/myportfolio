/* ANCHOR: toast_manager */
/* REUSABLE LOGIC: Global toast notification manager (singleton pattern) */
/* SCALED FOR: Multiple simultaneous toasts, queue management, memory efficiency */
/* UPDATED COMMENTS: Centralized toast system for entire application */

// ## ANCHOR POINTS
// ENTRY: ToastManager singleton instance
// MAIN LOGIC: Queue management, toast lifecycle, positioning
// EXPORTS: toastManager singleton
// DEPENDENCIES: Toast class, toast-messages config
// TODOs: Add position variants (top-right, top-left, etc.)

import { Toast } from '../ui/toast/toast.js';
import { TOAST_TYPES } from '../ui/toast/toast-messages.js';

/**
 * ToastManager class - Global toast notification system
 * UPDATED COMMENTS: Singleton pattern for centralized toast management
 * REUSED: Across all components that need to show notifications
 * SCALED FOR: Multiple simultaneous toasts with automatic stacking
 * 
 * @class ToastManager
 */
class ToastManager {
  constructor() {
    // CRITICAL: Singleton pattern - prevent multiple instances
    if (ToastManager.instance) {
      return ToastManager.instance;
    }
    
    this.container = null;
    this.toasts = new Set(); // SCALED FOR: Efficient toast tracking
    this.maxToasts = 5; // UPDATED COMMENTS: Limit simultaneous toasts
    
    this.init();
    
    ToastManager.instance = this;
  }

  /**
   * Initialize toast container
   * UPDATED COMMENTS: Create container if not exists, append to body
   * CRITICAL: Container created once and reused for all toasts
   */
  init() {
    // REUSED: Check if container already exists
    this.container = document.querySelector('.toast-container');
    
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      this.container.setAttribute('aria-live', 'polite');
      this.container.setAttribute('aria-atomic', 'false');
      document.body.appendChild(this.container);
    }
  }

  /**
   * Show toast notification
   * UPDATED COMMENTS: Main method for displaying toasts
   * SCALED FOR: Automatic queue management and overflow handling
   * 
   * @param {string} message - Toast message text
   * @param {Object} options - Toast configuration options
   * @param {string} options.type - Toast type (info, success, error, warning)
   * @param {number} options.duration - Auto-dismiss duration in ms (default: 3000)
   * @param {string} options.icon - Custom icon path (optional)
   * @returns {Toast} Toast instance
   */
  show(message, options = {}) {
    // CRITICAL: Enforce max toasts limit
    if (this.toasts.size >= this.maxToasts) {
      // UPDATED COMMENTS: Remove oldest toast to make room
      const oldestToast = this.toasts.values().next().value;
      if (oldestToast) {
        oldestToast.dismiss();
      }
    }

    // UPDATED COMMENTS: Create toast instance with dismiss callback
    const toast = new Toast(message, {
      ...options,
      onDismiss: (dismissedToast) => {
        // CRITICAL: Remove from tracking set
        this.toasts.delete(dismissedToast);
        
        // UPDATED COMMENTS: Call user's onDismiss if provided
        if (options.onDismiss) {
          options.onDismiss(dismissedToast);
        }
      }
    });

    // UPDATED COMMENTS: Create and append toast element
    const toastElement = toast.createElement();
    this.container.appendChild(toastElement);

    // CRITICAL: Track toast instance
    this.toasts.add(toast);

    // UPDATED COMMENTS: Show toast with animation
    toast.show();

    return toast;
  }

  /**
   * Show info toast
   * REUSED: Convenience method for common toast type
   * 
   * @param {string} message - Toast message text
   * @param {Object} options - Additional options
   * @returns {Toast} Toast instance
   */
  showInfo(message, options = {}) {
    return this.show(message, {
      ...options,
      type: TOAST_TYPES.INFO
    });
  }

  /**
   * Show success toast
   * REUSED: Convenience method for success notifications
   * 
   * @param {string} message - Toast message text
   * @param {Object} options - Additional options
   * @returns {Toast} Toast instance
   */
  showSuccess(message, options = {}) {
    return this.show(message, {
      ...options,
      type: TOAST_TYPES.SUCCESS
    });
  }

  /**
   * Show error toast
   * REUSED: Convenience method for error notifications
   * UPDATED COMMENTS: Longer duration for errors (5s vs 3s)
   * 
   * @param {string} message - Toast message text
   * @param {Object} options - Additional options
   * @returns {Toast} Toast instance
   */
  showError(message, options = {}) {
    return this.show(message, {
      duration: 5000, // UPDATED COMMENTS: Errors stay longer
      ...options,
      type: TOAST_TYPES.ERROR
    });
  }

  /**
   * Show warning toast
   * REUSED: Convenience method for warning notifications
   * 
   * @param {string} message - Toast message text
   * @param {Object} options - Additional options
   * @returns {Toast} Toast instance
   */
  showWarning(message, options = {}) {
    return this.show(message, {
      duration: 4000, // UPDATED COMMENTS: Warnings stay slightly longer
      ...options,
      type: TOAST_TYPES.WARNING
    });
  }

  /**
   * Dismiss all toasts
   * SCALED FOR: Bulk operations, cleanup on navigation
   */
  dismissAll() {
    // UPDATED COMMENTS: Create array copy to avoid Set modification during iteration
    const toastsArray = Array.from(this.toasts);
    toastsArray.forEach(toast => toast.dismiss());
  }

  /**
   * Clear all toasts immediately without animation
   * CRITICAL: Emergency cleanup, memory leak prevention
   */
  clearAll() {
    const toastsArray = Array.from(this.toasts);
    toastsArray.forEach(toast => toast.destroy());
    this.toasts.clear();
    
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  /**
   * Get active toast count
   * REUSED: For debugging and testing
   * 
   * @returns {number} Number of active toasts
   */
  getActiveCount() {
    return this.toasts.size;
  }

  /**
   * Destroy toast manager and cleanup
   * SCALED FOR: Memory management, SPA navigation
   */
  destroy() {
    this.clearAll();
    
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    this.container = null;
    ToastManager.instance = null;
  }
}

// ANCHOR: singleton_export
// CRITICAL: Export singleton instance, not class
// REUSED: Single instance across entire application
export const toastManager = new ToastManager();

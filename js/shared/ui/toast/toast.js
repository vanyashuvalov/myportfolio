/* ANCHOR: toast_component */
/* REUSED: Modal animation patterns and design system */
/* SCALED FOR: Smooth animations, accessibility, auto-dismiss */
/* UPDATED COMMENTS: Toast notification component with lifecycle management */

import { TOAST_TYPES, TOAST_ICONS, TOAST_COLORS } from './toast-messages.js';

/**
 * Toast class - Individual toast notification instance
 * UPDATED COMMENTS: Handles single toast lifecycle, animations, and interactions
 * REUSED: Animation patterns from modal system
 * 
 * @class Toast
 */
export class Toast {
  /**
   * Create a toast notification
   * 
   * @param {string} message - Toast message text
   * @param {Object} options - Configuration options
   * @param {string} options.type - Toast type (info, success, error, warning)
   * @param {number} options.duration - Auto-dismiss duration in ms (default: 3000)
   * @param {string} options.icon - Custom icon path (optional)
   * @param {Function} options.onDismiss - Callback when toast is dismissed
   */
  constructor(message, options = {}) {
    this.message = message;
    this.options = {
      type: TOAST_TYPES.INFO,
      duration: 3000,
      icon: null,
      onDismiss: null,
      ...options
    };
    
    this.element = null;
    this.dismissTimer = null;
    this.isVisible = false;
    this.isDismissing = false;
  }

  /**
   * Create toast DOM element
   * UPDATED COMMENTS: Build toast HTML with icon and text
   * REUSED: SVG icon system from modal
   * 
   * @returns {HTMLElement} Toast element
   */
  createElement() {
    const toast = document.createElement('div');
    toast.className = `toast toast--${this.options.type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('aria-atomic', 'true');
    
    // ANCHOR: toast_icon
    const iconContainer = document.createElement('div');
    iconContainer.className = 'toast__icon';
    
    // UPDATED COMMENTS: Load icon SVG inline for color control
    const iconPath = this.options.icon || TOAST_ICONS[this.options.type];
    this.loadIcon(iconContainer, iconPath);
    
    // ANCHOR: toast_text
    const textElement = document.createElement('div');
    textElement.className = 'toast__text';
    textElement.textContent = this.message;
    
    toast.appendChild(iconContainer);
    toast.appendChild(textElement);
    
    // CRITICAL: Click to dismiss
    toast.addEventListener('click', () => this.dismiss());
    
    this.element = toast;
    return toast;
  }

  /**
   * Load SVG icon inline
   * SCALED FOR: Async icon loading with fallback
   * CRITICAL: Remove hardcoded stroke colors to allow CSS styling
   * 
   * @param {HTMLElement} container - Icon container element
   * @param {string} iconPath - Path to SVG icon
   */
  async loadIcon(container, iconPath) {
    try {
      const response = await fetch(iconPath);
      if (!response.ok) throw new Error('Icon not found');
      
      let svgText = await response.text();
      
      // CRITICAL: Remove hardcoded stroke colors from SVG to allow CSS control
      // UPDATED COMMENTS: Replace stroke="white" or stroke="any-color" with empty string
      svgText = svgText.replace(/stroke="[^"]*"/g, '');
      
      container.innerHTML = svgText;
    } catch (error) {
      // UPDATED COMMENTS: Fallback to simple circle if icon fails
      console.warn('Toast icon failed to load:', error);
      container.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke-width="2"/>
          <path d="M12 8v4M12 16h.01" stroke-width="3" stroke-linejoin="round"/>
        </svg>
      `;
    }
  }

  /**
   * Show toast with animation
   * CRITICAL: Force reflow to ensure animation triggers
   * REUSED: Animation pattern from modal system
   */
  show() {
    if (this.isVisible) return;
    
    // CRITICAL: Force browser to compute initial state before animation
    this.element.offsetHeight;
    
    // SCALED FOR: Smooth appearance animation
    requestAnimationFrame(() => {
      this.element.classList.add('toast--visible');
      this.isVisible = true;
    });
    
    // UPDATED COMMENTS: Auto-dismiss after duration
    if (this.options.duration > 0) {
      this.dismissTimer = setTimeout(() => {
        this.dismiss();
      }, this.options.duration);
    }
  }

  /**
   * Dismiss toast with animation
   * UPDATED COMMENTS: Smooth exit animation before removal
   */
  dismiss() {
    if (this.isDismissing) return;
    this.isDismissing = true;
    
    // CRITICAL: Clear auto-dismiss timer
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
    
    // UPDATED COMMENTS: Exit animation (fade out + collapse)
    this.element.classList.remove('toast--visible');
    this.element.classList.add('toast--exiting');
    
    // CRITICAL: Remove from DOM after full animation (200ms fade + 150ms collapse)
    setTimeout(() => {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
      
      this.isVisible = false;
      
      // UPDATED COMMENTS: Trigger dismiss callback
      if (this.options.onDismiss) {
        this.options.onDismiss(this);
      }
    }, 350); // Match CSS exit animation duration (200ms + 150ms)
  }

  /**
   * Destroy toast and cleanup
   * SCALED FOR: Memory leak prevention
   */
  destroy() {
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
    
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    this.element = null;
    this.isVisible = false;
  }
}

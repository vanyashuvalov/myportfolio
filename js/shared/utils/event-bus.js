/* ANCHOR: event_bus */
/* REUSED: Universal event system for decoupled communication */
/* SCALED FOR: High-frequency events with performance optimization */

/**
 * EventBus - Centralized event management system
 * Provides publish-subscribe pattern for loose coupling between modules
 * 
 * @class EventBus
 */
export class EventBus {
  constructor() {
    this.events = new Map();
    this.onceEvents = new Set();
    this.maxListeners = 100; // Prevent memory leaks
  }

  /**
   * Subscribe to an event
   * UPDATED COMMENTS: Type-safe event subscription with cleanup
   * 
   * @param {string} eventName - Name of the event to listen for
   * @param {Function} callback - Function to call when event is emitted
   * @param {Object} options - Optional configuration
   * @returns {Function} Unsubscribe function
   */
  on(eventName, callback, options = {}) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }

    const listeners = this.events.get(eventName);
    
    // Check max listeners to prevent memory leaks
    if (listeners.length >= this.maxListeners) {
      console.warn(`Max listeners (${this.maxListeners}) exceeded for event: ${eventName}`);
    }

    const listener = {
      callback,
      once: options.once || false,
      context: options.context || null
    };

    listeners.push(listener);

    // Return unsubscribe function
    return () => this.off(eventName, callback);
  }

  /**
   * Subscribe to an event that fires only once
   * REUSED: One-time event subscription pattern
   */
  once(eventName, callback, options = {}) {
    return this.on(eventName, callback, { ...options, once: true });
  }

  /**
   * Unsubscribe from an event
   * UPDATED COMMENTS: Safe event cleanup with validation
   */
  off(eventName, callback) {
    if (!this.events.has(eventName)) {
      return false;
    }

    const listeners = this.events.get(eventName);
    const index = listeners.findIndex(listener => listener.callback === callback);

    if (index !== -1) {
      listeners.splice(index, 1);
      
      // Clean up empty event arrays
      if (listeners.length === 0) {
        this.events.delete(eventName);
      }
      
      return true;
    }

    return false;
  }

  /**
   * Emit an event to all subscribers
   * SCALED FOR: High-performance event emission with error handling
   */
  emit(eventName, ...args) {
    if (!this.events.has(eventName)) {
      return false;
    }

    const listeners = this.events.get(eventName).slice(); // Copy to avoid mutation issues
    let hasListeners = false;

    for (let i = listeners.length - 1; i >= 0; i--) {
      const listener = listeners[i];
      hasListeners = true;

      try {
        // Call with context if provided
        if (listener.context) {
          listener.callback.call(listener.context, ...args);
        } else {
          listener.callback(...args);
        }

        // Remove one-time listeners
        if (listener.once) {
          this.off(eventName, listener.callback);
        }
      } catch (error) {
        console.error(`Error in event listener for "${eventName}":`, error);
        // Continue executing other listeners even if one fails
      }
    }

    return hasListeners;
  }

  /**
   * Remove all listeners for an event or all events
   * REUSED: Cleanup utility for memory management
   */
  removeAllListeners(eventName = null) {
    if (eventName) {
      this.events.delete(eventName);
    } else {
      this.events.clear();
      this.onceEvents.clear();
    }
  }

  /**
   * Get list of event names that have listeners
   * UPDATED COMMENTS: Debugging and introspection utility
   */
  eventNames() {
    return Array.from(this.events.keys());
  }

  /**
   * Get number of listeners for an event
   * SCALED FOR: Performance monitoring and debugging
   */
  listenerCount(eventName) {
    if (!this.events.has(eventName)) {
      return 0;
    }
    return this.events.get(eventName).length;
  }

  /**
   * Set maximum number of listeners per event
   * REUSED: Memory leak prevention
   */
  setMaxListeners(max) {
    this.maxListeners = Math.max(1, parseInt(max) || 100);
  }
}
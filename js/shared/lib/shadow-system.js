/* ANCHOR: shadow_system */
/* REUSED: Universal shadow generation for all interactive elements */
/* SCALED FOR: Dynamic shadow calculation with performance optimization */

/**
 * ShadowSystem - Centralized shadow management for widgets
 * Provides consistent shadow styles based on interaction states
 * 
 * @class ShadowSystem
 */
export class ShadowSystem {
  constructor() {
    this.shadowPresets = this.initializeShadowPresets();
    this.customShadows = new Map();
  }

  /**
   * Initialize default shadow presets
   * UPDATED COMMENTS: Professional shadow system with depth progression
   */
  initializeShadowPresets() {
    return {
      // Base shadow levels
      none: 'none',
      xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
      sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
      md: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
      
      // Widget interaction states
      default: '0 4px 12px rgba(0, 0, 0, 0.15)',
      hovered: '0 8px 24px rgba(0, 0, 0, 0.2)',
      pressed: '0 2px 8px rgba(0, 0, 0, 0.25)',
      dragging: '0 12px 32px rgba(0, 0, 0, 0.3)',
      
      // Specialized widget shadows
      clock: {
        default: '0 4px 12px rgba(0, 0, 0, 0.2)',
        hovered: '0 8px 20px rgba(0, 0, 0, 0.25)',
        pressed: '0 2px 8px rgba(0, 0, 0, 0.3)',
        dragging: '0 12px 28px rgba(0, 0, 0, 0.35)'
      },
      
      sticker: {
        default: '0 3px 10px rgba(0, 0, 0, 0.1)',
        hovered: '0 6px 18px rgba(0, 0, 0, 0.15)',
        pressed: '0 1px 6px rgba(0, 0, 0, 0.2)',
        dragging: '0 10px 25px rgba(0, 0, 0, 0.25)'
      },
      
      folder: {
        default: '0 4px 12px rgba(0, 0, 0, 0.15)',
        hovered: '0 8px 22px rgba(0, 0, 0, 0.2)',
        pressed: '0 2px 8px rgba(0, 0, 0, 0.25)',
        dragging: '0 12px 30px rgba(0, 0, 0, 0.3)'
      }
    };
  }

  /**
   * Get shadow for widget based on type and state
   * REUSED: Universal shadow retrieval for all widget types
   */
  getShadow(widgetType, state = 'default') {
    // Check for widget-specific shadows first
    if (this.shadowPresets[widgetType] && this.shadowPresets[widgetType][state]) {
      return this.shadowPresets[widgetType][state];
    }
    
    // Fallback to general shadows
    if (this.shadowPresets[state]) {
      return this.shadowPresets[state];
    }
    
    // Final fallback
    return this.shadowPresets.default;
  }

  /**
   * Create custom shadow with specified parameters
   * SCALED FOR: Dynamic shadow generation based on widget properties
   */
  createCustomShadow(options = {}) {
    const {
      offsetX = 0,
      offsetY = 4,
      blurRadius = 12,
      spreadRadius = 0,
      color = 'rgba(0, 0, 0, 0.15)',
      inset = false
    } = options;
    
    const insetPrefix = inset ? 'inset ' : '';
    return `${insetPrefix}${offsetX}px ${offsetY}px ${blurRadius}px ${spreadRadius}px ${color}`;
  }

  /**
   * Generate shadow based on elevation level
   * UPDATED COMMENTS: Material Design inspired elevation system
   */
  getElevationShadow(level) {
    const elevations = {
      0: 'none',
      1: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
      2: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
      3: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
      4: '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)',
      5: '0 19px 38px rgba(0, 0, 0, 0.30), 0 15px 12px rgba(0, 0, 0, 0.22)'
    };
    
    return elevations[Math.max(0, Math.min(5, level))] || elevations[1];
  }

  /**
   * Apply shadow to element with transition
   * REUSED: Smooth shadow application with performance optimization
   */
  applyShadow(element, widgetType, state, options = {}) {
    if (!element) return;
    
    const shadow = this.getShadow(widgetType, state);
    const transition = options.transition !== false;
    
    if (transition) {
      element.style.transition = 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }
    
    element.style.boxShadow = shadow;
    
    // Store current shadow state for debugging
    element.dataset.shadowState = `${widgetType}:${state}`;
  }

  /**
   * Create shadow animation keyframes
   * SCALED FOR: Complex shadow animations with CSS keyframes
   */
  createShadowAnimation(fromShadow, toShadow, duration = '0.3s') {
    const animationName = `shadow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const keyframes = `
      @keyframes ${animationName} {
        from { box-shadow: ${fromShadow}; }
        to { box-shadow: ${toShadow}; }
      }
    `;
    
    // Inject keyframes into document
    const style = document.createElement('style');
    style.textContent = keyframes;
    document.head.appendChild(style);
    
    // Clean up after animation
    setTimeout(() => {
      document.head.removeChild(style);
    }, parseFloat(duration) * 1000 + 100);
    
    return {
      name: animationName,
      duration,
      cleanup: () => document.head.removeChild(style)
    };
  }

  /**
   * Register custom shadow preset
   * UPDATED COMMENTS: Extensible shadow system for custom widgets
   */
  registerShadowPreset(name, shadows) {
    if (typeof shadows === 'string') {
      this.shadowPresets[name] = shadows;
    } else if (typeof shadows === 'object') {
      this.shadowPresets[name] = { ...shadows };
    }
  }

  /**
   * Get all available shadow presets
   * REUSED: Debugging and development utility
   */
  getAvailablePresets() {
    return Object.keys(this.shadowPresets);
  }

  /**
   * Calculate shadow intensity based on interaction state
   * SCALED FOR: Dynamic shadow intensity for enhanced UX
   */
  calculateShadowIntensity(baseIntensity, state) {
    const intensityMultipliers = {
      default: 1,
      hovered: 1.3,
      pressed: 0.6,
      dragging: 1.8,
      focused: 1.2
    };
    
    return baseIntensity * (intensityMultipliers[state] || 1);
  }
}
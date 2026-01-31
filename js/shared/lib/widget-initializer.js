/* ANCHOR: widget_initializer */
/* REUSED: Universal widget initialization system */
/* SCALED FOR: Smooth widget creation without visual jumps */

/**
 * WidgetInitializer - Handles proper widget initialization and positioning
 * Prevents visual jumps by setting position before DOM insertion
 * 
 * @class WidgetInitializer
 */
export class WidgetInitializer {
  constructor(options = {}) {
    this.defaultConfig = {
      // UPDATED COMMENTS: Random tilt range for natural desktop appearance
      minTilt: -2,
      maxTilt: 2,
      // SCALED FOR: Smooth entrance animations
      animationDelay: 200,
      // REUSED: Consistent positioning constraints
      padding: 20,
      ...options
    };
  }

  /**
   * Initialize widget with proper positioning and styling
   * UPDATED COMMENTS: Prevents 0:0 coordinate flash by setting position immediately
   * 
   * @param {HTMLElement} element - Widget DOM element
   * @param {Object} options - Widget configuration
   * @returns {Object} Initialization data
   */
  initializeWidget(element, options = {}) {
    const initData = this.prepareInitializationData(options);
    
    // CRITICAL: Set position BEFORE adding to DOM to prevent visual jump
    this.setInitialPosition(element, initData.position);
    this.setInitialTransform(element, initData);
    this.setInitialStyles(element, options.type);
    
    return initData;
  }

  /**
   * Prepare all initialization data before DOM manipulation
   * REUSED: Centralized data preparation for consistent widget setup
   */
  prepareInitializationData(options) {
    return {
      position: this.calculateInitialPosition(options.position),
      rotation: this.generateRandomTilt(),
      scale: options.scale || 1,
      zIndex: options.zIndex || 1,
      id: this.generateWidgetId(),
      timestamp: Date.now()
    };
  }

  /**
   * Calculate initial position with viewport constraints
   * SCALED FOR: Responsive positioning across all screen sizes
   */
  calculateInitialPosition(requestedPosition) {
    if (!requestedPosition) {
      return { x: 100, y: 100 };
    }

    const viewport = this.getViewportDimensions();
    const padding = this.defaultConfig.padding;

    // UPDATED COMMENTS: Ensure position is within viewport bounds
    const constrainedPosition = {
      x: Math.max(padding, Math.min(viewport.width - 200, requestedPosition.x)),
      y: Math.max(padding, Math.min(viewport.height - 200, requestedPosition.y))
    };

    return constrainedPosition;
  }

  /**
   * Set initial position immediately to prevent visual jump
   * CRITICAL: This prevents the 0:0 coordinate flash issue
   * UPDATED COMMENTS: Physics system will handle positioning after widget creation
   */
  setInitialPosition(element, position) {
    // CRITICAL: Set basic positioning for initial render
    element.style.position = 'absolute';
    
    // UPDATED COMMENTS: Physics system will take over positioning after initialization
    // Store initial position for physics system to use
    element.dataset.initialX = position.x;
    element.dataset.initialY = position.y;
    
    // Hardware acceleration for visual effects
    element.style.transformOrigin = 'center center';
    element.style.willChange = 'transform';
    element.style.backfaceVisibility = 'hidden';
    element.style.transformStyle = 'preserve-3d';
  }

  /**
   * Set initial transform properties
   * REUSED: Consistent transform setup for all widgets
   * UPDATED COMMENTS: Simplified to avoid conflicts with widget-base updateTransform
   */
  setInitialTransform(element, initData) {
    // Position is already set in setInitialPosition
    // Widget-base will handle full transform updates
    element.style.zIndex = initData.zIndex;
  }

  /**
   * Set initial widget styles for smooth appearance
   * UPDATED COMMENTS: Prevents layout shifts and ensures smooth rendering
   */
  setInitialStyles(element, widgetType) {
    // REUSED: Base widget styling system
    Object.assign(element.style, {
      position: 'absolute',
      cursor: 'grab',
      userSelect: 'none',
      contain: 'layout style paint',
      // CRITICAL: Start invisible to prevent flash, will be shown after positioning
      opacity: '0',
      transition: 'opacity 0.3s ease-out'
    });

    // Add widget classes
    element.classList.add('widget', `widget--${widgetType}`);
    
    // SCALED FOR: Smooth entrance animation
    requestAnimationFrame(() => {
      element.style.opacity = '1';
    });
  }

  /**
   * Generate random tilt for natural desktop appearance
   * REUSED: Consistent random tilt generation across all widgets
   */
  generateRandomTilt() {
    const { minTilt, maxTilt } = this.defaultConfig;
    return Math.random() * (maxTilt - minTilt) + minTilt;
  }

  /**
   * Get current viewport dimensions
   * SCALED FOR: Responsive positioning calculations
   */
  getViewportDimensions() {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  /**
   * Generate unique widget ID
   * UPDATED COMMENTS: Timestamp-based ID generation for uniqueness
   */
  generateWidgetId() {
    return `widget_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Create widget with proper initialization sequence
   * CRITICAL: This is the main method to prevent visual jumps
   * UPDATED COMMENTS: Physics system handles positioning after creation
   */
  createWidget(widgetClass, container, options = {}) {
    // UPDATED COMMENTS: Create element but don't add to DOM yet
    const element = document.createElement('div');
    
    // CRITICAL: Set basic positioning for initial render
    const position = options.position || { x: 100, y: 100 };
    element.style.position = 'absolute';
    element.style.opacity = '0';
    element.style.transition = 'opacity 0.3s ease-out';
    
    // Store initial position for physics system
    element.dataset.initialX = position.x;
    element.dataset.initialY = position.y;
    
    // REUSED: Widget creation with initialization data
    const widget = new widgetClass(element, { ...options, position });
    
    // SCALED FOR: DOM insertion AFTER positioning is completely set
    container.appendChild(element);
    
    // UPDATED COMMENTS: Show widget after DOM insertion
    requestAnimationFrame(() => {
      element.style.opacity = '1';
    });
    
    // UPDATED COMMENTS: Trigger entrance animation after DOM insertion
    this.playEntranceAnimation(element, options.animationDelay);
    
    return widget;
  }

  /**
   * Play entrance animation for newly created widget
   * REUSED: Consistent entrance animations across all widget types
   */
  playEntranceAnimation(element, delay = 0) {
    setTimeout(() => {
      element.classList.add('widget--entering');
      
      // SCALED FOR: Smooth bounce-in animation
      element.style.animation = 'widgetEnter 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      
      // Clean up animation class after completion
      setTimeout(() => {
        element.classList.remove('widget--entering');
        element.style.animation = '';
      }, 400);
    }, delay);
  }

  /**
   * Batch create multiple widgets with staggered animations
   * SCALED FOR: Smooth sequential widget creation
   */
  createWidgetBatch(widgetConfigs, container, options = {}) {
    const widgets = [];
    const staggerDelay = options.staggerDelay || this.defaultConfig.animationDelay;
    
    widgetConfigs.forEach((config, index) => {
      const widget = this.createWidget(
        config.widgetClass,
        container,
        {
          ...config.options,
          animationDelay: index * staggerDelay
        }
      );
      widgets.push(widget);
    });
    
    return widgets;
  }
}

// ANCHOR: entrance_animation_keyframes
// Add to CSS for entrance animation
const ENTRANCE_ANIMATION_CSS = `
@keyframes widgetEnter {
  0% {
    transform: rotate(var(--rotation, 0deg)) scale(0.8);
    opacity: 0;
  }
  60% {
    transform: rotate(var(--rotation, 0deg)) scale(1.05);
    opacity: 1;
  }
  100% {
    transform: rotate(var(--rotation, 0deg)) scale(1);
    opacity: 1;
  }
}
`;

// REUSABLE LOGIC: Export default instance for convenience
export const widgetInitializer = new WidgetInitializer();
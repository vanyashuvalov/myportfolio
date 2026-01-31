/* ANCHOR: animation_system */
/* REUSED: Universal animation library for all interactive elements */
/* SCALED FOR: 60fps performance with hardware acceleration */

/**
 * AnimationSystem - Centralized animation management
 * Provides consistent animations, transitions, and timing functions
 * 
 * @class AnimationSystem
 */
export class AnimationSystem {
  constructor() {
    this.activeAnimations = new Map();
    this.animationQueue = [];
    this.isProcessingQueue = false;
    this.timingFunctions = this.initializeTimingFunctions();
    this.presets = this.initializeAnimationPresets();
  }

  /**
   * Initialize timing functions for consistent easing
   * UPDATED COMMENTS: Professional easing curves for smooth animations
   */
  initializeTimingFunctions() {
    return {
      // Standard easing functions
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      
      // Custom cubic-bezier curves
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      
      // Specialized curves for different interactions
      hover: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      press: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
      release: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
      drag: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
    };
  }

  /**
   * Initialize animation presets for common interactions
   * REUSED: Consistent animation patterns across all widgets
   */
  initializeAnimationPresets() {
    return {
      // Widget entrance animations
      fadeIn: {
        keyframes: [
          { opacity: 0, transform: 'scale(0.9)' },
          { opacity: 1, transform: 'scale(1)' }
        ],
        options: { duration: 300, easing: this.timingFunctions.smooth }
      },
      
      slideIn: {
        keyframes: [
          { opacity: 0, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ],
        options: { duration: 400, easing: this.timingFunctions.smooth }
      },
      
      bounceIn: {
        keyframes: [
          { opacity: 0, transform: 'scale(0.3) rotate(-180deg)' },
          { opacity: 0.8, transform: 'scale(1.1) rotate(-10deg)' },
          { opacity: 1, transform: 'scale(1) rotate(0deg)' }
        ],
        options: { duration: 500, easing: this.timingFunctions.bounce }
      },
      
      // Hover animations
      hoverLift: {
        keyframes: [
          { transform: 'translateY(0) scale(1)' },
          { transform: 'translateY(-4px) scale(1.02)' }
        ],
        options: { duration: 200, easing: this.timingFunctions.hover }
      },
      
      hoverRotate: {
        keyframes: [
          { transform: 'rotate(0deg) scale(1)' },
          { transform: 'rotate(3deg) scale(1.02)' }
        ],
        options: { duration: 200, easing: this.timingFunctions.hover }
      },
      
      // Press animations
      pressScale: {
        keyframes: [
          { transform: 'scale(1)' },
          { transform: 'scale(0.95)' }
        ],
        options: { duration: 100, easing: this.timingFunctions.press }
      },
      
      // Drag animations
      dragStart: {
        keyframes: [
          { transform: 'scale(1)' },
          { transform: 'scale(1.05)' }
        ],
        options: { duration: 150, easing: this.timingFunctions.drag }
      },
      
      // Cat-specific animations
      catIdle: {
        keyframes: [
          { transform: 'scale(1)', opacity: 1 },
          { transform: 'scale(1.05)', opacity: 0.9 },
          { transform: 'scale(1)', opacity: 1 }
        ],
        options: { duration: 2000, easing: this.timingFunctions.ease, iterations: Infinity }
      },
      
      catHappy: {
        keyframes: [
          { transform: 'scale(1) rotate(0deg)' },
          { transform: 'scale(1.2) rotate(-10deg)' },
          { transform: 'scale(1.3) rotate(0deg)' },
          { transform: 'scale(1.2) rotate(10deg)' },
          { transform: 'scale(1) rotate(0deg)' }
        ],
        options: { duration: 2000, easing: this.timingFunctions.bounce }
      }
    };
  }

  /**
   * Animate element with Web Animations API
   * SCALED FOR: High-performance animations with hardware acceleration
   */
  animate(element, animationName, customOptions = {}) {
    if (!element || !this.presets[animationName]) {
      console.warn(`Animation "${animationName}" not found or element is null`);
      return null;
    }
    
    const preset = this.presets[animationName];
    const options = { ...preset.options, ...customOptions };
    
    // Cancel existing animation on this element
    this.cancelAnimation(element);
    
    // Create and start animation
    const animation = element.animate(preset.keyframes, options);
    
    // Store animation reference
    const animationId = this.generateAnimationId();
    this.activeAnimations.set(animationId, {
      element,
      animation,
      name: animationName,
      startTime: performance.now()
    });
    
    // Clean up when animation finishes
    animation.addEventListener('finish', () => {
      this.activeAnimations.delete(animationId);
    });
    
    animation.addEventListener('cancel', () => {
      this.activeAnimations.delete(animationId);
    });
    
    return animation;
  }

  /**
   * Create custom animation with keyframes
   * UPDATED COMMENTS: Flexible animation creation for unique interactions
   */
  createCustomAnimation(element, keyframes, options = {}) {
    const defaultOptions = {
      duration: 300,
      easing: this.timingFunctions.smooth,
      fill: 'forwards'
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    // Ensure hardware acceleration
    keyframes = keyframes.map(frame => ({
      ...frame,
      transform: frame.transform ? `${frame.transform} translateZ(0)` : 'translateZ(0)'
    }));
    
    return element.animate(keyframes, finalOptions);
  }

  /**
   * Apply CSS transition to element
   * REUSED: Smooth property transitions for all interactive elements
   */
  applyTransition(element, properties, duration = 300, easing = 'smooth') {
    if (!element) return;
    
    const timingFunction = this.timingFunctions[easing] || easing;
    const transitionValue = Array.isArray(properties)
      ? properties.map(prop => `${prop} ${duration}ms ${timingFunction}`).join(', ')
      : `${properties} ${duration}ms ${timingFunction}`;
    
    element.style.transition = transitionValue;
    
    // Ensure hardware acceleration
    if (!element.style.willChange) {
      element.style.willChange = Array.isArray(properties) ? properties.join(', ') : properties;
    }
  }

  /**
   * Cancel animation on element
   * SCALED FOR: Smooth animation interruption and cleanup
   */
  cancelAnimation(element) {
    for (const [id, animData] of this.activeAnimations.entries()) {
      if (animData.element === element) {
        animData.animation.cancel();
        this.activeAnimations.delete(id);
      }
    }
  }

  /**
   * Pause all animations (useful when tab is hidden)
   * UPDATED COMMENTS: Performance optimization for background tabs
   */
  pauseAllAnimations() {
    for (const animData of this.activeAnimations.values()) {
      if (animData.animation.playState === 'running') {
        animData.animation.pause();
      }
    }
  }

  /**
   * Resume all paused animations
   * REUSED: Smooth animation resumption pattern
   */
  resumeAllAnimations() {
    for (const animData of this.activeAnimations.values()) {
      if (animData.animation.playState === 'paused') {
        animData.animation.play();
      }
    }
  }

  /**
   * Create staggered animations for multiple elements
   * SCALED FOR: Complex choreographed animations
   */
  staggerAnimation(elements, animationName, staggerDelay = 100, customOptions = {}) {
    const animations = [];
    
    elements.forEach((element, index) => {
      const delay = index * staggerDelay;
      const options = { ...customOptions, delay };
      
      setTimeout(() => {
        const animation = this.animate(element, animationName, options);
        if (animation) {
          animations.push(animation);
        }
      }, delay);
    });
    
    return animations;
  }

  /**
   * Register custom animation preset
   * UPDATED COMMENTS: Extensible animation system for custom widgets
   */
  registerAnimation(name, keyframes, options = {}) {
    this.presets[name] = {
      keyframes,
      options: {
        duration: 300,
        easing: this.timingFunctions.smooth,
        ...options
      }
    };
  }

  /**
   * Generate unique animation ID
   * REUSED: ID generation utility for animation tracking
   */
  generateAnimationId() {
    return `anim_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Get animation statistics for debugging
   * SCALED FOR: Performance monitoring and optimization
   */
  getAnimationStats() {
    return {
      activeCount: this.activeAnimations.size,
      queueLength: this.animationQueue.length,
      availablePresets: Object.keys(this.presets),
      timingFunctions: Object.keys(this.timingFunctions)
    };
  }

  /**
   * Clean up finished animations
   * UPDATED COMMENTS: Memory management for long-running applications
   */
  cleanup() {
    for (const [id, animData] of this.activeAnimations.entries()) {
      if (animData.animation.playState === 'finished') {
        this.activeAnimations.delete(id);
      }
    }
  }
}
/* ANCHOR: smooth_animations */
/* REUSED: Hardware-accelerated animation system for 60fps performance */
/* SCALED FOR: Professional-grade animations without external dependencies */

/**
 * SmoothAnimations - Enhanced animation system with hardware acceleration
 * Replaces basic AnimationSystem with optimized performance patterns
 * 
 * // UPDATED COMMENTS: Zero dependencies, pure Web Animations API optimization
 * @class SmoothAnimations
 */
export class SmoothAnimations {
  constructor() {
    this.activeAnimations = new Map();
    this.rafCallbacks = new Set();
    this.isRAFRunning = false;
    
    // REUSED: Enhanced timing functions for smooth animations
    this.timingFunctions = this.initializeTimingFunctions();
    this.presets = this.initializeOptimizedPresets();
  }

  /**
   * Initialize professional easing functions
   * UPDATED COMMENTS: Custom cubic-bezier curves for smooth interactions
   */
  initializeTimingFunctions() {
    return {
      // Standard easing
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      
      // Professional curves
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',        // Material Design
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Bounce effect
      elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Elastic
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',         // Sharp transition
      
      // Interaction-specific
      hover: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',  // Hover lift
      press: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)', // Button press
      release: 'cubic-bezier(0.215, 0.61, 0.355, 1)',  // Button release
      drag: 'cubic-bezier(0.25, 0.1, 0.25, 1)',       // Drag movement
      
      // Custom optimized curves
      quickSnap: 'cubic-bezier(0.68, 0, 0.32, 1)',    // Quick snap
      gentleSpring: 'cubic-bezier(0.25, 0.8, 0.25, 1)', // Gentle spring
      powerEase: 'cubic-bezier(0.77, 0, 0.175, 1)'    // Power ease
    };
  }

  /**
   * Initialize hardware-accelerated animation presets
   * SCALED FOR: Complex widget interactions with 60fps performance
   */
  initializeOptimizedPresets() {
    return {
      // Widget entrance animations
      fadeIn: {
        keyframes: [
          { 
            opacity: 0, 
            transform: 'translate3d(0, 0, 0) scale(0.9)',
            filter: 'blur(2px)'
          },
          { 
            opacity: 1, 
            transform: 'translate3d(0, 0, 0) scale(1)',
            filter: 'blur(0px)'
          }
        ],
        options: { 
          duration: 300, 
          easing: this.timingFunctions.smooth,
          fill: 'forwards'
        }
      },
      
      slideIn: {
        keyframes: [
          { 
            opacity: 0, 
            transform: 'translate3d(0, 20px, 0) scale(0.95)'
          },
          { 
            opacity: 1, 
            transform: 'translate3d(0, 0, 0) scale(1)'
          }
        ],
        options: { 
          duration: 400, 
          easing: this.timingFunctions.smooth,
          fill: 'forwards'
        }
      },
      
      bounceIn: {
        keyframes: [
          { 
            opacity: 0, 
            transform: 'translate3d(0, 0, 0) scale(0.3) rotate(-180deg)'
          },
          { 
            opacity: 0.8, 
            transform: 'translate3d(0, 0, 0) scale(1.1) rotate(-10deg)'
          },
          { 
            opacity: 1, 
            transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)'
          }
        ],
        options: { 
          duration: 500, 
          easing: this.timingFunctions.bounce,
          fill: 'forwards'
        }
      },
      
      // Hover animations - optimized for frequent use
      hoverLift: {
        keyframes: [
          { 
            transform: 'translate3d(0, 0, 0) scale(1)',
            filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))'
          },
          { 
            transform: 'translate3d(0, -4px, 0) scale(1.02)',
            filter: 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.2))'
          }
        ],
        options: { 
          duration: 200, 
          easing: this.timingFunctions.hover,
          fill: 'forwards'
        }
      },
      
      hoverRotate: {
        keyframes: [
          { transform: 'translate3d(0, 0, 0) rotate(0deg) scale(1)' },
          { transform: 'translate3d(0, 0, 0) rotate(3deg) scale(1.02)' }
        ],
        options: { 
          duration: 200, 
          easing: this.timingFunctions.hover,
          fill: 'forwards'
        }
      },
      
      // Press animations - instant feedback
      pressScale: {
        keyframes: [
          { transform: 'translate3d(0, 0, 0) scale(1)' },
          { transform: 'translate3d(0, 0, 0) scale(0.95)' }
        ],
        options: { 
          duration: 100, 
          easing: this.timingFunctions.press,
          fill: 'forwards'
        }
      },
      
      // Cat-specific animations
      catIdle: {
        keyframes: [
          { 
            transform: 'translate3d(0, 0, 0) scale(1)', 
            opacity: 1 
          },
          { 
            transform: 'translate3d(0, 0, 0) scale(1.05)', 
            opacity: 0.9 
          },
          { 
            transform: 'translate3d(0, 0, 0) scale(1)', 
            opacity: 1 
          }
        ],
        options: { 
          duration: 2000, 
          easing: this.timingFunctions.ease, 
          iterations: Infinity 
        }
      },
      
      catHappy: {
        keyframes: [
          { transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)' },
          { transform: 'translate3d(0, 0, 0) scale(1.2) rotate(-10deg)' },
          { transform: 'translate3d(0, 0, 0) scale(1.3) rotate(0deg)' },
          { transform: 'translate3d(0, 0, 0) scale(1.2) rotate(10deg)' },
          { transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)' }
        ],
        options: { 
          duration: 2000, 
          easing: this.timingFunctions.bounce,
          fill: 'forwards'
        }
      },
      
      // Micro-interactions
      pulse: {
        keyframes: [
          { transform: 'translate3d(0, 0, 0) scale(1)', opacity: 1 },
          { transform: 'translate3d(0, 0, 0) scale(1.05)', opacity: 0.8 },
          { transform: 'translate3d(0, 0, 0) scale(1)', opacity: 1 }
        ],
        options: { 
          duration: 1000, 
          easing: this.timingFunctions.smooth, 
          iterations: Infinity 
        }
      },
      
      shake: {
        keyframes: [
          { transform: 'translate3d(0, 0, 0)' },
          { transform: 'translate3d(-2px, 0, 0)' },
          { transform: 'translate3d(2px, 0, 0)' },
          { transform: 'translate3d(-2px, 0, 0)' },
          { transform: 'translate3d(0, 0, 0)' }
        ],
        options: { 
          duration: 300, 
          easing: this.timingFunctions.sharp,
          fill: 'forwards'
        }
      }
    };
  }

  /**
   * Animate element with hardware acceleration
   * CRITICAL: Optimized for 60fps performance with proper cleanup
   */
  animate(element, animationName, customOptions = {}) {
    if (!element || !this.presets[animationName]) {
      console.warn(`SmoothAnimations: Animation "${animationName}" not found or element is null`);
      return null;
    }
    
    // UPDATED COMMENTS: Prepare element for hardware acceleration
    this.prepareElementForAnimation(element);
    
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
      this.cleanupElementAfterAnimation(element);
    });
    
    animation.addEventListener('cancel', () => {
      this.activeAnimations.delete(animationId);
      this.cleanupElementAfterAnimation(element);
    });
    
    return animation;
  }

  /**
   * Prepare element for hardware-accelerated animation
   * REUSED: Optimization pattern for all animated elements
   */
  prepareElementForAnimation(element) {
    // CRITICAL: Enable hardware acceleration
    element.style.willChange = 'transform, opacity, filter';
    element.style.transformStyle = 'preserve-3d';
    element.style.backfaceVisibility = 'hidden';
    
    // UPDATED COMMENTS: Ensure element is on its own layer
    if (!element.style.transform.includes('translateZ')) {
      const currentTransform = element.style.transform || '';
      element.style.transform = currentTransform + ' translateZ(0)';
    }
  }

  /**
   * Clean up element after animation
   * SCALED FOR: Memory optimization and performance
   */
  cleanupElementAfterAnimation(element) {
    // UPDATED COMMENTS: Remove will-change to free up GPU memory
    element.style.willChange = 'auto';
  }

  /**
   * Create staggered animations with hardware acceleration
   * SCALED FOR: Complex choreographed sequences
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
   * Create timeline sequence
   * REUSED: Sequential animation pattern without external dependencies
   */
  createTimeline(animations) {
    return animations.reduce((promise, anim, index) => {
      return promise.then(() => {
        return new Promise(resolve => {
          const delay = anim.delay || 0;
          setTimeout(() => {
            const animation = this.animate(anim.element, anim.name, anim.options);
            if (animation) {
              animation.addEventListener('finish', resolve);
              animation.addEventListener('cancel', resolve);
            } else {
              resolve();
            }
          }, delay);
        });
      });
    }, Promise.resolve());
  }

  /**
   * Cancel animation on element
   * UPDATED COMMENTS: Proper cleanup with hardware acceleration reset
   */
  cancelAnimation(element) {
    for (const [id, animData] of this.activeAnimations.entries()) {
      if (animData.element === element) {
        animData.animation.cancel();
        this.activeAnimations.delete(id);
        this.cleanupElementAfterAnimation(element);
      }
    }
  }

  /**
   * Pause all animations for performance
   * SCALED FOR: Background tab optimization
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
   * REUSED: Tab visibility optimization pattern
   */
  resumeAllAnimations() {
    for (const animData of this.activeAnimations.values()) {
      if (animData.animation.playState === 'paused') {
        animData.animation.play();
      }
    }
  }

  /**
   * Register custom animation preset
   * UPDATED COMMENTS: Extensible system for widget-specific animations
   */
  registerAnimation(name, keyframes, options = {}) {
    // CRITICAL: Ensure all keyframes use hardware acceleration
    const optimizedKeyframes = keyframes.map(frame => ({
      ...frame,
      transform: frame.transform ? 
        (frame.transform.includes('translate3d') ? frame.transform : frame.transform + ' translateZ(0)') :
        'translateZ(0)'
    }));

    this.presets[name] = {
      keyframes: optimizedKeyframes,
      options: {
        duration: 300,
        easing: this.timingFunctions.smooth,
        fill: 'forwards',
        ...options
      }
    };
  }

  /**
   * Generate unique animation ID
   * REUSED: ID generation utility for animation tracking
   */
  generateAnimationId() {
    return `smooth_anim_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Get performance statistics
   * SCALED FOR: Performance monitoring and optimization
   */
  getPerformanceStats() {
    const activeCount = this.activeAnimations.size;
    const memoryUsage = this.estimateMemoryUsage();
    
    return {
      activeAnimations: activeCount,
      memoryEstimate: `${memoryUsage}KB`,
      availablePresets: Object.keys(this.presets).length,
      timingFunctions: Object.keys(this.timingFunctions).length,
      hardwareAccelerated: true
    };
  }

  /**
   * Estimate memory usage for debugging
   * UPDATED COMMENTS: Memory monitoring for performance optimization
   */
  estimateMemoryUsage() {
    // Rough estimate: each active animation ~1KB
    return this.activeAnimations.size * 1;
  }

  /**
   * Clean up all animations and resources
   * CRITICAL: Proper cleanup for memory management
   */
  destroy() {
    // Cancel all active animations
    for (const [id, animData] of this.activeAnimations.entries()) {
      animData.animation.cancel();
      this.cleanupElementAfterAnimation(animData.element);
    }
    
    this.activeAnimations.clear();
    this.rafCallbacks.clear();
  }
}

// REUSED: Export singleton instance for global use
export const smoothAnimations = new SmoothAnimations();
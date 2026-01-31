/* ANCHOR: cat_widget */
/* FSD: widgets/cat → interactive cat implementation */
/* REUSED: WidgetBase class with AI behavior functionality */

import { WidgetBase } from '../../entities/widget/widget-base.js';

/**
 * CatWidget - Interactive cat with personality and animations
 * Features: State machine, sprite animations, feeding system, AI behavior
 * 
 * @class CatWidget
 * @extends WidgetBase
 */
export class CatWidget extends WidgetBase {
  constructor(element, options = {}) {
    super(element, { ...options, type: 'cat' });
    
    this.name = options.name || 'Pixel';
    this.currentAnimation = 'idle';
    this.hunger = options.hunger || 50; // 0-100 scale
    this.happiness = options.happiness || 70; // 0-100 scale
    this.lastFed = Date.now();
    
    // UPDATED COMMENTS: Animation state management for smooth transitions
    this.animationStates = {
      idle: { duration: 2000, loop: true },
      walking: { duration: 1000, loop: true },
      eating: { duration: 3000, loop: false },
      happy: { duration: 2000, loop: false }
    };
    
    this.behaviorTimer = null;
    
    this.createCatSprite();
    this.startBehaviorLoop();
  }

  /**
   * Create cat sprite element
   * REUSED: Sprite rendering system for all animations
   */
  createCatSprite() {
    this.element.innerHTML = `
      <div class="cat-sprite cat-${this.currentAnimation}" 
           title="${this.escapeHtml(this.name)}"
           style="background-image: url('assets/cat/sprites/cat-${this.currentAnimation}.svg');">
      </div>
    `;
  }

  /**
   * Update cat sprite based on current animation state
   * UPDATED COMMENTS: CSS-based sprite switching for performance
   */
  updateSprite() {
    const sprite = this.element.querySelector('.cat-sprite');
    if (sprite) {
      sprite.style.backgroundImage = `url('assets/cat/sprites/cat-${this.currentAnimation}.svg')`;
      sprite.className = `cat-sprite cat-${this.currentAnimation}`;
    }
  }

  /**
   * Play specific animation
   * SCALED FOR: Smooth animation transitions with state management
   */
  playAnimation(animationType) {
    if (this.currentAnimation === animationType) return;
    
    this.currentAnimation = animationType;
    this.updateSprite();
    
    // Handle non-looping animations
    const state = this.animationStates[animationType];
    if (!state.loop) {
      setTimeout(() => {
        if (this.currentAnimation === animationType) {
          this.playAnimation('idle');
        }
      }, state.duration);
    }
    
    // Emit animation change event
    if (this.eventBus) {
      this.eventBus.emit('cat:animation-changed', {
        widget: this,
        animation: animationType,
        cat: this.name
      });
    }
  }

  /**
   * AI behavior loop for autonomous cat actions
   * SCALED FOR: Complex decision making, realistic pet behavior
   */
  startBehaviorLoop() {
    this.behaviorTimer = setInterval(() => {
      this.updateHunger();
      this.decideBehavior();
    }, 5000); // Check every 5 seconds
  }

  /**
   * Update hunger level over time
   * UPDATED COMMENTS: Realistic hunger simulation with time decay
   */
  updateHunger() {
    const timeSinceLastFed = Date.now() - this.lastFed;
    const hoursSinceLastFed = timeSinceLastFed / (1000 * 60 * 60);
    
    // Hunger increases by ~10 points per hour
    const hungerIncrease = Math.floor(hoursSinceLastFed * 10);
    this.hunger = Math.min(100, this.hunger + hungerIncrease);
    
    // Happiness decreases if very hungry
    if (this.hunger > 80) {
      this.happiness = Math.max(0, this.happiness - 1);
    }
  }

  /**
   * AI decision making for cat behavior
   * REUSED: State machine pattern for behavior management
   */
  decideBehavior() {
    // Don't interrupt eating or happy animations
    if (this.currentAnimation === 'eating' || this.currentAnimation === 'happy') {
      return;
    }
    
    const random = Math.random();
    
    // Behavior probabilities based on state
    if (this.hunger > 70) {
      // Very hungry - more likely to walk around looking for food
      if (random < 0.6) {
        this.playAnimation('walking');
        this.moveRandomly();
      }
    } else if (this.happiness > 80) {
      // Very happy - more playful behavior
      if (random < 0.3) {
        this.playAnimation('happy');
      } else if (random < 0.6) {
        this.playAnimation('walking');
        this.moveRandomly();
      }
    } else {
      // Normal behavior - mostly idle with occasional movement
      if (random < 0.2) {
        this.playAnimation('walking');
        this.moveRandomly();
      } else {
        this.playAnimation('idle');
      }
    }
  }

  /**
   * Move cat to random position
   * SCALED FOR: Smooth movement with boundary constraints
   */
  moveRandomly() {
    if (!this.eventBus) return;
    
    // Get canvas bounds from parent
    const bounds = this.getBounds();
    if (!bounds) return;
    
    const newX = bounds.left + Math.random() * (bounds.right - bounds.left - 100);
    const newY = bounds.top + Math.random() * (bounds.bottom - bounds.top - 100);
    
    // Animate movement over 2 seconds
    this.animateMovement(newX, newY, 2000);
  }

  /**
   * Animate smooth movement to target position
   * UPDATED COMMENTS: Smooth position interpolation for natural movement
   */
  animateMovement(targetX, targetY, duration) {
    const startX = this.position.x;
    const startY = this.position.y;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth movement
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentX = startX + (targetX - startX) * easeProgress;
      const currentY = startY + (targetY - startY) * easeProgress;
      
      this.setPosition(currentX, currentY);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Stop walking animation when movement is complete
        if (this.currentAnimation === 'walking') {
          this.playAnimation('idle');
        }
      }
    };
    
    requestAnimationFrame(animate);
  }

  /**
   * Get canvas bounds for movement constraints
   * REUSED: Bounds checking utility
   */
  getBounds() {
    // This would typically come from the canvas context
    // For now, use window dimensions as fallback
    return {
      left: 50,
      top: 50,
      right: window.innerWidth - 150,
      bottom: window.innerHeight - 150
    };
  }

  /**
   * Feed the cat
   * SCALED FOR: Complex feeding system with happiness and hunger management
   */
  feed(foodType = 'kibble') {
    const foodValues = {
      kibble: { hunger: -20, happiness: +10 },
      treat: { hunger: -10, happiness: +25 },
      fish: { hunger: -30, happiness: +20 }
    };
    
    const food = foodValues[foodType] || foodValues.kibble;
    
    this.hunger = Math.max(0, this.hunger + food.hunger);
    this.happiness = Math.min(100, this.happiness + food.happiness);
    this.lastFed = Date.now();
    
    // Play eating animation
    this.playAnimation('eating');
    
    // Show happiness after eating
    setTimeout(() => {
      if (this.happiness > 60) {
        this.playAnimation('happy');
      }
    }, 3000);
    
    // Emit feeding event
    if (this.eventBus) {
      this.eventBus.emit('cat:fed', {
        widget: this,
        cat: this.name,
        foodType,
        hunger: this.hunger,
        happiness: this.happiness
      });
    }
  }

  /**
   * Widget-specific click handler
   * UPDATED COMMENTS: Cat-specific pet interaction
   */
  onClick(data) {
    // Pet the cat - increases happiness
    this.happiness = Math.min(100, this.happiness + 5);
    this.playAnimation('happy');
    
    if (this.eventBus) {
      this.eventBus.emit('cat:petted', {
        widget: this,
        cat: this.name,
        happiness: this.happiness
      });
    }
  }

  /**
   * Escape HTML to prevent XSS
   * SCALED FOR: Security-first content handling
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get cat status for UI display
   * REUSED: Status reporting pattern for debugging
   */
  getStatus() {
    return {
      name: this.name,
      animation: this.currentAnimation,
      hunger: this.hunger,
      happiness: this.happiness,
      lastFed: new Date(this.lastFed).toLocaleString(),
      mood: this.getMood()
    };
  }

  /**
   * Determine cat mood based on stats
   * UPDATED COMMENTS: Mood calculation for UI feedback
   */
  getMood() {
    if (this.happiness > 80) return 'very happy';
    if (this.happiness > 60) return 'happy';
    if (this.happiness > 40) return 'content';
    if (this.happiness > 20) return 'sad';
    return 'very sad';
  }

  /**
   * Destroy cat widget and clean up timers
   * SCALED FOR: Proper resource cleanup
   */
  destroy() {
    if (this.behaviorTimer) {
      clearInterval(this.behaviorTimer);
      this.behaviorTimer = null;
    }
    
    super.destroy();
  }
}
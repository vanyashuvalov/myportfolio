/* ANCHOR: feed_button_widget */
/* FSD: widgets/feed-button → cat feeding interaction implementation */
/* REUSED: WidgetBase class with feeding functionality */

import { WidgetBase } from '../../entities/widget/widget-base.js';

/**
 * FeedButtonWidget - Interactive button for feeding the cat
 * Features: Food type selection, cooldown management, visual feedback
 * 
 * @class FeedButtonWidget
 * @extends WidgetBase
 */
export class FeedButtonWidget extends WidgetBase {
  constructor(element, options = {}) {
    super(element, { ...options, type: 'feed-button' });
    
    this.targetCat = options.targetCat || 'cat';
    this.currentFood = options.defaultFood || 'kibble';
    this.cooldownTime = options.cooldownTime || 3000; // 3 seconds
    this.isOnCooldown = false;
    
    this.foodTypes = {
      kibble: { icon: '🥣', name: 'Kibble', color: '#8B4513' },
      treat: { icon: '🍪', name: 'Treat', color: '#DAA520' },
      fish: { icon: '🐟', name: 'Fish', color: '#4682B4' }
    };
    
    this.createFeedButton();
  }

  /**
   * Create feed button with food selection
   * UPDATED COMMENTS: Professional button design with SVG icons
   */
  createFeedButton() {
    const currentFoodData = this.foodTypes[this.currentFood];
    
    this.element.innerHTML = `
      <div class="feed-button-container ${this.isOnCooldown ? 'feed-button--cooldown' : ''}"
           style="background-color: ${currentFoodData.color};">
        <svg class="feed-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          ${this.getFoodIcon(this.currentFood)}
        </svg>
        <div class="feed-label">${currentFoodData.name}</div>
        ${this.isOnCooldown ? '<div class="cooldown-overlay"></div>' : ''}
      </div>
    `;
  }

  /**
   * Get SVG icon for food type
   * REUSED: SVG icon system for consistent visual language
   */
  getFoodIcon(foodType) {
    const icons = {
      kibble: `
        <circle cx="12" cy="8" r="3" fill="white"/>
        <circle cx="8" cy="14" r="2" fill="white"/>
        <circle cx="16" cy="14" r="2" fill="white"/>
        <circle cx="12" cy="18" r="1.5" fill="white"/>
      `,
      treat: `
        <rect x="6" y="8" width="12" height="8" rx="2" fill="white"/>
        <circle cx="9" cy="11" r="1" fill="${this.foodTypes.treat.color}"/>
        <circle cx="15" cy="13" r="1" fill="${this.foodTypes.treat.color}"/>
      `,
      fish: `
        <path d="M2 12C2 12 6 8 12 8C18 8 22 12 22 12C22 12 18 16 12 16C6 16 2 12 2 12Z" 
              fill="white"/>
        <circle cx="12" cy="12" r="2" fill="${this.foodTypes.fish.color}"/>
        <path d="M18 10L22 8M18 14L22 16" stroke="white" stroke-width="2"/>
      `
    };
    
    return icons[foodType] || icons.kibble;
  }

  /**
   * Handle feed button click
   * SCALED FOR: Cooldown management and cat targeting
   */
  onClick(data) {
    if (this.isOnCooldown) {
      this.showCooldownMessage();
      return;
    }
    
    this.feedCat();
  }

  /**
   * Feed the target cat
   * UPDATED COMMENTS: Cat feeding with event system integration
   */
  feedCat() {
    if (!this.eventBus) return;
    
    // Find target cat widget
    this.eventBus.emit('cat:feed-request', {
      foodType: this.currentFood,
      source: this
    });
    
    // Start cooldown
    this.startCooldown();
    
    // Visual feedback
    this.playFeedAnimation();
  }

  /**
   * Start cooldown period
   * REUSED: Cooldown management pattern for rate limiting
   */
  startCooldown() {
    this.isOnCooldown = true;
    this.createFeedButton();
    
    setTimeout(() => {
      this.isOnCooldown = false;
      this.createFeedButton();
    }, this.cooldownTime);
  }

  /**
   * Play feeding animation
   * SCALED FOR: Visual feedback with particle effects
   */
  playFeedAnimation() {
    if (!this.animationSystem) return;
    
    // Scale animation for button press
    this.animationSystem.animate(this.element, 'pressScale');
    
    // Create food particles (simple implementation)
    this.createFoodParticles();
  }

  /**
   * Create food particles for visual feedback
   * UPDATED COMMENTS: Simple particle system for feeding effect
   */
  createFoodParticles() {
    const particleCount = 5;
    const container = this.element.parentElement;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'food-particle';
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background-color: ${this.foodTypes[this.currentFood].color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
      `;
      
      // Position at button center
      const buttonRect = this.element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      particle.style.left = `${buttonRect.left - containerRect.left + buttonRect.width / 2}px`;
      particle.style.top = `${buttonRect.top - containerRect.top + buttonRect.height / 2}px`;
      
      container.appendChild(particle);
      
      // Animate particle
      this.animateParticle(particle, i);
    }
  }

  /**
   * Animate individual food particle
   * REUSED: Particle animation pattern for effects
   */
  animateParticle(particle, index) {
    const angle = (index / 5) * Math.PI * 2;
    const distance = 50 + Math.random() * 30;
    const duration = 800 + Math.random() * 400;
    
    const targetX = Math.cos(angle) * distance;
    const targetY = Math.sin(angle) * distance - 20; // Slight upward bias
    
    particle.animate([
      { 
        transform: 'translate(0, 0) scale(1)',
        opacity: 1
      },
      { 
        transform: `translate(${targetX}px, ${targetY}px) scale(0.5)`,
        opacity: 0
      }
    ], {
      duration,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }).addEventListener('finish', () => {
      particle.remove();
    });
  }

  /**
   * Show cooldown message
   * UPDATED COMMENTS: User feedback for rate limiting
   */
  showCooldownMessage() {
    // Simple tooltip-like message
    const message = document.createElement('div');
    message.className = 'cooldown-message';
    message.textContent = 'Wait a moment...';
    message.style.cssText = `
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      pointer-events: none;
      z-index: 1001;
    `;
    
    this.element.appendChild(message);
    
    setTimeout(() => {
      message.remove();
    }, 1500);
  }

  /**
   * Cycle through food types on long press
   * SCALED FOR: Food type selection without complex UI
   */
  onLongPress(data) {
    const foodTypes = Object.keys(this.foodTypes);
    const currentIndex = foodTypes.indexOf(this.currentFood);
    const nextIndex = (currentIndex + 1) % foodTypes.length;
    
    this.currentFood = foodTypes[nextIndex];
    this.createFeedButton();
    
    // Show food change feedback
    this.showFoodChangeMessage();
  }

  /**
   * Show food type change message
   * REUSED: User feedback pattern for state changes
   */
  showFoodChangeMessage() {
    const foodData = this.foodTypes[this.currentFood];
    const message = document.createElement('div');
    message.className = 'food-change-message';
    message.textContent = `Switched to ${foodData.name}`;
    message.style.cssText = `
      position: absolute;
      top: -35px;
      left: 50%;
      transform: translateX(-50%);
      background: ${foodData.color};
      color: white;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: bold;
      white-space: nowrap;
      pointer-events: none;
      z-index: 1001;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    `;
    
    this.element.appendChild(message);
    
    // Animate message
    message.animate([
      { opacity: 0, transform: 'translateX(-50%) translateY(10px)' },
      { opacity: 1, transform: 'translateX(-50%) translateY(0px)' },
      { opacity: 1, transform: 'translateX(-50%) translateY(0px)' },
      { opacity: 0, transform: 'translateX(-50%) translateY(-10px)' }
    ], {
      duration: 2000,
      easing: 'ease-out'
    }).addEventListener('finish', () => {
      message.remove();
    });
  }

  /**
   * Setup event listeners for cat feeding
   * UPDATED COMMENTS: Event system integration for cat interaction
   */
  setupEventListeners() {
    super.setupEventListeners();
    
    if (this.eventBus) {
      // Listen for cat feeding responses
      this.eventBus.on('cat:fed', (data) => {
        if (data.foodType === this.currentFood) {
          this.showFeedingSuccess(data);
        }
      });
    }
  }

  /**
   * Show successful feeding feedback
   * SCALED FOR: Rich feedback system with cat status
   */
  showFeedingSuccess(data) {
    const message = document.createElement('div');
    message.className = 'feeding-success';
    message.textContent = `${data.cat} enjoyed the ${data.foodType}!`;
    message.style.cssText = `
      position: absolute;
      top: -40px;
      left: 50%;
      transform: translateX(-50%);
      background: #10B981;
      color: white;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: bold;
      white-space: nowrap;
      pointer-events: none;
      z-index: 1001;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    `;
    
    this.element.appendChild(message);
    
    setTimeout(() => {
      if (message.parentNode) {
        message.remove();
      }
    }, 3000);
  }

  /**
   * Get feed button data for serialization
   * REUSED: Data persistence pattern
   */
  getData() {
    return {
      ...super.getInfo(),
      targetCat: this.targetCat,
      currentFood: this.currentFood,
      cooldownTime: this.cooldownTime
    };
  }
}
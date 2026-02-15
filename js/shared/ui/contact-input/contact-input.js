/* ANCHOR: contact_input_component */
/* REUSED: Contact input field component */
/* SCALED FOR: Event handling and validation */
/* UPDATED COMMENTS: Message input with send functionality */

import { EventBus } from '../../utils/event-bus.js';

/**
 * ContactInput class - Fixed bottom input field for messages
 * UPDATED COMMENTS: Handles user input and triggers contact modal
 * REUSED: EventBus pattern for component communication
 * 
 * @class ContactInput
 */
export class ContactInput {
  constructor(container, options = {}) {
    this.container = container;
    this.eventBus = options.eventBus || new EventBus();
    this.options = {
      placeholder: 'Message me right here...',
      minLength: 10,
      maxLength: 2000,
      ...options
    };
    
    this.inputElement = null;
    this.sendButton = null;
    this.isInitialized = false;
    this.isExpanded = false; // Track if width is expanded
  }

  /**
   * Initialize contact input component
   * UPDATED COMMENTS: Render and bind events with delayed appearance animation
   */
  async init() {
    try {
      await this.render();
      this.cacheElements();
      this.bindEvents();
      
      // CRITICAL: Trigger appearance animation after render
      // Wait for next frame to ensure CSS is applied
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (this.container.querySelector('.contact-input-wrapper')) {
            this.container.querySelector('.contact-input-wrapper').classList.add('contact-input-wrapper--visible');
          }
        });
      });
      
      this.isInitialized = true;
      
      // REUSED: EventBus notification
      this.eventBus.emit('contact-input:initialized', this);
      
      console.log('// UPDATED COMMENTS: Contact input initialized successfully');
    } catch (error) {
      console.error('Failed to initialize contact input:', error);
      throw error;
    }
  }

  /**
   * Render contact input HTML
   * REUSED: Figma design specs with iconamoon icons
   */
  async render() {
    const commentIcon = await this.getCommentIconSVG();
    const sendIcon = await this.getSendIconSVG();
    
    this.container.innerHTML = `
      <div class="contact-input-wrapper">
        <div class="contact-input" role="search">
          <!-- ANCHOR: comment_icon -->
          <div class="contact-input__icon" aria-hidden="true">
            ${commentIcon}
          </div>
          
          <!-- ANCHOR: text_input -->
          <textarea 
            class="contact-input__field" 
            placeholder="${this.options.placeholder}"
            maxlength="${this.options.maxLength}"
            aria-label="Message input field"
            rows="1"
          ></textarea>
          
          <!-- ANCHOR: send_icon -->
          <div class="contact-input__send" role="button" tabindex="0" aria-label="Send message">
            ${sendIcon}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Cache DOM elements
   * SCALED FOR: Performance optimization
   */
  cacheElements() {
    this.wrapper = this.container.querySelector('.contact-input');
    this.inputElement = this.container.querySelector('.contact-input__field');
    this.sendButton = this.container.querySelector('.contact-input__send');
  }

  /**
   * Bind event listeners
   * REUSED: Event delegation pattern
   */
  bindEvents() {
    // UPDATED COMMENTS: Click on wrapper focuses input
    this.wrapper.addEventListener('click', (e) => {
      // Don't focus if clicking on send button
      if (!e.target.closest('.contact-input__send')) {
        this.inputElement.focus();
      }
    });
    
    // UPDATED COMMENTS: Input change detection
    this.inputElement.addEventListener('input', this.handleInput.bind(this));
    this.inputElement.addEventListener('keydown', this.handleKeydown.bind(this));
    
    // UPDATED COMMENTS: Send button click
    this.sendButton.addEventListener('click', this.handleSend.bind(this));
    this.sendButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleSend();
      }
    });
  }

  /**
   * Handle input changes
   * UPDATED COMMENTS: Show/hide send button and auto-resize textarea
   */
  handleInput(event) {
    const value = event.target.value.trim();
    
    // SCALED FOR: Dynamic UI updates
    if (value.length > 0) {
      this.wrapper.classList.add('contact-input--has-value');
    } else {
      this.wrapper.classList.remove('contact-input--has-value');
    }
    
    // CRITICAL: Auto-resize textarea up to 10 lines
    this.autoResizeTextarea();
    
    this.eventBus.emit('contact-input:change', { value });
  }

  /**
   * Auto-resize textarea based on content
   * SCALED FOR: Jump to 95vw when text overflows, then expand height up to 10 lines
   */
  autoResizeTextarea() {
    // CRITICAL: Calculate max width
    const maxWrapperWidth = window.innerWidth * 0.95;
    const minWrapperWidth = 467;
    
    // Create hidden span to measure text width
    if (!this.measureSpan) {
      this.measureSpan = document.createElement('span');
      this.measureSpan.style.cssText = `
        position: absolute;
        visibility: hidden;
        white-space: nowrap;
        font-family: 'Geist Mono', var(--font-family-mono);
        font-size: 20px;
        font-weight: 400;
        line-height: 130%;
      `;
      document.body.appendChild(this.measureSpan);
    }
    
    // Measure text width
    this.measureSpan.textContent = this.inputElement.value || this.inputElement.placeholder;
    const textWidth = this.measureSpan.offsetWidth;
    
    // Calculate needed wrapper width (text + icons + padding + gaps)
    const neededWidth = textWidth + 120;
    
    // CRITICAL: Check if text overflows initial width
    if (neededWidth > minWrapperWidth && !this.isExpanded) {
      // PHASE 1: Expand width with smooth transition, lock height temporarily
      this.isExpanded = true;
      
      // Lock height at current value to prevent jump
      const currentHeight = this.inputElement.offsetHeight;
      this.inputElement.style.height = currentHeight + 'px';
      
      // Expand width (transition is in CSS)
      this.wrapper.style.width = maxWrapperWidth + 'px';
      
      // After width transition completes, allow height to adjust
      setTimeout(() => {
        this.inputElement.style.height = 'auto';
        const newHeight = Math.min(this.inputElement.scrollHeight, 260);
        this.inputElement.style.height = newHeight + 'px';
        
        const wrapperHeight = newHeight + 40;
        this.wrapper.style.minHeight = Math.max(64, wrapperHeight) + 'px';
      }, 200); // Match CSS transition duration
    } else if (this.isExpanded) {
      // PHASE 2: Width already expanded, just adjust height smoothly
      this.inputElement.style.height = 'auto';
      const newHeight = Math.min(this.inputElement.scrollHeight, 260);
      this.inputElement.style.height = newHeight + 'px';
      
      const wrapperHeight = newHeight + 40;
      this.wrapper.style.minHeight = Math.max(64, wrapperHeight) + 'px';
    } else {
      // Text fits in initial width, keep single line
      this.inputElement.style.height = '26px';
      this.wrapper.style.minHeight = '64px';
    }
    
    // Reset expanded state if text is deleted
    if (neededWidth <= minWrapperWidth && this.isExpanded) {
      this.isExpanded = false;
      this.wrapper.style.width = minWrapperWidth + 'px';
      this.inputElement.style.height = '26px';
      this.wrapper.style.minHeight = '64px';
    }
  }

  /**
   * Handle keyboard events
   * UPDATED COMMENTS: Enter to send
   */
  handleKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.handleSend();
    }
  }

  /**
   * Handle send action
   * REUSED: Validation before opening modal
   */
  handleSend() {
    const message = this.inputElement.value.trim();
    
    // UPDATED COMMENTS: Validate message length
    if (message.length < this.options.minLength) {
      this.showError(`Message must be at least ${this.options.minLength} characters`);
      return;
    }
    
    // CRITICAL: Emit event to open contact modal
    this.eventBus.emit('contact-input:send', { message });
    
    console.log('// UPDATED COMMENTS: Message ready to send:', message);
  }

  /**
   * Show error feedback
   * SCALED FOR: User feedback system
   */
  showError(errorMessage) {
    // UPDATED COMMENTS: Temporary error indication
    this.wrapper.style.boxShadow = '0 0 0 2px rgba(255, 0, 0, 0.5)';
    
    setTimeout(() => {
      this.wrapper.style.boxShadow = '';
    }, 2000);
    
    this.eventBus.emit('contact-input:error', { error: errorMessage });
    console.warn('Contact input error:', errorMessage);
  }

  /**
   * Clear input field
   * REUSED: Reset after successful send
   */
  clearInput() {
    this.inputElement.value = '';
    this.wrapper.classList.remove('contact-input--has-value');
    this.eventBus.emit('contact-input:cleared');
  }

  /**
   * Get comment icon SVG
   * REUSED: iconamoon:comment icon from assets
   */
  async getCommentIconSVG() {
    try {
      const response = await fetch('assets/icons/iconamoon_comment.svg');
      return await response.text();
    } catch (error) {
      console.warn('Failed to load comment icon, using fallback');
      return `
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 13.3613 3.31462 14.6487 3.87595 15.7942L3.35769 18.6423C3.20779 19.4254 3.87595 20.0936 4.65905 19.9437L7.50719 19.4254C8.65267 19.9868 9.94006 20.3014 11.3014 20.3014" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    }
  }

  /**
   * Get send icon SVG
   * REUSED: iconamoon:send icon from assets
   */
  async getSendIconSVG() {
    try {
      const response = await fetch('assets/icons/icon-send-message.svg');
      return await response.text();
    } catch (error) {
      console.warn('Failed to load send icon, using fallback');
      return `
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.3359 11.9998L3.00781 3.33594L6.67578 11.9998L3.00781 20.6637L20.3359 11.9998Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6.67578 12H20.3359" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    }
  }

  /**
   * Destroy component
   * SCALED FOR: Memory management
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    // Clean up measure span
    if (this.measureSpan && this.measureSpan.parentNode) {
      this.measureSpan.parentNode.removeChild(this.measureSpan);
    }
    
    this.isInitialized = false;
    this.eventBus.emit('contact-input:destroyed');
  }
}

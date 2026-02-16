/* ANCHOR: contact_modal_component */
/* REUSED: Modal dialog for contact information */
/* SCALED FOR: Form validation and submission */
/* UPDATED COMMENTS: Contact modal with optional contact field */

import { EventBus } from '../../utils/event-bus.js';

/**
 * ContactModal class - Modal for collecting contact info before sending message
 * UPDATED COMMENTS: Shows message preview and optional contact field
 * REUSED: EventBus pattern for component communication
 * 
 * @class ContactModal
 */
export class ContactModal {
  constructor(container, options = {}) {
    this.container = container;
    this.eventBus = options.eventBus || new EventBus();
    this.options = {
      maxContactLength: 100,
      ...options
    };
    
    this.message = '';
    this.contactInfo = '';
    this.isVisible = false;
  }

  /**
   * Show modal with message
   * UPDATED COMMENTS: Display modal with message preview
   * CRITICAL FIX: Force reflow to ensure backdrop-filter is computed before animation
   */
  show(message) {
    this.message = message;
    this.contactInfo = '';
    
    this.render();
    this.cacheElements();
    
    // CRITICAL: Force browser to compute backdrop-filter by reading offsetHeight
    // This ensures blur is ready BEFORE animation starts
    this.overlay.offsetHeight;
    
    this.bindEvents();
    this.isVisible = true;
    
    // CRITICAL: Now start animation after backdrop-filter is computed
    // SCALED FOR: Smooth appearance without flash
    requestAnimationFrame(() => {
      this.container.classList.add('modal-container--visible');
      // CRITICAL: Remove aria-hidden when modal is visible
      this.container.setAttribute('aria-hidden', 'false');
    });
    
    this.eventBus.emit('modal:opened');
  }

  /**
   * Hide modal
   * REUSED: Smooth close animation
   */
  hide() {
    this.container.classList.remove('modal-container--visible');
    // CRITICAL: Set aria-hidden when modal is hidden
    this.container.setAttribute('aria-hidden', 'true');
    
    setTimeout(() => {
      this.container.innerHTML = '';
      this.isVisible = false;
      this.eventBus.emit('modal:closed');
    }, 300); // Match CSS transition
  }

  /**
   * Render modal HTML
   * REUSED: Figma design with minimal UI
   * CRITICAL FIX: Removed inline styles to prevent backdrop flash
   */
  render() {
    // CRITICAL FIX: Clear container first to ensure clean state
    this.container.innerHTML = '';
    
    // CRITICAL: Create overlay with backdrop-filter BEFORE adding to DOM
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'modal-title');
    
    overlay.innerHTML = `
      <div class="modal-content">
        <!-- ANCHOR: modal_description -->
        <!-- FIGMA SPECS: Description container with icon and text above fields -->
        <div class="modal-description">
          <!-- ANCHOR: modal_icon -->
          <div class="modal-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#C248A3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M11.307 9.739L15 9L14.261 12.693C14.1836 13.0801 13.9935 13.4356 13.7145 13.7148C13.4354 13.994 13.08 14.1844 12.693 14.262L9 15L9.739 11.307C9.81654 10.9201 10.0068 10.5648 10.2858 10.2858C10.5648 10.0068 10.9201 9.81654 11.307 9.739Z" stroke="#C248A3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          
          <!-- ANCHOR: modal_title -->
          <p id="modal-title" class="modal-title">Please, provide your contact info so I could respond you</p>
        </div>
        
        <!-- ANCHOR: contact_field -->
        <input 
          type="text" 
          class="modal-input" 
          placeholder="Email, Telegram, Phone"
          maxlength="${this.options.maxContactLength}"
          aria-label="Contact information"
        />
        
        <!-- ANCHOR: modal_button -->
        <button class="modal-button modal-button--primary" data-action="send">
          Send anonymously
        </button>
      </div>
    `;
    
    // CRITICAL: Add to DOM so backdrop-filter is computed
    this.container.appendChild(overlay);
  }

  /**
   * Cache DOM elements
   * SCALED FOR: Performance optimization
   */
  cacheElements() {
    this.overlay = this.container.querySelector('.modal-overlay');
    this.content = this.container.querySelector('.modal-content');
    this.input = this.container.querySelector('.modal-input');
    this.sendButton = this.container.querySelector('[data-action="send"]');
  }

  /**
   * Bind event listeners
   * REUSED: Event delegation pattern
   */
  bindEvents() {
    // UPDATED COMMENTS: Close on overlay click
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.hide();
      }
    });
    
    // UPDATED COMMENTS: Input change updates button text
    this.input.addEventListener('input', this.handleInputChange.bind(this));
    
    // UPDATED COMMENTS: Send button action
    this.sendButton.addEventListener('click', this.handleSend.bind(this));
    
    // UPDATED COMMENTS: Escape key closes modal
    document.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  /**
   * Handle input changes
   * UPDATED COMMENTS: Update button text based on contact field
   */
  handleInputChange(event) {
    this.contactInfo = event.target.value.trim();
    
    // CRITICAL: Change button text based on contact presence
    if (this.contactInfo.length > 0) {
      this.sendButton.textContent = 'SEND';
      this.sendButton.classList.remove('modal-button--anonymous');
    } else {
      this.sendButton.textContent = 'SEND ANONYMOUSLY';
      this.sendButton.classList.add('modal-button--anonymous');
    }
  }

  /**
   * Handle send action
   * REUSED: Validation and submission
   */
  async handleSend() {
    // CRITICAL: Validate contact field if filled (min 5 chars)
    if (this.contactInfo.length > 0 && this.contactInfo.length < 5) {
      this.showError('at least 5 characters');
      return;
    }
    
    // UPDATED COMMENTS: Disable button during submission
    this.sendButton.disabled = true;
    this.sendButton.textContent = 'SENDING...';
    
    try {
      // CRITICAL: Send message to backend
      const response = await this.sendMessage();
      
      if (response.success) {
        this.eventBus.emit('message:sent', {
          message: this.message,
          contact: this.contactInfo
        });
        this.hide();
      } else {
        throw new Error(response.error || 'Failed to send message');
      }
    } catch (error) {
      this.showError('Failed to send a message. Please try again later');
      this.sendButton.disabled = false;
      this.sendButton.textContent = this.contactInfo ? 'SEND' : 'SEND ANONYMOUSLY';
    }
  }

  /**
   * Send message to backend
   * SCALED FOR: API integration with error handling
   */
  async sendMessage() {
    const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:8000/api/contact/send'
      : '/api/contact/send';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: this.message,
        contact: this.contactInfo || null
      })
    });
    
    return await response.json();
  }

  /**
   * Show error message
   * SCALED FOR: User feedback
   * UPDATED COMMENTS: Simple red text error below input field
   */
  showError(errorMessage) {
    // UPDATED COMMENTS: Remove existing error if present
    const existingError = this.content.querySelector('.modal-error');
    if (existingError) {
      existingError.remove();
    }
    
    // UPDATED COMMENTS: Create simple red text error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'modal-error';
    errorDiv.textContent = errorMessage;
    
    // CRITICAL: Insert after input field
    this.content.insertBefore(errorDiv, this.sendButton);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 3000);
  }

  /**
   * Handle keyboard events
   * UPDATED COMMENTS: Escape closes modal
   */
  handleKeydown(event) {
    if (event.key === 'Escape' && this.isVisible) {
      this.hide();
    }
  }

  /**
   * Escape HTML to prevent XSS
   * CRITICAL: Security measure
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Destroy component
   * SCALED FOR: Memory management
   */
  destroy() {
    document.removeEventListener('keydown', this.handleKeydown);
    this.container.innerHTML = '';
    this.isVisible = false;
  }
}

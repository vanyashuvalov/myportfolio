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
   */
  show(message) {
    this.message = message;
    this.contactInfo = '';
    this.render();
    this.cacheElements();
    this.bindEvents();
    this.isVisible = true;
    
    // SCALED FOR: Smooth appearance animation
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
   * REUSED: Figma design with button components
   */
  render() {
    this.container.innerHTML = `
      <div class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-content">
          <!-- ANCHOR: modal_header -->
          <h2 id="modal-title" class="modal-title">Пожалуйста, дополните свой контакт, чтобы я вам ответил</h2>
          
          <!-- ANCHOR: message_preview -->
          <div class="modal-message-preview">
            <p>${this.escapeHtml(this.message)}</p>
          </div>
          
          <!-- ANCHOR: contact_field -->
          <div class="modal-field">
            <input 
              type="text" 
              class="modal-input" 
              placeholder="Email, Telegram, или оставьте пустым для анонимной отправки"
              maxlength="${this.options.maxContactLength}"
              aria-label="Contact information"
            />
          </div>
          
          <!-- ANCHOR: modal_actions -->
          <div class="modal-actions">
            <button class="modal-button modal-button--secondary" data-action="cancel">
              Отмена
            </button>
            <button class="modal-button modal-button--primary" data-action="send">
              Отправить анонимно
            </button>
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
    this.overlay = this.container.querySelector('.modal-overlay');
    this.content = this.container.querySelector('.modal-content');
    this.input = this.container.querySelector('.modal-input');
    this.sendButton = this.container.querySelector('[data-action="send"]');
    this.cancelButton = this.container.querySelector('[data-action="cancel"]');
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
    
    // UPDATED COMMENTS: Button actions
    this.sendButton.addEventListener('click', this.handleSend.bind(this));
    this.cancelButton.addEventListener('click', () => this.hide());
    
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
      this.sendButton.textContent = 'Отправить';
      this.sendButton.classList.remove('modal-button--anonymous');
    } else {
      this.sendButton.textContent = 'Отправить анонимно';
      this.sendButton.classList.add('modal-button--anonymous');
    }
  }

  /**
   * Handle send action
   * REUSED: Validation and submission
   */
  async handleSend() {
    // UPDATED COMMENTS: Disable button during submission
    this.sendButton.disabled = true;
    this.sendButton.textContent = 'Отправка...';
    
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
      console.error('Failed to send message:', error);
      this.showError('Не удалось отправить сообщение. Попробуйте позже.');
      this.sendButton.disabled = false;
      this.sendButton.textContent = this.contactInfo ? 'Отправить' : 'Отправить анонимно';
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
   */
  showError(errorMessage) {
    // UPDATED COMMENTS: Temporary error display
    const errorDiv = document.createElement('div');
    errorDiv.className = 'modal-error';
    errorDiv.textContent = errorMessage;
    
    this.content.insertBefore(errorDiv, this.content.querySelector('.modal-actions'));
    
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

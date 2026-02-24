/* ANCHOR: modal_manager */
/* FSD: features/modal-system → universal modal management */
/* REUSED: EventBus pattern for modal communication */
/* SCALED FOR: Multiple modal types with smooth transitions */

/**
 * ModalManager - Universal modal system for all content types
 * Handles modal lifecycle, animations, keyboard navigation, focus management
 * 
 * @class ModalManager
 */
export class ModalManager {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('modal-container');
    this.eventBus = options.eventBus;
    
    // UPDATED COMMENTS: Modal registry for different content types
    this.modalTypes = new Map();
    this.currentModal = null;
    this.isOpen = false;
    this.previousFocus = null;
    
    // SCALED FOR: Animation configuration
    this.config = {
      animationDuration: 300,
      backdropBlur: '20px',
      closeOnBackdrop: true,
      closeOnEscape: true,
      ...options.config
    };
    
    this.initialize();
  }

  /**
   * Initialize modal manager with event listeners
   * UPDATED COMMENTS: Global keyboard and click handlers
   */
  initialize() {
    if (!this.container) {
      console.error('Modal container not found');
      return;
    }
    
    // CRITICAL: Setup global event listeners
    this.setupEventListeners();
    
    // REUSED: EventBus integration
    if (this.eventBus) {
      this.eventBus.on('modal:open', (data) => this.open(data.type, data.options));
      this.eventBus.on('modal:close', () => this.close());
    }
  }

  /**
   * Setup global event listeners for modal system
   * SCALED FOR: Keyboard navigation and backdrop clicks
   */
  setupEventListeners() {
    // CRITICAL: ESC key closes modal
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isOpen && this.config.closeOnEscape) {
        this.close();
      }
    });
  }
  
  /**
   * Setup backdrop click listener after modal is rendered
   * UPDATED COMMENTS: Must be called after modal HTML is created
   */
  setupBackdropListener() {
    const backdrop = this.container.querySelector('.modal-backdrop');
    if (backdrop && this.config.closeOnBackdrop) {
      backdrop.addEventListener('click', () => {
        console.log('🔵 Backdrop clicked, closing modal');
        this.close();
      });
    }
  }
  
  /**
   * Setup close button click listener after modal is rendered
   * CRITICAL: Must be called after modal HTML is created
   * REUSED: Click handler pattern for modal controls
   */
  setupCloseButtonListener() {
    const closeButton = this.container.querySelector('.modal-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        console.log('❌ Close button clicked, closing modal');
        this.close();
      });
    }
  }

  /**
   * Setup contact modal specific event listeners
   * CRITICAL: Handle input changes and send button clicks
   * UPDATED COMMENTS: Changes button text based on contact input
   */
  setupContactModalListeners() {
    const input = this.container.querySelector('.modal-input');
    const sendButton = this.container.querySelector('[data-action="send-contact"]');
    
    if (!input || !sendButton) {
      console.error('❌ Contact modal elements not found');
      return;
    }
    
    // CRITICAL: Store message from data attribute
    const message = input.dataset.message || '';
    
    // UPDATED COMMENTS: Input change updates button text
    input.addEventListener('input', (event) => {
      const contactInfo = event.target.value.trim();
      
      // CRITICAL: Change button text based on contact presence
      if (contactInfo.length > 0) {
        sendButton.textContent = 'Send';
        sendButton.classList.remove('modal-button--anonymous');
      } else {
        sendButton.textContent = 'Send anonymously';
        sendButton.classList.add('modal-button--anonymous');
      }
    });
    
    // UPDATED COMMENTS: Send button action
    sendButton.addEventListener('click', async () => {
      const contactInfo = input.value.trim();
      
      // CRITICAL: Check rate limit BEFORE validation
      const { globalRateLimiter } = await import('../../shared/utils/rate-limiter.js');
      
      if (!globalRateLimiter.isAllowed('send-message')) {
        const { toastManager } = await import('../../shared/utils/toast-manager.js');
        const { TOAST_MESSAGES } = await import('../../shared/ui/toast/toast-messages.js');
        toastManager.showWarning(TOAST_MESSAGES.RATE_LIMIT_EXCEEDED);
        return;
      }
      
      // CRITICAL: Validate contact field if filled (min 5 chars)
      if (contactInfo.length > 0 && contactInfo.length < 5) {
        const { toastManager } = await import('../../shared/utils/toast-manager.js');
        const { TOAST_MESSAGES } = await import('../../shared/ui/toast/toast-messages.js');
        toastManager.showInfo(TOAST_MESSAGES.CONTACT_TOO_SHORT);
        return;
      }
      
      // UPDATED COMMENTS: Disable button during submission
      sendButton.disabled = true;
      sendButton.textContent = 'Sending...';
      
      try {
        // CRITICAL: Send message to backend
        const response = await this.sendContactMessage(message, contactInfo);
        
        if (response.success) {
          // CRITICAL: Record successful action for rate limiting
          globalRateLimiter.recordAction('send-message');
          
          // UPDATED COMMENTS: Show success toast notification
          const { toastManager } = await import('../../shared/utils/toast-manager.js');
          const { TOAST_MESSAGES } = await import('../../shared/ui/toast/toast-messages.js');
          toastManager.showSuccess(TOAST_MESSAGES.MESSAGE_SENT);
          
          // REUSED: Emit event for contact input to clear
          if (this.eventBus) {
            this.eventBus.emit('message:sent', {
              message,
              contact: contactInfo
            });
          }
          
          this.close();
        } else {
          throw new Error(response.error || 'Failed to send message');
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        
        // UPDATED COMMENTS: Show error toast notification
        const { toastManager } = await import('../../shared/utils/toast-manager.js');
        const { TOAST_MESSAGES } = await import('../../shared/ui/toast/toast-messages.js');
        toastManager.showError(TOAST_MESSAGES.MESSAGE_ERROR);
        
        sendButton.disabled = false;
        sendButton.textContent = contactInfo ? 'Send' : 'Send anonymously';
      }
    });
  }

  /**
   * Send contact message to backend
   * SCALED FOR: API integration with error handling
   * REUSED: Same logic as ContactModal
   * CRITICAL: Handles both JSON and non-JSON error responses
   */
  async sendContactMessage(message, contact) {
    const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:8000/api/contact/send'
      : '/api/contact/send';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        contact: contact || null
      })
    });
    
    // CRITICAL: Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      // UPDATED COMMENTS: Handle non-JSON error responses
      const text = await response.text();
      throw new Error(`Server error: ${text.substring(0, 100)}`);
    }
  }

  /**
   * Register modal type with content renderer
   * REUSED: Plugin pattern for extensible modal types
   * 
   * @param {string} type - Modal type identifier
   * @param {Function} renderer - Content rendering function
   */
  registerModalType(type, renderer) {
    this.modalTypes.set(type, renderer);
  }

  /**
   * Open modal with specified type and options
   * SCALED FOR: Smooth entrance animations and focus management
   * UPDATED COMMENTS: Support scroll position restoration for seamless back navigation
   * UPDATED COMMENTS: Skip close button animation when returning from project page
   * 
   * @param {string} type - Modal type (projects, project-detail, about, reviews)
   * @param {Object} options - Modal configuration and data
   */
  async open(type, options = {}) {
    if (this.isOpen) {
      console.log('⚠️ Modal already open, closing first');
      await this.close();
    }
    
    const renderer = this.modalTypes.get(type);
    if (!renderer) {
      console.error(`❌ Modal type "${type}" not registered`);
      return;
    }
    
    // CRITICAL: Store current focus for restoration
    this.previousFocus = document.activeElement;
    
    // UPDATED COMMENTS: Create modal content
    const modalContent = await renderer(options);
    
    // CRITICAL: Determine if fullscreen modal (projects list)
    const isFullscreen = type === 'projects-list' || type === 'projects';
    const fullscreenClass = isFullscreen ? ' modal-content--fullscreen' : '';
    
    // REUSED: Modal structure with backdrop, content, and close button
    // CRITICAL: Don't render backdrop for fullscreen modals (no shadow needed)
    const backdropHtml = isFullscreen ? '' : '<div class="modal-backdrop"></div>';
    
    this.container.innerHTML = `
      ${backdropHtml}
      <button class="modal-close" aria-label="Close modal" tabindex="-1">
        <img src="/assets/icons/iconamoon_close.svg" alt="Close" />
      </button>
      <div class="modal-content${fullscreenClass}" role="dialog" aria-modal="true">
        <div class="modal-body">
          ${modalContent}
        </div>
      </div>
    `;
    
    // CRITICAL: Add fullscreen class first (before open class for animation)
    if (isFullscreen) {
      this.container.classList.add('modal-container--fullscreen');
      
      // CRITICAL: Skip background fade-in if returning from project page
      if (options.skipBackgroundAnimation) {
        const modalContent = this.container.querySelector('.modal-content--fullscreen');
        if (modalContent) {
          modalContent.style.opacity = '1';
          modalContent.style.transition = 'none';
          console.log('⚡ Background shown immediately (no fade-in)');
        }
      }
    }
    this.container.setAttribute('aria-hidden', 'false');
    this.container.removeAttribute('aria-hidden');
    
    // UPDATED COMMENTS: Restore scroll position if provided
    // CRITICAL: Must be done before animation starts
    if (options.scrollPosition !== undefined && isFullscreen) {
      const modalContent = this.container.querySelector('.modal-content--fullscreen');
      if (modalContent) {
        modalContent.scrollTop = options.scrollPosition;
        console.log('📜 Restored scroll position:', options.scrollPosition);
      }
    }
    
    // UPDATED COMMENTS: Remove inline visibility style to allow CSS animations to work
    // CRITICAL: CSS will handle visibility through classes, inline style was blocking close button animation
    
    // CRITICAL: Force browser to compute initial styles by reading offsetHeight
    // This ensures opacity: 0 and transform are applied BEFORE animation starts
    const projectsList = this.container.querySelector('.projects-list');
    if (projectsList) {
      // Force reflow
      projectsList.offsetHeight;
      console.log('🔄 Forced reflow, initial computed opacity:', window.getComputedStyle(projectsList).opacity);
    }
    
    // UPDATED COMMENTS: Add open class with delay to trigger CSS animations
    // CRITICAL: Use requestAnimationFrame to ensure browser applies initial styles first
    // CRITICAL: Skip animation delay if returning from project page
    if (options.skipBackgroundAnimation) {
      // CRITICAL: Add open class immediately without animation delay
      console.log('⚡ Adding modal-container--open class immediately (no animation)');
      this.container.classList.add('modal-container--open');
      
      // CRITICAL: Show close button immediately
      if (isFullscreen) {
        const closeButton = this.container.querySelector('.modal-close');
        if (closeButton) {
          closeButton.classList.add('modal-close--visible');
        }
      }
    } else {
      // UPDATED COMMENTS: Normal animation with requestAnimationFrame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.container.classList.add('modal-container--open');
          
          // CRITICAL: Add close button visible class with 100ms delay (like contact-input pattern)
          // UPDATED COMMENTS: Skip animation if returning from project page (button already visible)
          // REUSED: Simple fade-in with modal content
          if (isFullscreen) {
            const closeButton = this.container.querySelector('.modal-close');
            if (closeButton) {
              // CRITICAL: Show button immediately - CSS handles fade-in
              closeButton.classList.add('modal-close--visible');
            }
          }
        });
      });
    }
    
    this.isOpen = true;
    
    // CRITICAL: Setup backdrop click listener
    this.setupBackdropListener();
    
    // UPDATED COMMENTS: Setup close button click listener
    this.setupCloseButtonListener();
    
    // CRITICAL: Setup contact modal specific listeners if it's a contact modal
    if (type === 'contact') {
      this.setupContactModalListeners();
    }
    
    // UPDATED COMMENTS: Prevent body scroll
    
    // UPDATED COMMENTS: Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // REUSED: Focus management for accessibility - skip close button
    requestAnimationFrame(() => {
      const firstFocusable = this.container.querySelector('.modal-body button, .modal-body a, .modal-body input, .modal-body [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) {
        firstFocusable.focus();
      }
    });
    
    // CRITICAL: Emit open event
    if (this.eventBus) {
      this.eventBus.emit('modal:opened', { type, options });
    }
  }

  /**
   * Close current modal with smooth animation
   * UPDATED COMMENTS: Cleanup and focus restoration with proper accessibility
   */
  async close() {
    if (!this.isOpen) return;
    
    // CRITICAL: Remove focus from modal elements before hiding
    // UPDATED COMMENTS: Prevents aria-hidden focus warning
    if (document.activeElement && this.container.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    
    // SCALED FOR: Smooth exit animation
    this.container.classList.remove('modal-container--open');
    this.container.classList.remove('modal-container--fullscreen');
    this.container.classList.add('modal-container--closing');
    this.container.setAttribute('aria-hidden', 'true');
    // UPDATED COMMENTS: Remove inline style, let CSS handle visibility through classes
    
    // CRITICAL: Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, this.config.animationDuration));
    
    // UPDATED COMMENTS: Cleanup
    this.container.innerHTML = '';
    this.container.classList.remove('modal-container--closing');
    // CRITICAL: Clear any inline styles that might have been set
    this.container.style.visibility = '';
    this.isOpen = false;
    
    // REUSED: Restore body scroll
    document.body.style.overflow = '';
    
    // CRITICAL: Restore focus to previous element
    if (this.previousFocus) {
      this.previousFocus.focus();
      this.previousFocus = null;
    }
    
    // UPDATED COMMENTS: Emit close event
    if (this.eventBus) {
      this.eventBus.emit('modal:closed');
    }
  }

  /**
   * Check if modal is currently open
   * REUSED: State query utility
   */
  isModalOpen() {
    return this.isOpen;
  }

  /**
   * Destroy modal manager and cleanup
   * SCALED FOR: Complete resource cleanup
   */
  destroy() {
    if (this.isOpen) {
      this.close();
    }
    
    if (this.eventBus) {
      this.eventBus.off('modal:open');
      this.eventBus.off('modal:close');
    }
  }
}

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
   * 
   * @param {string} type - Modal type (projects, project-detail, about, reviews)
   * @param {Object} options - Modal configuration and data
   */
  async open(type, options = {}) {
    console.log('🚀 ModalManager.open called', { type, options });
    
    if (this.isOpen) {
      console.log('⚠️ Modal already open, closing first');
      await this.close();
    }
    
    const renderer = this.modalTypes.get(type);
    if (!renderer) {
      console.error(`❌ Modal type "${type}" not registered`);
      console.log('📋 Available types:', Array.from(this.modalTypes.keys()));
      return;
    }
    
    console.log('✅ Renderer found, creating content...');
    
    // CRITICAL: Store current focus for restoration
    this.previousFocus = document.activeElement;
    
    // UPDATED COMMENTS: Create modal content
    const modalContent = await renderer(options);
    
    console.log('✅ Content created, rendering modal...');
    
    // REUSED: Modal structure with backdrop and content
    this.container.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content" role="dialog" aria-modal="true">
        <div class="modal-body">
          ${modalContent}
        </div>
      </div>
    `;
    
    // CRITICAL: Add open class BEFORE setting up listeners
    this.container.classList.add('modal-container--open');
    this.container.setAttribute('aria-hidden', 'false');
    this.container.removeAttribute('aria-hidden');
    
    // CRITICAL: Force visibility with inline styles to override aria-hidden
    this.container.style.visibility = 'visible';
    
    this.isOpen = true;
    
    // CRITICAL: Setup backdrop click listener
    this.setupBackdropListener();
    
    console.log('✅ Modal opened successfully');
    
    // UPDATED COMMENTS: Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // REUSED: Focus management for accessibility
    requestAnimationFrame(() => {
      const firstFocusable = this.container.querySelector('button, a, input, [tabindex]:not([tabindex="-1"])');
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
   * UPDATED COMMENTS: Cleanup and focus restoration
   */
  async close() {
    if (!this.isOpen) return;
    
    // SCALED FOR: Smooth exit animation
    this.container.classList.remove('modal-container--open');
    this.container.classList.add('modal-container--closing');
    this.container.setAttribute('aria-hidden', 'true');
    this.container.style.visibility = 'hidden';
    
    // CRITICAL: Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, this.config.animationDuration));
    
    // UPDATED COMMENTS: Cleanup
    this.container.innerHTML = '';
    this.container.classList.remove('modal-container--closing');
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

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
          console.log('🎬 Adding modal-container--open class');
          this.container.classList.add('modal-container--open');
          
          // CRITICAL: Debug - check if projects-list exists
          const projectsList = this.container.querySelector('.projects-list');
          if (projectsList) {
            console.log('✅ .projects-list found in DOM');
            const initialStyles = window.getComputedStyle(projectsList);
            console.log('📊 Initial opacity:', initialStyles.opacity);
            console.log('📊 Initial transform:', initialStyles.transform);
            console.log('📊 Initial transition:', initialStyles.transition);
            
            // CRITICAL: Force check after 100ms
            setTimeout(() => {
              const afterStyles = window.getComputedStyle(projectsList);
              console.log('📊 After 100ms opacity:', afterStyles.opacity);
              console.log('📊 After 100ms transform:', afterStyles.transform);
            }, 100);
            
            // CRITICAL: Check after animation should complete (1000ms)
            setTimeout(() => {
              const finalStyles = window.getComputedStyle(projectsList);
              console.log('📊 After 1000ms opacity:', finalStyles.opacity);
              console.log('📊 After 1000ms transform:', finalStyles.transform);
            }, 1000);
          } else {
            console.error('❌ .projects-list NOT FOUND in DOM!');
          }
          
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
    
    console.log('✅ Modal opened successfully');
    
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

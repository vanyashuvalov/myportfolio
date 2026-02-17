/* ANCHOR: main_entry */
/* REUSED: Application entry point with modular architecture */
/* SCALED FOR: Lazy loading and performance optimization */

// UPDATED COMMENTS: ES6 module imports for clean dependency management
import { DesktopCanvas } from './features/desktop-canvas/desktop-canvas.js';
import { PerformanceMonitor } from './shared/utils/performance-monitor.js';
import { AssetManager } from './shared/utils/asset-manager.js';
import { EventBus } from './shared/utils/event-bus.js';
import { NavigationHeader } from './shared/ui/navigation/navigation-header.js';
import { ContactInput } from './shared/ui/contact-input/contact-input.js';
import { ContactModal } from './shared/ui/modal/contact-modal.js';
import { ModalManager } from './features/modal-system/modal-manager.js';
import { ProjectsListModal } from './features/modal-system/projects-list-modal.js';
import { PageManager } from './features/page-manager/page-manager.js';

/**
 * Application class - Main application controller
 * Handles initialization, lifecycle, and global state management
 * 
 * @class Application
 */
class Application {
  constructor() {
    this.canvas = null;
    this.navigation = null;
    this.contactInput = null;
    this.contactModal = null;
    this.modalManager = null;
    this.pageManager = null;
    this.performanceMonitor = null;
    this.assetManager = null;
    this.eventBus = null;
    this.isInitialized = false;
  }

  /**
   * Initialize application with all core systems
   * UPDATED COMMENTS: Async initialization with error handling
   * CRITICAL: Use window load event to hide loader after all resources loaded
   */
  async init() {
    try {
      // Initialize core utilities
      this.eventBus = new EventBus();
      this.performanceMonitor = new PerformanceMonitor();
      this.assetManager = new AssetManager();

      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }

      // Initialize desktop canvas
      const canvasElement = document.getElementById('desktop-canvas');
      if (!canvasElement) {
        throw new Error('Desktop canvas element not found');
      }

      this.canvas = new DesktopCanvas(canvasElement, {
        eventBus: this.eventBus,
        assetManager: this.assetManager
      });

      // ANCHOR: navigation_initialization
      // REUSED: Navigation header component with shared EventBus
      const navigationContainer = document.getElementById('navigation-container');
      if (!navigationContainer) {
        throw new Error('Navigation container element not found');
      }

      this.navigation = new NavigationHeader(navigationContainer, {
        eventBus: this.eventBus,
        userName: 'Shuvalov Ivan',
        userPhoto: 'assets/images/avatar.jpg',
        statusText: 'Open for work',
        currentPage: 'Home',
        currentLanguage: 'EN',
        socialLinks: {
          telegram: 'https://t.me/shuvalov_ivan',
          linkedin: 'https://linkedin.com/in/shuvalov-ivan',
          email: 'mailto:ivan.shuvalov@example.com',
          github: 'https://github.com/shuvalov-ivan'
        },
        cvUrl: 'assets/documents/Ivan_Shuvalov_CV.pdf'
      });

      await this.navigation.init();

      // ANCHOR: contact_input_initialization
      // REUSED: Contact input component with shared EventBus
      const contactInputContainer = document.getElementById('contact-input-container');
      
      if (!contactInputContainer) {
        console.error('❌ Contact input container not found');
      } else {
        this.contactInput = new ContactInput(contactInputContainer, {
          eventBus: this.eventBus,
          placeholder: 'Message me right here...',
          minLength: 10,
          maxLength: 2000
        });

        await this.contactInput.init();
      }

      // ANCHOR: contact_modal_initialization
      // REUSED: Contact modal component with shared EventBus
      const modalContainer = document.getElementById('modal-container');
      if (modalContainer) {
        this.contactModal = new ContactModal(modalContainer, {
          eventBus: this.eventBus
        });
        
        // CRITICAL: Listen for send events from contact input
        this.eventBus.on('contact-input:send', ({ message }) => {
          this.contactModal.show(message);
        });
        
        // REUSED: Listen for successful message send
        this.eventBus.on('message:sent', () => {
          if (this.contactInput) {
            this.contactInput.clearInput();
          }
        });
      }

      // ANCHOR: modal_manager_initialization
      // UPDATED COMMENTS: Modal manager for projects list with separate container
      const projectsModalContainer = document.getElementById('projects-modal-container');
      
      if (!projectsModalContainer) {
        console.error('❌ Projects modal container not found');
      } else {
        this.modalManager = new ModalManager({
          container: projectsModalContainer,
          eventBus: this.eventBus
        });

        // ANCHOR: page_manager_initialization
        // CRITICAL: Page manager for project detail pages
        this.pageManager = new PageManager({
          eventBus: this.eventBus,
          desktopCanvas: this.canvas
        });

        // REUSED: Register projects list modal renderer
        const projectsListModal = new ProjectsListModal({
          eventBus: this.eventBus,
          pageManager: this.pageManager
        });

        this.modalManager.registerModalType('projects-list', async (options) => {
          const html = await projectsListModal.render(options);
          
          // CRITICAL: Setup event listeners after modal renders
          setTimeout(() => {
            const modalContent = projectsModalContainer.querySelector('.modal-content');
            if (modalContent) {
              projectsListModal.setupEventListeners(modalContent);
            }
          }, 100);
          
          return html;
        });

        // UPDATED COMMENTS: Listen for folder widget clicks
        this.eventBus.on('folder:clicked', ({ category }) => {
          console.log('📥 Received folder:clicked event', { category });
          console.log('🔍 ModalManager exists?', !!this.modalManager);
          console.log('🔍 Opening modal with category:', category);
          
          try {
            this.modalManager.open('projects-list', { category });
          } catch (error) {
            console.error('❌ Failed to open modal:', error);
          }
        });
      }

      // Setup global event listeners
      this.setupGlobalEvents();

      // CRITICAL: Wait for window.load event (all resources including images loaded)
      // REUSED: Standard pattern for hiding page loaders
      if (document.readyState === 'complete') {
        this.hideLoadingIndicator();
      } else {
        window.addEventListener('load', () => {
          this.hideLoadingIndicator();
        });
      }

      this.isInitialized = true;
      this.eventBus.emit('app:initialized');
    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      this.showErrorMessage(error.message);
    }
  }

  /**
   * Setup global event listeners
   * REUSED: Universal event handling patterns
   */
  setupGlobalEvents() {
    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Handle visibility change for performance optimization
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Handle keyboard shortcuts
    document.addEventListener('keydown', this.handleKeydown.bind(this));
    
    // Handle unhandled errors
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
  }

  /**
   * Handle window resize events
   * SCALED FOR: Responsive canvas and navigation updates
   */
  handleResize() {
    if (this.canvas) {
      this.canvas.handleResize();
    }
    // REUSED: Navigation responsive handling through EventBus
    if (this.navigation) {
      this.eventBus.emit('app:resize');
    }
  }

  /**
   * Handle visibility change for performance optimization
   * UPDATED COMMENTS: Pause animations when tab is not visible
   */
  handleVisibilityChange() {
    if (document.hidden) {
      this.eventBus.emit('app:hidden');
      if (this.performanceMonitor) {
        this.performanceMonitor.pause();
      }
    } else {
      this.eventBus.emit('app:visible');
      if (this.performanceMonitor) {
        this.performanceMonitor.resume();
      }
    }
  }

  /**
   * Handle keyboard shortcuts
   * REUSED: Accessibility and power user features
   */
  handleKeydown(event) {
    // Escape key closes modals
    if (event.key === 'Escape') {
      this.eventBus.emit('modal:close');
    }
    
    // Space key feeds the cat
    if (event.key === ' ' && !event.target.matches('input, textarea')) {
      event.preventDefault();
      this.eventBus.emit('cat:feed');
    }
  }

  /**
   * Hide loading indicator with smooth animation
   * UPDATED COMMENTS: Smooth transition to main interface with body class toggle
   * CRITICAL: Shows mountains and all content after loading is complete
   */
  hideLoadingIndicator() {
    const indicator = document.getElementById('loading-indicator');
    if (indicator) {
      // CRITICAL: Add 'loaded' class to body to trigger CSS transitions
      document.body.classList.add('loaded');
      
      // REUSED: Hide loading indicator with fade-out animation
      indicator.classList.add('hidden');
      
      // SCALED FOR: Remove loading indicator from DOM after animation completes
      setTimeout(() => {
        indicator.remove();
      }, 500); // Match CSS transition duration
    }
  }

  /**
   * Show error message to user
   * REUSED: Error handling UI pattern
   */
  showErrorMessage(message) {
    const indicator = document.getElementById('loading-indicator');
    if (indicator) {
      indicator.innerHTML = `
        <div class="error-message">
          <h2>Oops! Something went wrong</h2>
          <p>${message}</p>
          <button onclick="location.reload()">Reload Page</button>
        </div>
      `;
    }
  }

  /**
   * Handle global JavaScript errors
   * SCALED FOR: Production error tracking
   */
  handleError(event) {
    console.error('Global error:', event.error);
    this.eventBus.emit('app:error', event.error);
  }

  /**
   * Handle unhandled promise rejections
   * UPDATED COMMENTS: Comprehensive error handling
   */
  handleUnhandledRejection(event) {
    console.error('Unhandled promise rejection:', event.reason);
    this.eventBus.emit('app:error', event.reason);
  }
}

// ANCHOR: application_startup
// Initialize application when script loads
const app = new Application();
app.init();

// Make app globally available for debugging
if (typeof window !== 'undefined') {
  window.app = app;
}
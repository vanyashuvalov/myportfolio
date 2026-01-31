/* ANCHOR: main_entry */
/* REUSED: Application entry point with modular architecture */
/* SCALED FOR: Lazy loading and performance optimization */

// UPDATED COMMENTS: ES6 module imports for clean dependency management
import { DesktopCanvas } from './features/desktop-canvas/desktop-canvas.js';
import { PerformanceMonitor } from './shared/utils/performance-monitor.js';
import { AssetManager } from './shared/utils/asset-manager.js';
import { EventBus } from './shared/utils/event-bus.js';

/**
 * Application class - Main application controller
 * Handles initialization, lifecycle, and global state management
 * 
 * @class Application
 */
class Application {
  constructor() {
    this.canvas = null;
    this.performanceMonitor = null;
    this.assetManager = null;
    this.eventBus = null;
    this.isInitialized = false;
  }

  /**
   * Initialize application with all core systems
   * UPDATED COMMENTS: Async initialization with error handling
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

      // Setup global event listeners
      this.setupGlobalEvents();

      // Hide loading indicator
      this.hideLoadingIndicator();

      this.isInitialized = true;
      this.eventBus.emit('app:initialized');

      console.log('Application initialized successfully');
    } catch (error) {
      console.error('Failed to initialize application:', error);
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
   * SCALED FOR: Responsive canvas updates
   */
  handleResize() {
    if (this.canvas) {
      this.canvas.handleResize();
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
   * UPDATED COMMENTS: Smooth transition to main interface
   */
  hideLoadingIndicator() {
    const indicator = document.getElementById('loading-indicator');
    if (indicator) {
      indicator.style.opacity = '0';
      indicator.style.transition = 'opacity 0.3s ease-out';
      
      setTimeout(() => {
        indicator.style.display = 'none';
      }, 300);
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
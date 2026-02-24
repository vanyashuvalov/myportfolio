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
import { ModalManager } from './features/modal-system/modal-manager.js';
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
    this.contactModalManager = null;
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
      // CRITICAL: Uses centralized social links from config
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
        currentLanguage: 'EN'
        // CRITICAL: Social links are now managed in NavigationHeader via action-buttons.js
        // which imports from shared/config/social-links.js
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
          minLength: 10,
          maxLength: 2000
        });

        await this.contactInput.init();
        
        // REUSED: Listen for successful message send
        this.eventBus.on('message:sent', () => {
          if (this.contactInput) {
            this.contactInput.clearInput();
          }
        });
      }

      // ANCHOR: modal_manager_initialization
      // UPDATED COMMENTS: Contact modal manager for regular modals
      
      // CRITICAL: Contact modal manager (regular modals above everything)
      const modalContainer = document.getElementById('modal-container');
      if (!modalContainer) {
        console.error('❌ Modal container not found');
      } else {
        this.contactModalManager = new ModalManager({
          container: modalContainer,
          eventBus: this.eventBus
        });
        
        // CRITICAL: Register contact modal renderer
        this.contactModalManager.registerModalType('contact', async (options) => {
          const { message } = options;
          return this.renderContactModal(message);
        });
        
        // CRITICAL: Listen for contact input send
        this.eventBus.on('contact-input:send', ({ message }) => {
          this.contactModalManager.open('contact', { message });
        });
      }

      // ANCHOR: page_manager_initialization
      // CRITICAL: Page manager for project pages
      this.pageManager = new PageManager({
        eventBus: this.eventBus,
        desktopCanvas: this.canvas
      });

      // UPDATED COMMENTS: Listen for folder widget clicks and navigation events
      // CRITICAL: Handle both direct URL navigation and category-based navigation
      this.eventBus.on('folder:navigate', ({ url, category }) => {
        if (this.pageManager) {
          // CRITICAL: Priority 1 - Use direct URL if provided (from navigation menu)
          // CRITICAL: Priority 2 - Use category to determine URL (from folder widget)
          let targetUrl;
          
          if (url) {
            // UPDATED COMMENTS: Direct URL from navigation menu or breadcrumb
            targetUrl = url;
          } else if (category) {
            // UPDATED COMMENTS: Category-based URL from folder widget
            targetUrl = category === 'fun' ? '/fun' : '/projects';
          } else {
            // UPDATED COMMENTS: Fallback to projects if neither provided
            console.warn('⚠️ folder:navigate called without url or category, defaulting to /projects');
            targetUrl = '/projects';
          }
          
          this.pageManager.router.navigate(targetUrl);
        } else {
          console.error('❌ PageManager not available');
        }
      });

      // CRITICAL: Listen for router navigation events to update navigation header
      // UPDATED COMMENTS: Update currentPage based on URL path
      this.eventBus.on('router:navigate', ({ url }) => {
        this.updateNavigationPage(url);
      });

      // CRITICAL: Listen for page shown events to update navigation
      // UPDATED COMMENTS: Use category to determine correct page name (Projects vs Fun)
      this.eventBus.on('page:shown', ({ type, projectId, category }) => {
        if (type === 'project' && projectId) {
          // UPDATED COMMENTS: Will be updated when project data loads
          this.updateNavigationForProject(projectId, category);
        } else if (type === 'projects-list') {
          // CRITICAL: Use category to determine page name
          // UPDATED COMMENTS: category='fun' → 'Fun', otherwise 'Projects'
          const pageName = category === 'fun' ? 'Fun' : 'Projects';
          this.navigation.updateCurrentPage(pageName);
        }
      });

      // CRITICAL: Listen for page hidden events (return to desktop)
      this.eventBus.on('page:hidden', ({ type }) => {
        if (type === 'desktop-canvas') {
          this.navigation.updateCurrentPage('Home');
        }
      });

      // ANCHOR: pdf_viewer_initialization
      // CRITICAL: PDF viewer for resume display
      // REUSED: PDFViewer component from shared/ui
      const { PDFViewer } = await import('./shared/ui/pdf-viewer/pdf-viewer.js');
      this.pdfViewer = new PDFViewer({
        eventBus: this.eventBus
      });

      // UPDATED COMMENTS: Listen for resume widget PDF open event
      this.eventBus.on('resume:open-pdf', ({ pdfUrl, title }) => {
        if (this.pdfViewer) {
          this.pdfViewer.open(pdfUrl, title);
        } else {
          console.error('❌ PDFViewer not available');
        }
      });

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
   * Render contact modal HTML
   * REUSED: Contact modal renderer for ModalManager
   */
  renderContactModal(message) {
    return `
      <div class="modal-contact">
        <div class="modal-description">
          <div class="modal-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#C248A3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M11.307 9.739L15 9L14.261 12.693C14.1836 13.0801 13.9935 13.4356 13.7145 13.7148C13.4354 13.994 13.08 14.1844 12.693 14.262L9 15L9.739 11.307C9.81654 10.9201 10.0068 10.5648 10.2858 10.2858C10.5648 10.0068 10.9201 9.81654 11.307 9.739Z" stroke="#C248A3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <p class="modal-title">Please, provide your contact info so I could respond you</p>
        </div>
        
        <input 
          type="text" 
          class="modal-input" 
          placeholder="Email, Telegram, Phone"
          maxlength="100"
          aria-label="Contact information"
          data-message="${this.escapeHtml(message)}"
        />
        
        <button class="modal-button modal-button--primary modal-button--anonymous" data-action="send-contact">
          Send anonymously
        </button>
      </div>
    `;
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

  /**
   * Update navigation page based on URL
   * CRITICAL: Parse URL and update navigation header
   * UPDATED COMMENTS: Shows current page name in navigation WITHOUT re-rendering
   * UPDATED COMMENTS: Added support for /fun route (projects list)
   * 
   * @param {string} url - Current URL path
   */
  updateNavigationPage(url) {
    if (!this.navigation) return;

    // CRITICAL: Parse URL to determine page name
    if (url === '/' || url === '') {
      this.navigation.updateCurrentPage('Home');
    } else if (url === '/projects' || url.startsWith('/projects/')) {
      // UPDATED COMMENTS: Will be updated with project title when loaded
      this.navigation.updateCurrentPage('Projects');
    } else if (url === '/fun') {
      // CRITICAL: Fun projects list page
      this.navigation.updateCurrentPage('Fun');
    } else if (url.startsWith('/fun/')) {
      // UPDATED COMMENTS: Will be updated with project title when loaded
      this.navigation.updateCurrentPage('Fun');
    } else {
      // SCALED FOR: Default fallback
      this.navigation.updateCurrentPage('Home');
    }
  }

  /**
   * Update navigation for specific project
   * CRITICAL: Fetch project data and update navigation with title
   * UPDATED COMMENTS: Shows project title in navigation breadcrumb WITHOUT re-rendering
   * 
   * @param {string} projectId - Project ID
   * @param {string} category - Project category
   */
  async updateNavigationForProject(projectId, category) {
    if (!this.navigation) return;

    try {
      // CRITICAL: Fetch project metadata from backend
      // UPDATED COMMENTS: Use relative URL for production deployment
      const apiUrl = window.location.hostname === 'localhost' 
        ? `http://localhost:8000/api/projects/${category}/${projectId}`
        : `/api/projects/${category}/${projectId}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        console.error('Failed to fetch project metadata');
        return;
      }

      const markdown = await response.text();
      
      // REUSED: Parse frontmatter to get title
      const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/);
      
      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        const titleMatch = frontmatter.match(/title:\s*["']?([^"'\n]+)["']?/);
        
        if (titleMatch) {
          const projectTitle = titleMatch[1].trim();
          this.navigation.updateCurrentPage(projectTitle);
        }
      }
    } catch (error) {
      console.error('Failed to update navigation for project:', error);
    }
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
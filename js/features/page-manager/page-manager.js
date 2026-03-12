/**
 * PageManager - Main orchestrator for page rendering and transitions
 * FSD: features/page-manager → routes, transitions, handlers coordination
 * REUSED: Router for navigation, handlers for page types
 * 
 * @class PageManager
 */
import { Router } from './router.js';
import { ProjectPageHandler } from './project-page-handler.js';
import { ProjectsListPageHandler } from './projects-list-page-handler.js';
import { FunGalleryPageHandler } from './fun-gallery-page-handler.js';

export class PageManager {
  constructor(options = {}) {
    this.eventBus = options.eventBus;
    this.desktopCanvas = options.desktopCanvas;
    this.projectsModalManager = options.projectsModalManager;
    
    // Page container
    this.pageContainer = null;
    this.transitionOverlay = null;
    
    // State
    this.isPageMode = false;
    this.currentPage = null;
    this.lastModalScrollPosition = 0;
    this.lastModalCategory = 'work';
    this.isReturningToModal = false;
    
    // Handlers
    this.projectHandler = null;
    this.projectsListHandler = null;
    this.funGalleryHandler = null;
    
    // Router
    this.router = new Router({ eventBus: this.eventBus });
    
    this.initialize();
  }

  /**
   * Initialize page manager
   */
  initialize() {
    this.createPageContainer();
    this.createTransitionOverlay();
    this.initHandlers();
    this.registerRoutes();
    this.handleInitialRoute();
  }

  /**
   * Create page container and overlay
   */
  createPageContainer() {
    this.pageContainer = document.createElement('div');
    this.pageContainer.id = 'page-container';
    this.pageContainer.className = 'page-container';
    this.pageContainer.style.display = 'none';
    
    const desktopCanvas = document.getElementById('desktop-canvas');
    if (desktopCanvas && desktopCanvas.parentNode) {
      desktopCanvas.parentNode.insertBefore(this.pageContainer, desktopCanvas.nextSibling);
    } else {
      document.body.appendChild(this.pageContainer);
    }
  }

  /**
   * Create transition overlay
   */
  createTransitionOverlay() {
    this.transitionOverlay = document.createElement('div');
    this.transitionOverlay.id = 'page-transition-overlay';
    this.transitionOverlay.className = 'page-transition-overlay';
    document.body.appendChild(this.transitionOverlay);
  }

  /**
   * Initialize page handlers
   */
  initHandlers() {
    const handlerOptions = {
      eventBus: this.eventBus,
      pageContainer: this.pageContainer
    };

    this.projectHandler = new ProjectPageHandler(handlerOptions);
    this.projectsListHandler = new ProjectsListPageHandler(handlerOptions);
    this.funGalleryHandler = new FunGalleryPageHandler(handlerOptions);

    // UPDATED COMMENTS: Listen to handler events
    this.bindHandlerEvents();
  }

  /**
   * Bind event listeners from handlers
   * UPDATED COMMENTS: Handlers emit events, page-manager handles them
   * CRITICAL: EventBus-based communication between handlers and manager
   */
  bindHandlerEvents() {
    if (!this.eventBus) {
      console.error('❌ EventBus is null in bindHandlerEvents!');
      return;
    }

    // CRITICAL: Close page and return to desktop
    this.eventBus.on('page:close', () => {
      this.router.navigate('/');
    });

    // CRITICAL: Back to projects list from project detail
    this.eventBus.on('page:backToProjects', (data) => {
      this.transitionBackToProjects(data?.category || 'work');
    });

    // CRITICAL: Navigate to project from list
    this.eventBus.on('page:navigateToProject', (data) => {
      if (data?.projectId) {
        this.navigateToProjectWithTransition(data.projectId, data.category || 'work', {
          fromList: data.fromList
        });
      }
    });
  }

  /**
   * Register routes
   */
  registerRoutes() {
    // Project detail route
    this.router.register('/projects/:id', async (context) => {
      const id = context.params.id;
      if (!id || id === 'work' || id === 'fun') {
        this.showProjectsListPage(id || 'work');
      } else {
        this.showProjectPage(id, 'work');
      }
    });

    // Projects list route
    this.router.register('/projects', () => this.showProjectsListPage('work'));

    // Fun gallery route
    this.router.register('/fun', () => this.showFunGalleryPage());
    this.router.register('/fun/:id', (context) => {
      this.showProjectPage(context.params.id, 'fun');
    });

    // Home route
    this.router.register('/', () => this.showDesktopCanvas());
  }

  /**
   * Handle initial URL on load
   */
  handleInitialRoute() {
    const path = window.location.pathname;
    if (path !== '/') {
      this.router.handleRoute(path);
    }
  }

  // ============================================================
  // PAGE SHOW METHODS
  // ============================================================

  /**
   * Show project detail page
   * @param {string} projectId - Project ID
   * @param {string} category - Category
   */
  async showProjectPage(projectId, category = 'work') {
    try {
      const overallTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Project page loading timed out')), 30000);
      });

      const loadPromise = this.projectHandler.load(projectId, category);
      const data = await Promise.race([loadPromise, overallTimeout]);
      
      await this.transitionToPage(() => this.projectHandler.render(data));
      this.projectHandler.setupEvents(data);
      
      this.eventBus?.emit('page:shown', { type: 'project', projectId, category });
      
    } catch (error) {
      console.error('Failed to show project page:', error);
      await this.hideTransitionOverlay();
      this.showErrorPage(error.message);
    }
  }

  /**
   * Show projects list page
   * @param {string} category - Category
   */
  async showProjectsListPage(category = 'work') {
    try {
      await this.showTransitionOverlay();
      
      const data = await this.projectsListHandler.load(category);
      await this.transitionToPage(() => this.projectsListHandler.render(data));
      await this.projectsListHandler.setupEvents(data);
      
      await this.hideTransitionOverlay();
      this.eventBus?.emit('page:shown', { type: 'projects-list', category });
      
    } catch (error) {
      console.error('Failed to show projects list page:', error);
      await this.hideTransitionOverlay();
      this.showErrorPage(error.message);
    }
  }

  /**
   * Show fun gallery page
   */
  async showFunGalleryPage() {
    try {
      await this.showTransitionOverlay();
      
      const data = await this.funGalleryHandler.load();
      await this.transitionToPage(() => this.funGalleryHandler.render(data));
      await this.funGalleryHandler.setupEvents();
      
      await this.hideTransitionOverlay();
      this.eventBus?.emit('page:shown', { type: 'fun-gallery' });
      
    } catch (error) {
      console.error('Failed to show fun gallery page:', error);
      await this.hideTransitionOverlay();
      this.showErrorPage(error.message);
    }
  }

  // ============================================================
  // TRANSITIONS
  // ============================================================

  /**
   * Transition to page mode
   * @param {Function} renderFn - Function that returns HTML
   */
  async transitionToPage(renderFn) {
    const desktopCanvas = document.getElementById('desktop-canvas');
    
    // Render content
    this.pageContainer.innerHTML = renderFn();
    
    // Show container
    document.body.classList.add('page-mode');
    this.pageContainer.style.display = 'block';
    this.pageContainer.style.opacity = '1';
    this.pageContainer.scrollTop = 0;
    
    // Hide desktop
    if (desktopCanvas) {
      desktopCanvas.style.display = 'none';
      desktopCanvas.style.opacity = '0';
    }
    
    // Fade in
    const content = this.pageContainer.firstElementChild;
    if (content) {
      content.style.opacity = '0';
      content.style.transition = 'opacity 0.3s ease-out';
      await new Promise(r => setTimeout(r, 50));
      content.style.opacity = '1';
    }
    
    await new Promise(r => setTimeout(r, 300));
    this.isPageMode = true;
    this.currentPage = 'project';
  }

  /**
   * Show desktop canvas
   */
  async showDesktopCanvas() {
    if (!this.isPageMode) return;

    // Check if returning to modal
    if (this.isReturningToModal) {
      this.isReturningToModal = false;
      await this.returnToModal();
      return;
    }

    // Fade out page
    this.pageContainer.style.opacity = '0';
    await new Promise(r => setTimeout(r, 300));

    // Show desktop
    const desktopCanvas = document.getElementById('desktop-canvas');
    if (desktopCanvas) {
      desktopCanvas.style.display = 'flex';
      desktopCanvas.style.opacity = '0';
    }
    document.body.classList.remove('page-mode');

    requestAnimationFrame(() => {
      if (desktopCanvas) desktopCanvas.style.opacity = '1';
    });

    this.pageContainer.style.display = 'none';
    this.isPageMode = false;
    this.currentPage = null;

    // Cleanup handlers
    this.projectHandler?.destroy();
    this.funGalleryHandler?.destroy();

    this.eventBus?.emit('page:hidden', { type: 'desktop-canvas' });
  }

  /**
   * Return to projects modal
   */
  async returnToModal() {
    const desktopCanvas = document.getElementById('desktop-canvas');
    
    if (desktopCanvas) {
      desktopCanvas.style.display = 'flex';
      desktopCanvas.style.opacity = '1';
    }
    document.body.classList.remove('page-mode');

    if (this.projectsModalManager) {
      this.projectsModalManager.open('projects-list', {
        category: this.lastModalCategory,
        scrollPosition: this.lastModalScrollPosition,
        skipBackgroundAnimation: true
      });
      await new Promise(r => setTimeout(r, 50));
    }

    this.pageContainer.style.display = 'none';
    this.isPageMode = false;
    this.currentPage = null;
  }

  /**
   * Transition back to projects list
   * @param {string} category - Category
   */
  async transitionBackToProjects(category) {
    this.projectHandler?.destroy();
    this.router.navigate('/projects');
  }

  /**
   * Navigate to project with transition
   * @param {string} projectId - Project ID
   * @param {string} category - Category
   * @param {Object} options - Options
   */
  async navigateToProjectWithTransition(projectId, category = 'work', options = {}) {
    // Save modal state
    if (!options.fromList) {
      const modalContent = document.querySelector('.modal-content--fullscreen');
      if (modalContent) {
        this.lastModalScrollPosition = modalContent.scrollTop;
        this.lastModalCategory = category;
      }
    }

    // Update URL
    const url = category === 'work' ? `/projects/${projectId}` : `/fun/${projectId}`;
    window.history.pushState({}, '', url);

    // Show project page with transition overlay
    await this.showTransitionOverlay();
    try {
      await this.showProjectPage(projectId, category);
      this.eventBus?.emit('router:navigate', { url, state: {} });
    } finally {
      await this.hideTransitionOverlay();
    }
  }

  // ============================================================
  // TRANSITION OVERLAY
  // ============================================================

  async showTransitionOverlay() {
    this.transitionOverlay.classList.add('page-transition-overlay--active');
    await new Promise(r => setTimeout(r, 300));
  }

  async hideTransitionOverlay() {
    this.transitionOverlay.classList.remove('page-transition-overlay--active');
    await new Promise(r => setTimeout(r, 300));
  }

  // ============================================================
  // UTILITIES
  // ============================================================

  /**
   * Show error page
   * @param {string} message - Error message
   */
  async showErrorPage(message) {
    const errorHtml = `
      <div class="page-wrapper">
        <div class="page-error">
          <div class="page-error-icon">⚠️</div>
          <h1 class="page-error-title">Oops!</h1>
          <p class="page-error-message">${this.escapeHtml(message)}</p>
          <button class="page-error-button" data-action="back-to-desktop">Back to Desktop</button>
        </div>
      </div>
    `;
    
    await this.transitionToPage(() => errorHtml);
    
    const btn = this.pageContainer.querySelector('[data-action="back-to-desktop"]');
    if (btn) {
      btn.addEventListener('click', () => this.router.navigate('/'));
    }
  }

  /**
   * Escape HTML
   * @param {string} text - Text
   * @returns {string} Escaped
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Check if in page mode
   * @returns {boolean}
   */
  isInPageMode() {
    return this.isPageMode;
  }
}

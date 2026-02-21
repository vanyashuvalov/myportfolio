/* ANCHOR: page_manager */
/* FSD: features/page-manager → page rendering and transitions */
/* REUSED: Router for navigation, MarkdownParser for content */
/* REUSED: Chip component for tags display */
/* SCALED FOR: Smooth page transitions and desktop canvas integration */

import { Router } from './router.js';
import { markdownParser } from '../modal-system/markdown-parser.js';
import { Chip } from '../../shared/ui/chip/chip.js';
import { ReadingProgress } from '../../shared/ui/reading-progress/reading-progress.js';

/**
 * PageManager - Manages page rendering and transitions
 * Handles: Desktop canvas ↔ Project detail page transitions
 * 
 * @class PageManager
 */
export class PageManager {
  constructor(options = {}) {
    this.eventBus = options.eventBus;
    this.desktopCanvas = options.desktopCanvas;
    this.projectsModalManager = options.projectsModalManager; // CRITICAL: Direct access to projects modal manager
    
    // CRITICAL: Page container (will be created)
    this.pageContainer = null;
    this.currentPage = null;
    this.isPageMode = false;
    
    // UPDATED COMMENTS: Transition overlay for seamless navigation
    this.transitionOverlay = null;
    
    // UPDATED COMMENTS: Modal state for seamless back navigation
    // CRITICAL: Store scroll position and category for return to modal
    this.lastModalScrollPosition = 0;
    this.lastModalCategory = 'work';
    this.isReturningToModal = false;
    
    // UPDATED COMMENTS: Router instance
    this.router = new Router({
      eventBus: this.eventBus
    });
    
    // CRITICAL: Reading progress indicator instance
    this.readingProgress = null;
    
    this.initialize();
  }

  /**
   * Initialize page manager with routes
   * CRITICAL: Register project detail routes
   */
  initialize() {
    // UPDATED COMMENTS: Create page container
    this.createPageContainer();
    
    // SCALED FOR: Register routes for project pages
    this.router.register('/projects/:id', (context) => {
      // CRITICAL: Check if :id is actually a project ID or just "projects"
      const id = context.params.id;
      
      // If no ID or ID looks like a category, show projects list
      if (!id || id === 'work' || id === 'fun') {
        this.showProjectsListPage(id || 'work');
      } else {
        this.showProjectPage(id, 'work');
      }
    });
    
    this.router.register('/projects', () => {
      this.showProjectsListPage('work');
    });
    
    this.router.register('/fun/:id', (context) => {
      this.showProjectPage(context.params.id, 'fun');
    });
    
    // REUSED: Home route returns to desktop canvas
    this.router.register('/', () => {
      this.showDesktopCanvas();
    });
    
    // CRITICAL: Check initial URL on load
    const currentPath = window.location.pathname;
    if (currentPath !== '/') {
      this.router.handleRoute(currentPath);
    }
  }

  /**
   * Create page container for full-page views
   * UPDATED COMMENTS: Overlay container above desktop canvas
   */
  createPageContainer() {
    this.pageContainer = document.createElement('div');
    this.pageContainer.id = 'page-container';
    this.pageContainer.className = 'page-container';
    this.pageContainer.style.display = 'none';
    
    // CRITICAL: Insert after desktop canvas
    const desktopCanvas = document.getElementById('desktop-canvas');
    if (desktopCanvas && desktopCanvas.parentNode) {
      desktopCanvas.parentNode.insertBefore(this.pageContainer, desktopCanvas.nextSibling);
    } else {
      document.body.appendChild(this.pageContainer);
    }
    
    // CRITICAL: Create transition overlay for seamless navigation
    this.createTransitionOverlay();
  }

  /**
   * Create transition overlay for seamless page transitions
   * CRITICAL: Black #101010 overlay that covers everything during navigation
   */
  createTransitionOverlay() {
    this.transitionOverlay = document.createElement('div');
    this.transitionOverlay.id = 'page-transition-overlay';
    this.transitionOverlay.className = 'page-transition-overlay';
    document.body.appendChild(this.transitionOverlay);
  }

  /**
   * Show transition overlay
   * CRITICAL: Fade-in black overlay before navigation
   */
  async showTransitionOverlay() {
    this.transitionOverlay.classList.add('page-transition-overlay--active');
    // Wait for fade-in animation
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  /**
   * Hide transition overlay
   * CRITICAL: Fade-out black overlay after navigation
   */
  async hideTransitionOverlay() {
    this.transitionOverlay.classList.remove('page-transition-overlay--active');
    // Wait for fade-out animation
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  /**
   * Show project detail page
   * SCALED FOR: Full-page project view with markdown content
   */
  async showProjectPage(projectId, category = 'work') {
    try {
      // UPDATED COMMENTS: Load markdown content
      const markdownContent = await this.loadProjectMarkdown(projectId, category);
      const { frontmatter, html } = markdownParser.parseWithFrontmatter(markdownContent);
      
      // CRITICAL: Render project page
      const pageHtml = this.renderProjectPage(frontmatter, html, projectId, category);
      
      // SCALED FOR: Smooth transition to page mode
      await this.transitionToPage(pageHtml);
      
      // REUSED: Emit page shown event
      if (this.eventBus) {
        this.eventBus.emit('page:shown', { 
          type: 'project', 
          projectId, 
          category 
        });
      }
      
    } catch (error) {
      console.error('Failed to show project page:', error);
      this.showErrorPage(error.message);
    }
  }

  /**
   * Load project markdown from backend
   * UPDATED COMMENTS: Fetch .md file via API from backend server
   * CRITICAL: Use backend URL (port 8000) not frontend URL (port 8080)
   */
  async loadProjectMarkdown(projectId, category) {
    const response = await fetch(`http://localhost:8000/api/projects/${category}/${projectId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load project: ${response.statusText}`);
    }
    
    return await response.text();
  }

  /**
   * Render project page HTML
   * REUSED: Project detail layout from project-modal.js
   * UPDATED COMMENTS: Added close button like in projects list modal
   * UPDATED COMMENTS: Added back button for return to projects modal
   */
  renderProjectPage(frontmatter, contentHtml, projectId, category) {
    const {
      title = 'Untitled Project',
      hero_image,
      tags = [],
      year,
      client,
      role,
      description
    } = frontmatter;
    
    return `
      <div class="page-wrapper" data-category="${category}">
        <!-- CRITICAL: Back button to return to projects modal -->
        <button class="page-back" data-action="back-to-projects" aria-label="Back to projects">
          <img src="/assets/icons/iconamoon_arrow-down-2.svg" alt="Back" style="transform: rotate(90deg);" />
        </button>
        
        <!-- CRITICAL: Close button to return to desktop -->
        <button class="page-close" data-action="back-to-desktop" aria-label="Close page">
          <img src="/assets/icons/iconamoon_close.svg" alt="Close" />
        </button>
        
        <!-- CRITICAL: Back button to desktop canvas (hidden) -->
        <header class="page-header">
          <button class="page-back-button" data-action="back-to-desktop">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>Back to Desktop</span>
          </button>
        </header>
        
        <article class="project-page">
          <!-- SCALED FOR: Project metadata -->
          <div class="project-page-content">
            <!-- UPDATED COMMENTS: New hero section with title, meta row, and image -->
            <header class="project-header">
              <!-- CRITICAL: Title (SF Pro Semibold 42px) -->
              <h1 class="project-title">${this.escapeHtml(title)}</h1>
              
              <!-- CRITICAL: Meta row with tags, year, and read time -->
              <div class="project-meta-row">
                <!-- REUSED: Chips for tags (fill width) -->
                ${tags.length > 0 ? `
                  <div class="project-tags" data-tags='${JSON.stringify(tags)}'>
                    <!-- Chips will be rendered here by JS -->
                  </div>
                ` : ''}
                
                <!-- UPDATED COMMENTS: Year with calendar icon -->
                ${year ? `
                  <div class="project-meta-item">
                    <img src="/assets/icons/iconamoon_calendar-1.svg" alt="" class="project-meta-icon project-meta-icon--light" />
                    <span>${year}</span>
                  </div>
                ` : ''}
                
                <!-- CRITICAL: Read time with clock icon (calculated from content) -->
                <div class="project-meta-item" data-read-time>
                  <img src="/assets/icons/iconamoon_clock.svg" alt="" class="project-meta-icon project-meta-icon--dark" />
                  <span><!-- Will be calculated by JS --></span>
                </div>
              </div>
              
              <!-- UPDATED COMMENTS: Hero image with 14px border radius -->
              ${hero_image ? `
                <div class="project-hero">
                  <img src="${this.escapeHtml(hero_image)}" 
                       alt="${this.escapeHtml(title)}" 
                       loading="eager" />
                </div>
              ` : ''}
            </header>
            
            <!-- CRITICAL: Markdown content -->
            <div class="project-content markdown-content">
              ${contentHtml}
            </div>
          </div>
        </article>
      </div>
    `;
  }

  /**
   * Transition to page mode
   * CRITICAL: Seamless transition from modal #101010 background to page
   * UPDATED COMMENTS: Show page immediately, fade-in content, hide desktop, scroll to top
   */
  async transitionToPage(pageHtml) {
    const desktopCanvas = document.getElementById('desktop-canvas');
    
    // UPDATED COMMENTS: Render page content
    this.pageContainer.innerHTML = pageHtml;
    
    // SCALED FOR: Setup page event listeners
    this.setupPageEventListeners();
    
    // CRITICAL: Render chips for project tags
    this.setupProjectChips();
    
    // CRITICAL: Add page-mode class to body to hide mountains
    document.body.classList.add('page-mode');
    
    // CRITICAL: Show page container immediately with #101010 background
    // UPDATED COMMENTS: Must be visible BEFORE modal closes
    this.pageContainer.style.display = 'block';
    this.pageContainer.style.opacity = '1';
    
    // CRITICAL: Scroll to top of page container
    this.pageContainer.scrollTop = 0;
    
    // REUSED: Hide desktop canvas immediately
    if (desktopCanvas) {
      desktopCanvas.style.display = 'none';
      desktopCanvas.style.opacity = '0';
    }
    
    // CRITICAL: Fade-in page content after background is visible
    const projectPage = this.pageContainer.querySelector('.project-page');
    if (projectPage) {
      projectPage.style.opacity = '0';
      projectPage.style.transition = 'opacity 0.3s ease-out';
      
      // SCALED FOR: Small delay for smooth appearance
      await new Promise(resolve => setTimeout(resolve, 50));
      projectPage.style.opacity = '1';
    }
    
    this.isPageMode = true;
    this.currentPage = 'project';
    
    // CRITICAL: Wait for content fade-in to complete before returning
    // UPDATED COMMENTS: This ensures page is fully visible before modal closes
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // CRITICAL: Initialize reading progress indicator for project pages
    this.initializeReadingProgress();
  }

  /**
   * Show desktop canvas (home)
   * REUSED: Transition back to desktop mode
   * UPDATED COMMENTS: Navigation and contact-input stay visible, restore mountains
   * UPDATED COMMENTS: Check if returning to modal instead of desktop
   */
  async showDesktopCanvas() {
    if (!this.isPageMode) return;
    
    // CRITICAL: Check if returning to projects modal instead of desktop
    if (this.isReturningToModal) {
      this.isReturningToModal = false;
      console.log('🔄 Returning to projects modal instead of desktop');
      
      const desktopCanvas = document.getElementById('desktop-canvas');
      
      // CRITICAL: Show desktop canvas behind modal
      if (desktopCanvas) {
        desktopCanvas.style.display = 'flex';
        desktopCanvas.style.opacity = '1';
      }
      
      // CRITICAL: Remove page-mode class to restore gradient background
      document.body.classList.remove('page-mode');
      
      // CRITICAL: Open modal BEFORE hiding page container to prevent flash
      // UPDATED COMMENTS: Modal opens with #101010 background instantly
      if (this.projectsModalManager) {
        this.projectsModalManager.open('projects-list', { 
          category: this.lastModalCategory,
          scrollPosition: this.lastModalScrollPosition,
          skipBackgroundAnimation: true // CRITICAL: Instant background, no fade
        });
        
        // CRITICAL: Wait a bit for modal to render, then hide page
        await new Promise(resolve => setTimeout(resolve, 50));
      } else {
        console.error('❌ projectsModalManager not available');
      }
      
      // CRITICAL: Hide page container AFTER modal is visible
      this.pageContainer.style.display = 'none';
      this.isPageMode = false;
      this.currentPage = null;
      
      return;
    }
    
    const desktopCanvas = document.getElementById('desktop-canvas');
    
    // CRITICAL: Fade out page
    this.pageContainer.style.opacity = '0';
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // UPDATED COMMENTS: Show desktop canvas only
    if (desktopCanvas) {
      desktopCanvas.style.display = 'flex';
      desktopCanvas.style.opacity = '0';
    }
    
    // CRITICAL: Remove page-mode class to show mountains again
    document.body.classList.remove('page-mode');
    
    // SCALED FOR: Fade in desktop canvas
    requestAnimationFrame(() => {
      if (desktopCanvas) desktopCanvas.style.opacity = '1';
    });
    
    // CRITICAL: Hide page container
    this.pageContainer.style.display = 'none';
    
    this.isPageMode = false;
    this.currentPage = null;
    
    // CRITICAL: Destroy reading progress indicator
    this.destroyReadingProgress();
    
    // REUSED: Emit event
    if (this.eventBus) {
      this.eventBus.emit('page:hidden', { type: 'desktop-canvas' });
    }
  }

  /**
   * Setup page event listeners
   * UPDATED COMMENTS: Back button and close button handling
   * UPDATED COMMENTS: Back button returns to projects modal with scroll position
   */
  setupPageEventListeners() {
    // CRITICAL: Back to projects modal button
    const backButton = this.pageContainer.querySelector('[data-action="back-to-projects"]');
    if (backButton) {
      backButton.addEventListener('click', async () => {
        const category = this.pageContainer.querySelector('.page-wrapper')?.dataset.category || 'work';
        await this.transitionBackToProjects(category);
      });
      
      // REUSED: Simple fade-in with page content
      backButton.classList.add('page-back--visible');
    }
    
    // CRITICAL: Back to desktop button
    const desktopButton = this.pageContainer.querySelector('[data-action="back-to-desktop"]');
    if (desktopButton) {
      desktopButton.addEventListener('click', () => {
        this.router.navigate('/');
      });
    }
    
    // CRITICAL: Close button (same as back to desktop)
    const closeButton = this.pageContainer.querySelector('.page-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.router.navigate('/');
      });
      
      // REUSED: Simple fade-in with page content
      closeButton.classList.add('page-close--visible');
    }
  }

  /**
   * Setup chips rendering for project tags
   * REUSED: Same pattern as projects-list-modal
   * CRITICAL: Renders Chip components for tags on project detail page
   * UPDATED COMMENTS: Also calculates read time from content
   */
  setupProjectChips() {
    // UPDATED COMMENTS: Render chips for project tags
    const tagsContainer = this.pageContainer.querySelector('.project-tags');
    if (tagsContainer) {
      const tags = JSON.parse(tagsContainer.dataset.tags || '[]');
      tagsContainer.innerHTML = ''; // Clear placeholder
      
      // REUSED: Chip component from shared/ui
      // CRITICAL: Use 'dark' variant for dark background (same as projects list)
      tags.forEach(tag => {
        const chip = new Chip({
          label: tag,
          variant: 'dark'
        });
        tagsContainer.appendChild(chip.createElement());
      });
    }
    
    // CRITICAL: Calculate and display read time
    this.calculateReadTime();
  }

  /**
   * Calculate read time based on content length
   * SCALED FOR: Average reading speed 200 words/min + image viewing time
   * UPDATED COMMENTS: Counts text words and images for accurate estimate
   */
  calculateReadTime() {
    const readTimeElement = this.pageContainer.querySelector('[data-read-time] span');
    if (!readTimeElement) return;
    
    const contentElement = this.pageContainer.querySelector('.markdown-content');
    if (!contentElement) return;
    
    // CRITICAL: Count words in text content
    const text = contentElement.textContent || '';
    const wordCount = text.trim().split(/\s+/).length;
    
    // UPDATED COMMENTS: Count images (each adds ~12 seconds viewing time)
    const imageCount = contentElement.querySelectorAll('img').length;
    
    // SCALED FOR: Reading speed calculation
    // 200 words per minute average reading speed
    // 12 seconds per image (0.2 minutes)
    const readingTimeMinutes = (wordCount / 200) + (imageCount * 0.2);
    const readTime = Math.max(1, Math.ceil(readingTimeMinutes)); // Minimum 1 minute
    
    // REUSED: Display read time
    readTimeElement.textContent = `${readTime} min read`;
  }

  /**
   * Show error page
   * REUSED: Error state rendering
   */
  async showErrorPage(message) {
    const errorHtml = `
      <div class="page-wrapper">
        <div class="page-error">
          <div class="page-error-icon">⚠️</div>
          <h1 class="page-error-title">Oops!</h1>
          <p class="page-error-message">${this.escapeHtml(message)}</p>
          <button class="page-error-button" data-action="back-to-desktop">
            Back to Desktop
          </button>
        </div>
      </div>
    `;
    
    await this.transitionToPage(errorHtml);
  }

  /**
   * Escape HTML to prevent XSS
   * CRITICAL: Security-first content handling
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Navigate to project page
   * SCALED FOR: Programmatic navigation helper
   */
  navigateToProject(projectId, category = 'work') {
    const url = category === 'work' ? `/projects/${projectId}` : `/fun/${projectId}`;
    this.router.navigate(url);
  }

  /**
   * Navigate to project with seamless transition
   * CRITICAL: Show page BEFORE modal closes to prevent desktop flash
   * UPDATED COMMENTS: Returns promise that resolves when page is visible
   * UPDATED COMMENTS: Save modal scroll position for back navigation
   * 
   * @param {string} projectId - Project ID
   * @param {string} category - Project category
   * @returns {Promise} Resolves when page is visible
   */
  async navigateToProjectWithTransition(projectId, category = 'work') {
    // CRITICAL: Save modal state for back navigation
    const modalContent = document.querySelector('.modal-content--fullscreen');
    if (modalContent) {
      this.lastModalScrollPosition = modalContent.scrollTop;
      this.lastModalCategory = category;
      console.log('💾 Saved modal state:', { 
        scrollPosition: this.lastModalScrollPosition, 
        category: this.lastModalCategory 
      });
    }
    
    // CRITICAL: Show page immediately with #101010 background
    const url = category === 'work' ? `/projects/${projectId}` : `/fun/${projectId}`;
    
    // UPDATED COMMENTS: Update URL without triggering route handler
    window.history.pushState({}, '', url);
    
    // CRITICAL: Show project page directly
    await this.showProjectPage(projectId, category);
    
    // REUSED: Emit navigation event
    if (this.eventBus) {
      this.eventBus.emit('router:navigate', { url, state: {} });
    }
  }

  /**
   * Check if in page mode
   * REUSED: State query utility
   */
  isInPageMode() {
    return this.isPageMode;
  }

  /**
   * Show projects list page
   * CRITICAL: Render projects list as a page (not modal)
   * UPDATED COMMENTS: Reuses ProjectsListModal renderer
   * UPDATED COMMENTS: Uses transition overlay for seamless navigation
   * 
   * @param {string} category - Project category (work/fun)
   */
  async showProjectsListPage(category = 'work') {
    try {
      // CRITICAL: Show transition overlay before loading
      await this.showTransitionOverlay();
      
      // UPDATED COMMENTS: Load projects from backend
      const projects = await this.loadProjects(category);
      
      // CRITICAL: Render projects list page HTML
      const pageHtml = this.renderProjectsListPage(projects, category);
      
      // SCALED FOR: Smooth transition to page mode
      await this.transitionToPage(pageHtml);
      
      // CRITICAL: Setup click handlers and render chips BEFORE hiding overlay
      await this.setupProjectsListEventListeners(category);
      
      // CRITICAL: Hide transition overlay after page is ready with chips
      await this.hideTransitionOverlay();
      
      // REUSED: Emit page shown event
      if (this.eventBus) {
        this.eventBus.emit('page:shown', { 
          type: 'projects-list', 
          category 
        });
      }
      
    } catch (error) {
      console.error('Failed to show projects list page:', error);
      await this.hideTransitionOverlay();
      this.showErrorPage(error.message);
    }
  }

  /**
   * Load projects from backend API
   * REUSED: Same logic as ProjectsListModal
   * 
   * @param {string} category - Project category
   * @returns {Promise<Array>} Projects array
   */
  async loadProjects(category) {
    const response = await fetch(`http://localhost:8000/api/projects?category=${category}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load projects: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.projects || [];
  }

  /**
   * Render projects list page HTML
   * REUSED: Layout from ProjectsListModal
   * UPDATED COMMENTS: Added back and close buttons
   * 
   * @param {Array} projects - Projects array
   * @param {string} category - Project category
   * @returns {string} HTML content
   */
  renderProjectsListPage(projects, category) {
    const categoryTitle = category === 'work' ? 'Projects' : 'Fun';
    
    return `
      <div class="page-wrapper" data-category="${category}">
        <!-- CRITICAL: Back button to return to desktop -->
        <button class="page-back" data-action="back-to-desktop" aria-label="Back to desktop">
          <img src="/assets/icons/iconamoon_arrow-down-2.svg" alt="Back" style="transform: rotate(90deg);" />
        </button>
        
        <!-- CRITICAL: Close button to return to desktop -->
        <button class="page-close" data-action="back-to-desktop" aria-label="Close page">
          <img src="/assets/icons/iconamoon_close.svg" alt="Close" />
        </button>
        
        <div class="projects-list-page">
          <div class="projects-grid">
            ${projects.map(project => this.renderProjectCardForPage(project, category)).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render single project card for page
   * REUSED: Card layout from ProjectsListModal
   * 
   * @param {Object} project - Project data
   * @param {string} category - Project category
   * @returns {string} HTML content
   */
  renderProjectCardForPage(project, category) {
    const {
      id,
      title,
      thumbnail,
      description,
      tags = []
    } = project;
    
    return `
      <article class="modal-project-card" data-project-id="${this.escapeHtml(id)}" data-category="${category}">
        <div class="modal-project-card-image">
          <img src="${this.escapeHtml(thumbnail)}" 
               alt="${this.escapeHtml(title)}" 
               loading="lazy" />
        </div>
        
        <div class="modal-project-card-content">
          <div class="modal-project-card-header">
            <h3 class="modal-project-card-title">${this.escapeHtml(title)}</h3>
          </div>
          
          ${description ? `
            <p class="modal-project-card-description">${this.escapeHtml(description)}</p>
          ` : ''}
          
          ${tags.length > 0 ? `
            <div class="modal-project-card-tags" data-tags='${JSON.stringify(tags)}'>
              <!-- Chips will be rendered here by JS -->
            </div>
          ` : ''}
        </div>
      </article>
    `;
  }

  /**
   * Setup event listeners for projects list page
   * CRITICAL: Project card clicks and chip rendering
   * UPDATED COMMENTS: Returns promise to wait for chips rendering
   * 
   * @param {string} category - Project category
   * @returns {Promise} Resolves when chips are rendered
   */
  async setupProjectsListEventListeners(category) {
    // CRITICAL: Import Chip component and render chips
    const { Chip } = await import('../../shared/ui/chip/chip.js');
    
    // UPDATED COMMENTS: Render chips for all project cards
    const tagsContainers = this.pageContainer.querySelectorAll('.modal-project-card-tags');
    tagsContainers.forEach(container => {
      const tags = JSON.parse(container.dataset.tags || '[]');
      container.innerHTML = '';
      
      tags.forEach(tag => {
        const chip = new Chip({
          label: tag,
          variant: 'dark'
        });
        container.appendChild(chip.createElement());
      });
    });
    
    // CRITICAL: Click on project card navigates to detail page
    const projectCards = this.pageContainer.querySelectorAll('.modal-project-card');
    
    projectCards.forEach(card => {
      card.addEventListener('click', async () => {
        const projectId = card.dataset.projectId;
        const cardCategory = card.dataset.category;
        
        if (projectId) {
          // CRITICAL: Seamless transition to project detail
          await this.transitionToProjectFromList(projectId, cardCategory);
        }
      });
      
      // REUSED: Hover effects
      card.addEventListener('mouseenter', () => {
        card.classList.add('modal-project-card--hovered');
      });
      
      card.addEventListener('mouseleave', () => {
        card.classList.remove('modal-project-card--hovered');
      });
    });
  }

  /**
   * Transition from projects list to project detail
   * CRITICAL: Fade-out list content, keep #101010 background, navigate
   * 
   * @param {string} projectId - Project ID
   * @param {string} category - Project category
   */
  async transitionToProjectFromList(projectId, category) {
    // CRITICAL: Fade-out projects list content
    const projectsList = this.pageContainer.querySelector('.projects-list-page');
    
    if (projectsList) {
      projectsList.style.transition = 'opacity 0.3s ease-out';
      projectsList.style.opacity = '0';
      
      // SCALED FOR: Wait for fade-out to complete
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // CRITICAL: Navigate to project detail (background already #101010)
    const url = category === 'work' ? `/projects/${projectId}` : `/fun/${projectId}`;
    this.router.navigate(url);
  }

  /**
   * Transition back to projects modal
   * CRITICAL: Seamless transition from project page back to modal
   * UPDATED COMMENTS: Fade-out page content, keep #101010 background, open modal
   * 
   * @param {string} category - Project category to restore
   */
  async transitionBackToProjects(category) {
    console.log('⬅️ Transitioning back to projects list page');
    
    // CRITICAL: Destroy reading progress indicator before transition
    this.destroyReadingProgress();
    
    // CRITICAL: Fade-out page content
    const projectPage = this.pageContainer.querySelector('.project-page');
    if (projectPage) {
      projectPage.style.transition = 'opacity 0.3s ease-out';
      projectPage.style.opacity = '0';
      
      // SCALED FOR: Wait for fade-out to complete
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // CRITICAL: Navigate back to projects list page
    this.router.navigate('/projects');
  }

  /**
   * Initialize reading progress indicator
   * CRITICAL: Create progress bar for project detail pages only
   * UPDATED COMMENTS: Tracks scroll on page container, not window
   */
  initializeReadingProgress() {
    // SCALED FOR: Only show on project detail pages, not projects list
    if (this.currentPage !== 'project') return;
    
    // UPDATED COMMENTS: Destroy existing instance if any
    this.destroyReadingProgress();
    
    // CRITICAL: Create reading progress with page container as scroll target
    this.readingProgress = new ReadingProgress({
      container: this.pageContainer,
      color: 'rgba(255, 255, 255, 0.3)', // White with 30% opacity
      height: 2, // 2px thin bar like Notion
      zIndex: 100003 // Above navigation (z-index: 100000)
    });
  }

  /**
   * Destroy reading progress indicator
   * CRITICAL: Cleanup when leaving project page
   */
  destroyReadingProgress() {
    if (this.readingProgress) {
      this.readingProgress.destroy();
      this.readingProgress = null;
    }
  }
}

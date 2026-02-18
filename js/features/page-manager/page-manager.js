/* ANCHOR: page_manager */
/* FSD: features/page-manager → page rendering and transitions */
/* REUSED: Router for navigation, MarkdownParser for content */
/* SCALED FOR: Smooth page transitions and desktop canvas integration */

import { Router } from './router.js';
import { markdownParser } from '../modal-system/markdown-parser.js';

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
    
    // CRITICAL: Page container (will be created)
    this.pageContainer = null;
    this.currentPage = null;
    this.isPageMode = false;
    
    // UPDATED COMMENTS: Modal state for seamless back navigation
    // CRITICAL: Store scroll position and category for return to modal
    this.lastModalScrollPosition = 0;
    this.lastModalCategory = 'work';
    this.isReturningToModal = false;
    
    // UPDATED COMMENTS: Router instance
    this.router = new Router({
      eventBus: this.eventBus
    });
    
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
      this.showProjectPage(context.params.id, 'work');
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
          <!-- UPDATED COMMENTS: Hero section -->
          ${hero_image ? `
            <div class="project-hero">
              <img src="${this.escapeHtml(hero_image)}" 
                   alt="${this.escapeHtml(title)}" 
                   loading="eager" />
            </div>
          ` : ''}
          
          <!-- SCALED FOR: Project metadata -->
          <div class="project-page-content">
            <header class="project-header">
              <div class="project-meta">
                <span class="project-category">${this.escapeHtml(category)}</span>
                ${year ? `<span class="project-year">${year}</span>` : ''}
              </div>
              
              <h1 class="project-title">${this.escapeHtml(title)}</h1>
              
              ${description ? `
                <p class="project-description">${this.escapeHtml(description)}</p>
              ` : ''}
              
              ${tags.length > 0 ? `
                <div class="project-tags">
                  ${tags.map(tag => `
                    <span class="project-tag">${this.escapeHtml(tag)}</span>
                  `).join('')}
                </div>
              ` : ''}
              
              ${(client || role) ? `
                <div class="project-info">
                  ${client ? `<div class="project-info-item">
                    <span class="project-info-label">Client:</span>
                    <span class="project-info-value">${this.escapeHtml(client)}</span>
                  </div>` : ''}
                  ${role ? `<div class="project-info-item">
                    <span class="project-info-label">Role:</span>
                    <span class="project-info-value">${this.escapeHtml(role)}</span>
                  </div>` : ''}
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
   * UPDATED COMMENTS: Show page immediately, fade-in content, hide desktop
   */
  async transitionToPage(pageHtml) {
    const desktopCanvas = document.getElementById('desktop-canvas');
    
    // UPDATED COMMENTS: Render page content
    this.pageContainer.innerHTML = pageHtml;
    
    // SCALED FOR: Setup page event listeners
    this.setupPageEventListeners();
    
    // CRITICAL: Add page-mode class to body to hide mountains
    document.body.classList.add('page-mode');
    
    // CRITICAL: Show page container immediately with #101010 background
    // UPDATED COMMENTS: Must be visible BEFORE modal closes
    this.pageContainer.style.display = 'block';
    this.pageContainer.style.opacity = '1';
    
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
      
      // UPDATED COMMENTS: Open projects modal with saved state
      if (this.eventBus) {
        this.eventBus.emit('modal:open', {
          type: 'projects-list',
          options: { 
            category: this.lastModalCategory,
            scrollPosition: this.lastModalScrollPosition 
          }
        });
      }
      
      // CRITICAL: Hide page container
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
      
      // REUSED: Slide-in animation with delay like close button
      setTimeout(() => {
        backButton.classList.add('page-back--visible');
      }, 100);
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
      
      // REUSED: Slide-in animation with delay like modal close button
      setTimeout(() => {
        closeButton.classList.add('page-close--visible');
      }, 100);
    }
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
   * Transition back to projects modal
   * CRITICAL: Seamless transition from project page back to modal
   * UPDATED COMMENTS: Fade-out page content, keep #101010 background, open modal
   * 
   * @param {string} category - Project category to restore
   */
  async transitionBackToProjects(category) {
    console.log('⬅️ Transitioning back to projects modal');
    
    // CRITICAL: Fade-out page content
    const projectPage = this.pageContainer.querySelector('.project-page');
    if (projectPage) {
      projectPage.style.transition = 'opacity 0.3s ease-out';
      projectPage.style.opacity = '0';
      
      // SCALED FOR: Wait for fade-out to complete
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // CRITICAL: Set flag to open modal instead of showing desktop
    this.isReturningToModal = true;
    
    // UPDATED COMMENTS: Navigate to root (will trigger showDesktopCanvas)
    this.router.navigate('/');
  }
}

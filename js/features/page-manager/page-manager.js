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
      <div class="page-wrapper">
        <!-- CRITICAL: Back button to desktop canvas -->
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
   * CRITICAL: Hide desktop canvas, show page container
   */
  async transitionToPage(pageHtml) {
    const desktopCanvas = document.getElementById('desktop-canvas');
    const navigationContainer = document.getElementById('navigation-container');
    const contactInputContainer = document.getElementById('contact-input-container');
    
    // UPDATED COMMENTS: Render page content
    this.pageContainer.innerHTML = pageHtml;
    
    // SCALED FOR: Setup page event listeners
    this.setupPageEventListeners();
    
    // CRITICAL: Smooth transition
    this.pageContainer.style.display = 'block';
    this.pageContainer.style.opacity = '0';
    
    // REUSED: Fade out desktop canvas
    if (desktopCanvas) desktopCanvas.style.opacity = '0';
    if (navigationContainer) navigationContainer.style.opacity = '0';
    if (contactInputContainer) contactInputContainer.style.opacity = '0';
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // UPDATED COMMENTS: Hide desktop canvas
    if (desktopCanvas) desktopCanvas.style.display = 'none';
    if (navigationContainer) navigationContainer.style.display = 'none';
    if (contactInputContainer) contactInputContainer.style.display = 'none';
    
    // CRITICAL: Fade in page
    this.pageContainer.style.opacity = '1';
    
    this.isPageMode = true;
    this.currentPage = 'project';
  }

  /**
   * Show desktop canvas (home)
   * REUSED: Transition back to desktop mode
   */
  async showDesktopCanvas() {
    if (!this.isPageMode) return;
    
    const desktopCanvas = document.getElementById('desktop-canvas');
    const navigationContainer = document.getElementById('navigation-container');
    const contactInputContainer = document.getElementById('contact-input-container');
    
    // CRITICAL: Fade out page
    this.pageContainer.style.opacity = '0';
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // UPDATED COMMENTS: Show desktop canvas
    if (desktopCanvas) {
      desktopCanvas.style.display = 'flex';
      desktopCanvas.style.opacity = '0';
    }
    if (navigationContainer) {
      navigationContainer.style.display = 'block';
      navigationContainer.style.opacity = '0';
    }
    if (contactInputContainer) {
      contactInputContainer.style.display = 'block';
      contactInputContainer.style.opacity = '0';
    }
    
    // SCALED FOR: Fade in desktop canvas
    requestAnimationFrame(() => {
      if (desktopCanvas) desktopCanvas.style.opacity = '1';
      if (navigationContainer) navigationContainer.style.opacity = '1';
      if (contactInputContainer) contactInputContainer.style.opacity = '1';
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
   * UPDATED COMMENTS: Back button and link handling
   */
  setupPageEventListeners() {
    // CRITICAL: Back to desktop button
    const backButton = this.pageContainer.querySelector('[data-action="back-to-desktop"]');
    if (backButton) {
      backButton.addEventListener('click', () => {
        this.router.navigate('/');
      });
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
   * Check if in page mode
   * REUSED: State query utility
   */
  isInPageMode() {
    return this.isPageMode;
  }
}

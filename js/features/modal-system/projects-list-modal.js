/* ANCHOR: projects_list_modal */
/* FSD: features/modal-system → projects list modal renderer */
/* REUSED: Modal system for project grid display */
/* REUSED: Chip component from shared/ui for tags */
/* SCALED FOR: Category filtering and project navigation */

import { Chip } from '../../shared/ui/chip/chip.js';

/**
 * ProjectsListModal - Renders projects list modal with grid layout
 * Features: Project cards, category filtering, navigation to detail pages
 * 
 * @class ProjectsListModal
 */
export class ProjectsListModal {
  constructor(options = {}) {
    this.eventBus = options.eventBus;
    this.pageManager = options.pageManager;
  }

  /**
   * Render projects list modal content
   * CRITICAL: Loads projects from backend and renders grid
   * 
   * @param {Object} options - { category: 'work' | 'fun' }
   * @returns {Promise<string>} HTML content
   */
  async render(options = {}) {
    const { category = 'work' } = options;
    
    try {
      // UPDATED COMMENTS: Load projects from backend API
      const projects = await this.loadProjects(category);
      
      // SCALED FOR: Render project grid
      const html = this.renderProjectsGrid(projects, category);
      return html;
      
    } catch (error) {
      console.error('❌ Failed to load projects:', error);
      return this.renderError('Failed to load projects. Please check if the backend server is running.');
    }
  }

  /**
   * Load projects from backend API
   * UPDATED COMMENTS: Fetches project list with metadata from backend server
   * CRITICAL: Use backend URL (port 8000) not frontend URL (port 8080)
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
   * Render projects grid HTML
   * REUSED: Grid layout with project cards
   */
  renderProjectsGrid(projects, category) {
    const categoryTitle = category === 'work' ? 'Projects' : 'Fun';
    const categoryDescription = category === 'work' 
      ? 'Professional work and client projects'
      : 'Personal projects and creative experiments';
    
    return `
      <div class="projects-list">
        <!-- CRITICAL: List header -->
        <header class="projects-list-header">
          <h1 class="projects-list-title">${categoryTitle}</h1>
          <p class="projects-list-description">${categoryDescription}</p>
          <div class="projects-list-count">${projects.length} ${projects.length === 1 ? 'project' : 'projects'}</div>
        </header>
        
        <!-- UPDATED COMMENTS: Projects grid -->
        <div class="projects-grid">
          ${projects.map(project => this.renderProjectCard(project, category)).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render single project card
   * SCALED FOR: Hover effects and click navigation
   */
  renderProjectCard(project, category) {
    const {
      id,
      title,
      thumbnail,
      description,
      tags = [],
      year
    } = project;
    
    return `
      <article class="modal-project-card" data-project-id="${this.escapeHtml(id)}" data-category="${category}">
        <!-- CRITICAL: Project thumbnail -->
        <div class="modal-project-card-image">
          <img src="${this.escapeHtml(thumbnail)}" 
               alt="${this.escapeHtml(title)}" 
               loading="lazy" />
          <div class="modal-project-card-overlay">
            <span class="modal-project-card-view">View Project</span>
          </div>
        </div>
        
        <!-- UPDATED COMMENTS: Project metadata -->
        <div class="modal-project-card-content">
          <div class="modal-project-card-header">
            <h3 class="modal-project-card-title">${this.escapeHtml(title)}</h3>
            ${year ? `<span class="modal-project-card-year">${year}</span>` : ''}
          </div>
          
          ${description ? `
            <p class="modal-project-card-description">${this.escapeHtml(description)}</p>
          ` : ''}
          
          <!-- REUSED: Chip component for project tags -->
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
   * Setup event listeners after modal render
   * CRITICAL: Project card click navigation and chip rendering
   * UPDATED COMMENTS: Now also renders Chip components for tags
   */
  setupEventListeners(modalContainer) {
    // UPDATED COMMENTS: Render chips for all project cards
    const tagsContainers = modalContainer.querySelectorAll('.modal-project-card-tags');
    tagsContainers.forEach(container => {
      const tags = JSON.parse(container.dataset.tags || '[]');
      container.innerHTML = ''; // Clear placeholder
      
      // REUSED: Chip component from shared/ui
      // CRITICAL: Use createElement() to get DOM node, not render() which returns HTML string
      // UPDATED COMMENTS: Use 'dark' variant for dark background (Figma spec)
      tags.forEach(tag => {
        const chip = new Chip({
          label: tag,
          variant: 'dark'
        });
        container.appendChild(chip.createElement());
      });
    });
    
    // UPDATED COMMENTS: Click on project card navigates to detail page
    const projectCards = modalContainer.querySelectorAll('.modal-project-card');
    
    projectCards.forEach(card => {
      card.addEventListener('click', async () => {
        const projectId = card.dataset.projectId;
        const category = card.dataset.category;
        
        if (projectId && this.pageManager) {
          // CRITICAL: Seamless transition through #101010 background
          // UPDATED COMMENTS: Fade-out content, keep background, navigate, close modal
          await this.transitionToProject(modalContainer, projectId, category);
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
   * Seamless transition to project page
   * CRITICAL: Show page BEFORE closing modal to prevent desktop flash
   * UPDATED COMMENTS: User sees only #101010 background during transition
   * 
   * @param {HTMLElement} modalContainer - Modal container element
   * @param {string} projectId - Project ID
   * @param {string} category - Project category
   */
  async transitionToProject(modalContainer, projectId, category) {
    // CRITICAL: Find projects list content
    const projectsList = modalContainer.querySelector('.projects-list');
    
    if (projectsList) {
      // UPDATED COMMENTS: Fade-out content only, keep #101010 background
      projectsList.style.transition = 'opacity 0.3s ease-out';
      projectsList.style.opacity = '0';
      
      // SCALED FOR: Wait for fade-out to complete
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // CRITICAL: Navigate and wait for page to show BEFORE closing modal
    // UPDATED COMMENTS: This prevents desktop flash
    await this.pageManager.navigateToProjectWithTransition(projectId, category);
    
    // UPDATED COMMENTS: Close modal AFTER page is visible
    // REUSED: EventBus pattern for modal communication
    if (this.eventBus) {
      this.eventBus.emit('modal:close');
    }
  }

  /**
   * Render error state
   * REUSED: Error handling UI pattern
   */
  renderError(message) {
    return `
      <div class="projects-list-error" style="text-align: center; padding: 60px 40px;">
        <div class="projects-list-error-icon" style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
        <h2 class="projects-list-error-title" style="font-size: 24px; color: #0E1621; margin-bottom: 12px;">Oops!</h2>
        <p class="projects-list-error-message" style="font-size: 16px; color: rgba(14, 22, 33, 0.7);">${this.escapeHtml(message)}</p>
      </div>
    `;
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
}

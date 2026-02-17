/* ANCHOR: projects_list_modal */
/* FSD: features/modal-system → projects list modal renderer */
/* REUSED: Modal system for project grid display */
/* SCALED FOR: Category filtering and project navigation */

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
    
    console.log('🎨 ProjectsListModal.render called with category:', category);
    
    try {
      // UPDATED COMMENTS: Load projects from backend API
      console.log('📡 Fetching projects from API...');
      const projects = await this.loadProjects(category);
      console.log('✅ Projects loaded:', projects.length, 'projects');
      
      // SCALED FOR: Render project grid
      const html = this.renderProjectsGrid(projects, category);
      console.log('✅ HTML generated, length:', html.length);
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
    console.log('📡 Making API request to:', `http://localhost:8000/api/projects?category=${category}`);
    
    const response = await fetch(`http://localhost:8000/api/projects?category=${category}`);
    
    console.log('📡 API response status:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`Failed to load projects: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📡 API response data:', data);
    
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
      <article class="project-card" data-project-id="${this.escapeHtml(id)}" data-category="${category}">
        <!-- CRITICAL: Project thumbnail -->
        <div class="project-card-image">
          <img src="${this.escapeHtml(thumbnail)}" 
               alt="${this.escapeHtml(title)}" 
               loading="lazy" />
          <div class="project-card-overlay">
            <span class="project-card-view">View Project</span>
          </div>
        </div>
        
        <!-- UPDATED COMMENTS: Project metadata -->
        <div class="project-card-content">
          <div class="project-card-header">
            <h3 class="project-card-title">${this.escapeHtml(title)}</h3>
            ${year ? `<span class="project-card-year">${year}</span>` : ''}
          </div>
          
          ${description ? `
            <p class="project-card-description">${this.escapeHtml(description)}</p>
          ` : ''}
          
          <!-- REUSED: Project tags -->
          ${tags.length > 0 ? `
            <div class="project-card-tags">
              ${tags.slice(0, 3).map(tag => `
                <span class="project-card-tag">${this.escapeHtml(tag)}</span>
              `).join('')}
              ${tags.length > 3 ? `<span class="project-card-tag-more">+${tags.length - 3}</span>` : ''}
            </div>
          ` : ''}
        </div>
      </article>
    `;
  }

  /**
   * Setup event listeners after modal render
   * CRITICAL: Project card click navigation
   */
  setupEventListeners(modalContainer) {
    // UPDATED COMMENTS: Click on project card navigates to detail page
    const projectCards = modalContainer.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
      card.addEventListener('click', () => {
        const projectId = card.dataset.projectId;
        const category = card.dataset.category;
        
        if (projectId && this.pageManager) {
          // CRITICAL: Close modal and navigate to project page
          if (this.eventBus) {
            this.eventBus.emit('modal:close');
          }
          
          // SCALED FOR: Navigate to project detail page
          setTimeout(() => {
            this.pageManager.navigateToProject(projectId, category);
          }, 300); // Wait for modal close animation
        }
      });
      
      // REUSED: Hover effects
      card.addEventListener('mouseenter', () => {
        card.classList.add('project-card--hovered');
      });
      
      card.addEventListener('mouseleave', () => {
        card.classList.remove('project-card--hovered');
      });
    });
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

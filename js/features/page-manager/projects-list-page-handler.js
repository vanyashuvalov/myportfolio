/**
 * ProjectsListPageHandler - Handles projects list page rendering
 * FSD: features/page-manager → projects list page logic
 * REUSED: Chip component
 * 
 * @class ProjectsListPageHandler
 */
import { Chip } from '../../shared/ui/chip/chip.js';

export class ProjectsListPageHandler {
  constructor(options = {}) {
    this.eventBus = options.eventBus;
    this.pageContainer = options.pageContainer;
  }

  /**
   * Load projects from backend
   * @param {string} category - Project category
   * @returns {Promise<Array>} Projects array
   */
  async load(category = 'work') {
    const apiUrl = window.location.hostname === 'localhost' 
      ? `http://localhost:8000/api/projects?category=${category}`
      : `/api/projects?category=${category}`;

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to load projects: ${response.statusText}`);
    }

    const data = await response.json();
    return { projects: data.projects || [], category };
  }

  /**
   * Render projects list page HTML
   * UPDATED COMMENTS: Only close button (X), no back button in list
   * @param {Object} data - Page data
   * @returns {string} HTML content
   */
  render(data) {
    const { projects, category } = data;

    return `
      <div class="page-wrapper" data-category="${category}">
        <button class="page-close" data-action="back-to-desktop" aria-label="Close page">
          <img src="/assets/icons/iconamoon_close.svg" alt="Close" />
        </button>
        
        <div class="projects-list-page">
          <div class="projects-grid">
            ${projects.map(p => this.renderProjectCard(p, category)).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render single project card
   * @param {Object} project - Project data
   * @param {string} category - Project category
   * @returns {string} HTML content
   */
  renderProjectCard(project, category) {
    const { id, title, thumbnail, description, tags = [] } = project;

    return `
      <article class="modal-project-card" data-project-id="${this.escapeHtml(id)}" data-category="${category}">
        <div class="modal-project-card-image">
          <img src="${this.escapeHtml(thumbnail)}" alt="${this.escapeHtml(title)}" loading="lazy" />
        </div>
        
        <div class="modal-project-card-content">
          <div class="modal-project-card-header">
            <h3 class="modal-project-card-title">${this.escapeHtml(title)}</h3>
          </div>
          
          ${description ? `
            <p class="modal-project-card-description">${this.escapeHtml(description)}</p>
          ` : ''}
          
          ${tags.length > 0 ? `
            <div class="modal-project-card-tags" data-tags='${JSON.stringify(tags)}'></div>
          ` : ''}
        </div>
      </article>
    `;
  }

  /**
   * Setup event listeners
   * UPDATED COMMENTS: Only close button, no back button in projects list
   * CRITICAL: Project card clicks emit events to page-manager
   * @param {Object} data - Page data
   */
  async setupEvents(data) {
    // REUSED: Render chips for all project cards
    await this.renderChips();

    // CRITICAL: Project card clicks navigate to detail page
    const cards = this.pageContainer.querySelectorAll('.modal-project-card');
    
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const projectId = card.dataset.projectId;
        const cardCategory = card.dataset.category;
        
        // CRITICAL: Emit event to page-manager for navigation
        if (this.eventBus && projectId) {
          this.eventBus.emit('page:navigateToProject', { 
            projectId, 
            category: cardCategory,
            fromList: true 
          });
        }
      });

      // REUSED: Hover effects
      card.addEventListener('mouseenter', () => card.classList.add('modal-project-card--hovered'));
      card.addEventListener('mouseleave', () => card.classList.remove('modal-project-card--hovered'));
    });

    // CRITICAL: Close button (X) - closes to desktop
    const closeButton = this.pageContainer.querySelector('.page-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.eventBus?.emit('page:close'));
      closeButton.classList.add('page-close--visible');
    }
  }

  /**
   * Render chips for all project cards
   */
  async renderChips() {
    const containers = this.pageContainer.querySelectorAll('.modal-project-card-tags');
    
    containers.forEach(container => {
      const tags = JSON.parse(container.dataset.tags || '[]');
      container.innerHTML = '';
      
      tags.forEach(tag => {
        const chip = new Chip({ label: tag, variant: 'dark' });
        container.appendChild(chip.createElement());
      });
    });
  }

  /**
   * Escape HTML
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
/* ANCHOR: project_modal */
/* FSD: features/modal-system → project detail modal renderer */
/* REUSED: MarkdownParser for content rendering */
/* REUSED: Chip component for tags display */
/* REUSED: ImageViewer for fullscreen image viewing */
/* SCALED FOR: Rich project content with images and galleries */

import { markdownParser } from './markdown-parser.js';
import { Chip } from '../../shared/ui/chip/chip.js';
import { ImageViewer } from '../../shared/ui/image-viewer/image-viewer.js';

/**
 * ProjectModal - Renders project detail modal from markdown content
 * Features: Hero image, markdown content, image galleries, navigation
 * 
 * @class ProjectModal
 */
export class ProjectModal {
  constructor(options = {}) {
    this.eventBus = options.eventBus;
    // REUSED: ImageViewer for fullscreen image viewing
    this.imageViewer = new ImageViewer({ eventBus: this.eventBus });
  }

  /**
   * Render project detail modal content
   * CRITICAL: Loads markdown file and renders with frontmatter
   * 
   * @param {Object} options - { projectId, category }
   * @returns {Promise<string>} HTML content
   */
  async render(options = {}) {
    const { projectId, category = 'work' } = options;
    
    if (!projectId) {
      return this.renderError('Project ID is required');
    }
    
    try {
      // UPDATED COMMENTS: Load markdown file from backend
      const markdownContent = await this.loadProjectMarkdown(projectId, category);
      
      // SCALED FOR: Parse markdown with frontmatter
      const { frontmatter, html } = markdownParser.parseWithFrontmatter(markdownContent);
      
      // REUSED: Render project detail with metadata
      return this.renderProjectDetail(frontmatter, html, projectId);
      
    } catch (error) {
      console.error('Failed to load project:', error);
      return this.renderError('Failed to load project content');
    }
  }

  /**
   * Load project markdown file from backend
   * UPDATED COMMENTS: Fetches .md file from backend API
   */
  async loadProjectMarkdown(projectId, category) {
    const response = await fetch(`/api/projects/${category}/${projectId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load project: ${response.statusText}`);
    }
    
    return await response.text();
  }

  /**
   * Render project detail HTML
   * SCALED FOR: Rich content layout with hero, metadata, and content
   */
  renderProjectDetail(frontmatter, contentHtml, projectId) {
    const {
      title = 'Untitled Project',
      hero_image,
      category = 'work',
      tags = [],
      year,
      client,
      role,
      description
    } = frontmatter;
    
    return `
      <article class="project-detail">
        <!-- CRITICAL: Hero section with image -->
        ${hero_image ? `
          <div class="project-hero">
            <img src="${this.escapeHtml(hero_image)}" 
                 alt="${this.escapeHtml(title)}" 
                 loading="eager" />
          </div>
        ` : ''}
        
        <!-- UPDATED COMMENTS: Project metadata header -->
        <header class="project-header">
          <div class="project-meta">
            <span class="project-category">${this.escapeHtml(category)}</span>
            ${year ? `<span class="project-year">${year}</span>` : ''}
          </div>
          
          <h1 class="project-title">${this.escapeHtml(title)}</h1>
          
          ${description ? `
            <p class="project-description">${this.escapeHtml(description)}</p>
          ` : ''}
          
          <!-- REUSED: Chip component for project tags (rendered via JS) -->
          ${tags.length > 0 ? `
            <div class="project-tags" data-tags='${JSON.stringify(tags)}'>
              <!-- Chips will be rendered here by JS -->
            </div>
          ` : ''}
          
          <!-- SCALED FOR: Client and role information -->
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
        
        <!-- UPDATED COMMENTS: Navigation to other projects -->
        <footer class="project-footer">
          <button class="project-nav-button" data-action="back-to-list">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Back to Projects
          </button>
        </footer>
      </article>
    `;
  }

  /**
   * Render error state
   * REUSED: Error handling UI pattern
   */
  renderError(message) {
    return `
      <div class="project-error">
        <div class="project-error-icon">⚠️</div>
        <h2 class="project-error-title">Oops!</h2>
        <p class="project-error-message">${this.escapeHtml(message)}</p>
        <button class="project-error-button" data-action="back-to-list">
          Back to Projects
        </button>
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

  /**
   * Setup chips rendering after HTML is inserted into DOM
   * REUSED: Same pattern as projects-list-modal
   * CRITICAL: Must be called after render() HTML is inserted
   * 
   * @param {HTMLElement} container - Container element with project detail
   */
  setupChips(container) {
    // UPDATED COMMENTS: Render chips for project tags
    const tagsContainer = container.querySelector('.project-tags');
    if (!tagsContainer) return;
    
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

  /**
   * Setup image click handlers for fullscreen viewing
   * CRITICAL: Attach click handlers to all images in project content
   * UPDATED COMMENTS: Opens ImageViewer on image click
   * 
   * @param {HTMLElement} container - Container element with project detail
   */
  setupImageViewers(container) {
    // CRITICAL: Find all images in project content
    const images = container.querySelectorAll('.project-content img, .project-hero img');
    
    images.forEach(img => {
      // UPDATED COMMENTS: Make images clickable
      img.style.cursor = 'pointer';
      
      // REUSED: ImageViewer for fullscreen viewing
      img.addEventListener('click', () => {
        this.imageViewer.open(img.src, img.alt);
      });
    });
  }

  /**
   * Cleanup and destroy
   * SCALED FOR: Memory management
   */
  destroy() {
    if (this.imageViewer) {
      this.imageViewer.destroy();
    }
  }
}

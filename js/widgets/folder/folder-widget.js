/* ANCHOR: folder_widget */
/* FSD: widgets/folder → project folder implementation */
/* REUSED: WidgetBase class with project showcase functionality */

import { WidgetBase } from '../../entities/widget/widget-base.js';

/**
 * FolderWidget - Project folder with layered design and project previews
 * Features: Complex layered folder structure matching Figma design, project thumbnails, labels
 * 
 * @class FolderWidget
 * @extends WidgetBase
 */
export class FolderWidget extends WidgetBase {
  constructor(element, options = {}) {
    super(element, { ...options, type: 'folder' });
    
    // UPDATED COMMENTS: Folder configuration with project data and theme support
    this.title = options.title || 'Projects';
    this.itemCount = options.itemCount || 17;
    this.projects = options.projects || this.getDefaultProjects();
    this.theme = options.theme || 'default'; // REUSED: Theme system for SVG variants
    
    this.createFolderStructure();
  }

  /**
   * Get default project data for demonstration
   * UPDATED COMMENTS: Simplified - no actual project data needed
   */
  getDefaultProjects() {
    return [];
  }

  /**
   * Create simple folder structure with project preview cards
   * UPDATED COMMENTS: Added theme support for pink/default SVG variants and project images
   * SCALED FOR: Project showcase with theme-based visual styling and real project thumbnails
   */
  createFolderStructure() {
    const targetElement = this.innerElement || this.element;
    
    // REUSED: Theme-based SVG path selection
    const svgPaths = this.getSvgPaths();
    
    // CRITICAL: Generate project preview cards with images
    const projectCardsHTML = this.generateProjectCards();
    
    targetElement.innerHTML = `
      <div class="folder-container folder-container--${this.theme}">
        <div class="folder-icon-area">
          <!-- Layer 1: Back folder SVG with shadow -->
          <img class="folder-back" src="${svgPaths.back}" alt="Folder back" />
          
          <!-- Layer 1.5: SVG shadow overlay -->
          <img class="folder-back-shadow" src="/assets/images/folder-back-shadow.svg" alt="Folder shadow" />
          
          <!-- Layer 2: Project preview cards with images -->
          <div class="project-previews">
            ${projectCardsHTML}
          </div>
          
          <!-- Layer 3: Front folder SVG -->
          <img class="folder-front" src="${svgPaths.front}" alt="Folder front" />
        </div>
        
        <!-- Folder labels -->
        <div class="folder-labels">
          <div class="folder-title">${this.escapeHtml(this.title)}</div>
          <div class="folder-subtitle">${this.itemCount} items</div>
        </div>
      </div>
    `;
  }

  /**
   * Generate project preview cards HTML with images
   * UPDATED COMMENTS: Creates 3 project cards with background images from project data
   * SCALED FOR: Dynamic project thumbnails with fallback to placeholder
   */
  generateProjectCards() {
    // CRITICAL: Use last 3 projects or create empty cards
    const projectsToShow = this.projects.slice(0, 3);
    
    let cardsHTML = '';
    for (let i = 0; i < 3; i++) {
      const project = projectsToShow[i];
      const cardClass = `project-card project-card--${i + 1}`;
      
      if (project && project.image) {
        // UPDATED COMMENTS: Card with project thumbnail as background
        cardsHTML += `<div class="${cardClass}" style="background-image: url('${this.escapeHtml(project.image)}'); background-size: cover; background-position: center;"></div>`;
      } else {
        // REUSED: Empty card with default styling
        cardsHTML += `<div class="${cardClass}"></div>`;
      }
    }
    
    return cardsHTML;
  }

  /**
   * Get SVG paths based on theme
   * REUSED: Theme-based asset selection utility
   */
  getSvgPaths() {
    if (this.theme === 'pink') {
      return {
        back: '/assets/images/folder-bot-pink.svg',
        front: '/assets/images/folder-top-pink.svg'
      };
    }
    
    // Default theme
    return {
      back: '/assets/images/folder-bot.svg',
      front: '/assets/images/folder-top.svg'
    };
  }



  /**
   * Escape HTML to prevent XSS
   * SCALED FOR: Security-first content handling
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Update folder projects and item count
   * UPDATED COMMENTS: Dynamic content updates with theme support and re-rendering
   */
  updateProjects(projects, itemCount, theme) {
    if (projects) this.projects = projects;
    if (itemCount !== undefined) this.itemCount = itemCount;
    if (theme) this.theme = theme;
    
    this.createFolderStructure();
    
    // Emit projects update event
    if (this.eventBus) {
      this.eventBus.emit('folder:updated', {
        widget: this,
        projects: this.projects,
        itemCount: this.itemCount,
        theme: this.theme
      });
    }
  }

  /**
   * Widget-specific click handler
   * UPDATED COMMENTS: Navigates to projects list page
   */
  onClick(data) {
    // CRITICAL: Navigate to projects list page instead of opening modal
    if (this.eventBus) {
      // UPDATED COMMENTS: Determine category from theme
      const category = this.theme === 'pink' ? 'fun' : 'work';
      
      this.eventBus.emit('folder:navigate', {
        widget: this,
        category: category,
        title: this.title,
        url: '/projects'
      });
    } else {
      console.error('❌ No eventBus available!');
    }
  }

  /**
   * Widget-specific long press handler
   * UPDATED COMMENTS: Context menu for folder management
   */
  onLongPress(data) {
    if (this.eventBus) {
      this.eventBus.emit('folder:longpress', {
        widget: this,
        action: 'show-options'
      });
    }
  }

  /**
   * Get folder data for serialization
   * SCALED FOR: Data persistence and export functionality with theme support
   */
  getData() {
    return {
      ...super.getInfo(),
      title: this.title,
      itemCount: this.itemCount,
      projects: this.projects,
      theme: this.theme
    };
  }
}
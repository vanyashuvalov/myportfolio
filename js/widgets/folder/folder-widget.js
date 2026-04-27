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
    
    // UPDATED COMMENTS: Folder configuration with project data, theme support, and project-specific mode
    this.title = options.title || 'Projects';
    this.itemCount = options.itemCount || 17;
    this.projects = options.projects || this.getDefaultProjects();
    this.theme = options.theme || 'default'; // REUSED: Theme system for SVG variants
    this.mode = options.mode || 'category';
    this.subtitle = options.subtitle || `${this.itemCount} items`;
    this.projectUrl = options.projectUrl || null;
    this.projectId = options.projectId || null;
    this.projectCategory = options.projectCategory || 'work';
    
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
          <div class="folder-title" title="${this.escapeHtml(this.title)}">${this.escapeHtml(this.title)}</div>
          <div class="folder-subtitle" title="${this.escapeHtml(this.subtitle)}">${this.escapeHtml(this.subtitle)}</div>
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
    // CRITICAL: Repeat the single project thumbnail in project mode so the folder still reads as a layered stack
    const projectsToShow = this.mode === 'project' && this.projects.length === 1
      ? [this.projects[0], this.projects[0], this.projects[0]]
      : this.projects.slice(0, 3);
    
    let cardsHTML = '';
    for (let i = 0; i < 3; i++) {
      const project = projectsToShow[i];
      const cardClass = `project-card project-card--${i + 1}`;
      
      if (project && (project.image || project.thumbnail)) {
        // UPDATED COMMENTS: Card with project thumbnail as background
        const imageUrl = project.image || project.thumbnail;
        cardsHTML += `<div class="${cardClass}" style="background-image: url('${this.escapeHtml(imageUrl)}'); background-size: cover; background-position: center;"></div>`;
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
   * UPDATED COMMENTS: Navigates directly to the project page in project mode, or keeps legacy folder navigation for non-project folders
   */
  onClick(data) {
    if (this.eventBus) {
      if (this.projectUrl) {
        this.eventBus.emit('folder:navigate', {
          widget: this,
          url: this.projectUrl,
          projectId: this.projectId,
          category: this.projectCategory,
          title: this.title
        });
        return;
      }

      // UPDATED COMMENTS: Determine category from theme for legacy folder navigation
      const category = this.theme === 'pink' ? 'fun' : 'work';
      
      this.eventBus.emit('folder:navigate', {
        widget: this,
        category: category,
        title: this.title,
        url: category === 'fun' ? '/fun' : '/'
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
      theme: this.theme,
      mode: this.mode,
      subtitle: this.subtitle,
      projectUrl: this.projectUrl,
      projectId: this.projectId,
      projectCategory: this.projectCategory
    };
  }
}

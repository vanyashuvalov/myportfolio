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
   * UPDATED COMMENTS: Added theme support for pink/default SVG variants
   * SCALED FOR: Project showcase with theme-based visual styling
   */
  createFolderStructure() {
    const targetElement = this.innerElement || this.element;
    
    // REUSED: Theme-based SVG path selection
    const svgPaths = this.getSvgPaths();
    
    targetElement.innerHTML = `
      <div class="folder-container folder-container--${this.theme}">
        <div class="folder-icon-area">
          <!-- Layer 1: Back folder SVG with shadow -->
          <img class="folder-back" src="${svgPaths.back}" alt="Folder back" />
          
          <!-- Layer 1.5: SVG shadow overlay -->
          <img class="folder-back-shadow" src="/assets/images/folder-back-shadow.svg" alt="Folder shadow" />
          
          <!-- Layer 2: Project preview cards -->
          <div class="project-previews">
            <div class="project-card project-card--1"></div>
            <div class="project-card project-card--2"></div>
            <div class="project-card project-card--3"></div>
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
   * UPDATED COMMENTS: Click functionality disabled for now
   */
  onClick(data) {
    // DISABLED - no click functionality needed for now
    return;
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
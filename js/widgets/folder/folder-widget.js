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
    
    // UPDATED COMMENTS: Folder configuration with project data
    this.title = options.title || 'Projects';
    this.itemCount = options.itemCount || 17;
    this.projects = options.projects || this.getDefaultProjects();
    
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
   * Create simple folder structure with 2 layers: back SVG and front SVG
   * UPDATED COMMENTS: Using external SVG shadow file instead of CSS gradient
   * SCALED FOR: Clean folder design with SVG-based shadows
   */
  createFolderStructure() {
    const targetElement = this.innerElement || this.element;
    targetElement.innerHTML = `
      <div class="folder-container">
        <!-- Layer 1: Back folder SVG with shadow -->
        <img class="folder-back" src="/assets/images/folder-bot.svg" alt="Folder back" />
        
        <!-- Layer 1.5: SVG shadow overlay -->
        <img class="folder-back-shadow" src="/assets/images/folder-back-shadow.svg" alt="Folder shadow" />
        
        <!-- Layer 2: Front folder SVG -->
        <img class="folder-front" src="/assets/images/folder-top.svg" alt="Folder front" />
        
        <!-- Folder labels -->
        <div class="folder-labels">
          <div class="folder-title">${this.escapeHtml(this.title)}</div>
          <div class="folder-subtitle">${this.itemCount} items</div>
        </div>
      </div>
    `;
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
   * UPDATED COMMENTS: Dynamic content updates with re-rendering
   */
  updateProjects(projects, itemCount) {
    if (projects) this.projects = projects;
    if (itemCount !== undefined) this.itemCount = itemCount;
    
    this.createFolderStructure();
    
    // Emit projects update event
    if (this.eventBus) {
      this.eventBus.emit('folder:updated', {
        widget: this,
        projects: this.projects,
        itemCount: this.itemCount
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
   * SCALED FOR: Data persistence and export functionality
   */
  getData() {
    return {
      ...super.getInfo(),
      title: this.title,
      itemCount: this.itemCount,
      projects: this.projects
    };
  }
}
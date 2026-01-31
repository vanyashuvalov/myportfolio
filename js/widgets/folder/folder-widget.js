/* ANCHOR: folder_widget */
/* FSD: widgets/folder → project folder implementation */
/* REUSED: WidgetBase class with project showcase functionality */

import { WidgetBase } from '../../entities/widget/widget-base.js';

/**
 * FolderWidget - Project folder with thumbnail previews
 * Features: Three-layer SVG structure, project thumbnails, hover effects
 * 
 * @class FolderWidget
 * @extends WidgetBase
 */
export class FolderWidget extends WidgetBase {
  constructor(element, options = {}) {
    super(element, { ...options, type: 'folder' });
    
    this.title = options.title || 'Projects';
    this.subtitle = options.subtitle || '0 items';
    this.projects = options.projects || [];
    
    this.createFolderStructure();
  }

  /**
   * Create three-layer folder structure
   * UPDATED COMMENTS: Professional folder design with SVG layers
   */
  createFolderStructure() {
    this.element.innerHTML = `
      <div class="folder-container">
        <!-- Background layer with shadow -->
        <svg class="folder-back" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="folderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#F3F4F6;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#E5E7EB;stop-opacity:1" />
            </linearGradient>
          </defs>
          <path d="M10 25 L50 25 L60 15 L130 15 L130 125 L10 125 Z" 
                fill="url(#folderGradient)" 
                stroke="#D1D5DB" 
                stroke-width="1"/>
        </svg>
        
        <!-- Project thumbnails layer -->
        <div class="folder-thumbnails">
          ${this.createThumbnails()}
        </div>
        
        <!-- Upper layer -->
        <svg class="folder-upper" viewBox="0 0 140 65" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="folderUpperGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#F9FAFB;stop-opacity:0.9" />
              <stop offset="100%" style="stop-color:#F3F4F6;stop-opacity:0.9" />
            </linearGradient>
          </defs>
          <path d="M10 25 L50 25 L60 15 L130 15 L130 65 L10 65 Z" 
                fill="url(#folderUpperGradient)" 
                stroke="#D1D5DB" 
                stroke-width="1"/>
        </svg>
        
        <!-- Folder label (static, doesn't rotate) -->
        <div class="folder-label">
          <div class="folder-title">${this.escapeHtml(this.title)}</div>
          <div class="folder-subtitle">${this.escapeHtml(this.subtitle)}</div>
        </div>
      </div>
    `;
  }

  /**
   * Create project thumbnails grid
   * REUSED: Grid layout pattern for consistent thumbnail display
   */
  createThumbnails() {
    if (!this.projects || this.projects.length === 0) {
      return '<div class="folder-empty">No projects</div>';
    }
    
    // Show up to 4 thumbnails in 2x2 grid
    const visibleProjects = this.projects.slice(0, 4);
    
    return visibleProjects
      .map((project, index) => this.createThumbnail(project, index))
      .join('');
  }

  /**
   * Create individual project thumbnail
   * SCALED FOR: Dynamic thumbnail generation with fallbacks
   */
  createThumbnail(project, index) {
    const style = project.thumbnail 
      ? `background-image: url('${project.thumbnail}');`
      : `background-color: ${project.color || this.getDefaultColor(index)};`;
    
    return `
      <div class="folder-thumbnail" 
           style="${style}"
           data-project-id="${project.id}"
           title="${this.escapeHtml(project.title)}">
        ${!project.thumbnail ? this.createColorThumbnail(project) : ''}
      </div>
    `;
  }

  /**
   * Create color-based thumbnail for projects without images
   * UPDATED COMMENTS: Fallback thumbnail with project initials
   */
  createColorThumbnail(project) {
    const initials = project.title
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
    
    return `
      <div class="thumbnail-initials" style="color: white; font-weight: bold; font-size: 12px;">
        ${initials}
      </div>
    `;
  }

  /**
   * Get default color for project thumbnails
   * REUSED: Color palette for consistent visual hierarchy
   */
  getDefaultColor(index) {
    const colors = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];
    return colors[index % colors.length];
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
   * Update folder projects
   * UPDATED COMMENTS: Dynamic project updates with re-rendering
   */
  updateProjects(projects) {
    this.projects = projects || [];
    this.subtitle = `${this.projects.length} item${this.projects.length !== 1 ? 's' : ''}`;
    this.createFolderStructure();
    
    // Emit projects update event
    if (this.eventBus) {
      this.eventBus.emit('folder:updated', {
        widget: this,
        projects: this.projects
      });
    }
  }

  /**
   * Widget-specific click handler
   * REUSED: Modal opening pattern for project showcase
   */
  onClick(data) {
    // Open folder modal with project grid
    if (this.eventBus) {
      this.eventBus.emit('modal:open', {
        type: 'folder',
        title: this.title,
        projects: this.projects,
        widget: this
      });
    }
  }

  /**
   * Widget-specific double-click handler
   * SCALED FOR: Quick project access functionality
   */
  onDoubleClick(data) {
    // Open first project directly on double-click
    if (this.projects.length > 0) {
      if (this.eventBus) {
        this.eventBus.emit('project:open', {
          project: this.projects[0],
          widget: this
        });
      }
    }
  }

  /**
   * Handle thumbnail hover effects
   * UPDATED COMMENTS: Individual thumbnail interaction handling
   */
  setupThumbnailInteractions() {
    const thumbnails = this.element.querySelectorAll('.folder-thumbnail');
    
    thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('pointerenter', () => {
        thumbnail.style.transform = 'scale(1.1)';
        thumbnail.style.zIndex = '10';
      });
      
      thumbnail.addEventListener('pointerleave', () => {
        thumbnail.style.transform = 'scale(1)';
        thumbnail.style.zIndex = '2';
      });
      
      thumbnail.addEventListener('click', (event) => {
        event.stopPropagation();
        const projectId = thumbnail.dataset.projectId;
        const project = this.projects.find(p => p.id.toString() === projectId);
        
        if (project && this.eventBus) {
          this.eventBus.emit('project:open', { project, widget: this });
        }
      });
    });
  }

  /**
   * Initialize widget after DOM insertion
   * REUSED: Post-creation setup pattern
   */
  initialize() {
    super.initialize();
    
    // Setup thumbnail interactions after DOM is ready
    setTimeout(() => {
      this.setupThumbnailInteractions();
    }, 100);
  }

  /**
   * Get folder data for serialization
   * SCALED FOR: Data persistence and export functionality
   */
  getData() {
    return {
      ...super.getInfo(),
      title: this.title,
      subtitle: this.subtitle,
      projects: this.projects
    };
  }
}
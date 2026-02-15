/* ANCHOR: desktop_canvas */
/* FSD: features/desktop-canvas → main desktop functionality */
/* SCALED FOR: Multiple widgets, responsive design, performance optimization */

import { ClockWidget } from '../../widgets/clock/clock-widget.js';
import { StickerWidget } from '../../widgets/sticker/sticker-widget.js';
import { FolderWidget } from '../../widgets/folder/folder-widget.js';
import { CatWidget } from '../../widgets/cat/cat-widget.js';
import { CatStickerWidget } from '../../widgets/cat-sticker/cat-sticker-widget.js';
import { TelegramWidget } from '../../widgets/telegram/telegram-widget.js';
import { FeedButtonWidget } from '../../widgets/feed-button/feed-button-widget.js';
import { ResumeWidget } from '../../widgets/resume/resume-widget.js';
import { widgetInitializer } from '../../shared/lib/widget-initializer.js';
import { getWidgetRotation } from '../../shared/lib/widget-rotation.js';

/**
 * DesktopCanvas - Main container and manager for all desktop widgets
 * Handles widget lifecycle, positioning, canvas bounds, and global interactions
 * 
 * @class DesktopCanvas
 */
export class DesktopCanvas {
  constructor(container, options = {}) {
    this.container = container;
    this.widgets = new Map();
    this.widgetTypes = new Map();
    this.bounds = null;
    
    // System references
    this.eventBus = options.eventBus;
    this.assetManager = options.assetManager;
    this.performanceMonitor = options.performanceMonitor;
    
    // Configuration
    this.config = {
      maxWidgets: options.maxWidgets || 50,
      gridSize: options.gridSize || 120,
      padding: options.padding || 20,
      autoArrange: options.autoArrange !== false,
      ...options.config
    };
    
    // State
    this.isInitialized = false;
    this.resizeObserver = null;
    
    this.initialize();
  }

  /**
   * Initialize desktop canvas with default widgets
   * UPDATED COMMENTS: Comprehensive canvas setup with error handling
   */
  async initialize() {
    try {
      // CRITICAL: Wait for DOM and CSS to be fully loaded
      await this.waitForDOMReady();
      
      this.registerWidgetTypes();
      this.setupCanvas();
      this.setupEventListeners();
      this.setupResizeObserver();
      
      // Calculate initial bounds
      this.updateBounds();
      
      // CRITICAL: Wait a frame to ensure workspace is rendered
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      // DEBUG: Log workspace state after setup
      console.log('Workspace state after setup:', {
        workspaceExists: !!this.workspaceContainer,
        workspaceRect: this.workspaceContainer?.getBoundingClientRect(),
        workspaceStyle: this.workspaceContainer ? window.getComputedStyle(this.workspaceContainer) : null
      });
      
      // Create default widgets
      await this.createDefaultWidgets();
      
      this.isInitialized = true;
      
      // Emit initialization event
      if (this.eventBus) {
        this.eventBus.emit('canvas:initialized', {
          canvas: this,
          bounds: this.bounds,
          widgetCount: this.widgets.size
        });
      }
      
      console.log('Desktop canvas initialized successfully');
    } catch (error) {
      console.error('Failed to initialize desktop canvas:', error);
      throw error;
    }
  }

  /**
   * Wait for DOM to be ready
   * REUSED: DOM readiness utility for proper initialization timing
   */
  async waitForDOMReady() {
    return new Promise((resolve) => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', resolve, { once: true });
      }
    });
  }

  /**
   * Register available widget types
   * REUSED: Widget type registry for dynamic widget creation
   */
  registerWidgetTypes() {
    this.widgetTypes.set('clock', ClockWidget);
    this.widgetTypes.set('sticker', StickerWidget);
    this.widgetTypes.set('folder', FolderWidget);
    this.widgetTypes.set('cat', CatWidget);
    this.widgetTypes.set('cat-sticker', CatStickerWidget);
    this.widgetTypes.set('telegram', TelegramWidget);
    this.widgetTypes.set('feed-button', FeedButtonWidget);
    this.widgetTypes.set('resume', ResumeWidget);
  }

  /**
   * Setup canvas container properties
   * SCALED FOR: Centralized workspace with internal coordinate system
   * UPDATED COMMENTS: Create workspace wrapper for controlled widget positioning
   */
  setupCanvas() {
    if (!this.container) {
      throw new Error('Canvas container is required');
    }
    
    // REUSED: CSS-only styling approach for better maintainability
    // Remove any existing inline styles that might conflict
    this.container.removeAttribute('style');
    
    // Add canvas class (CSS handles all styling)
    this.container.classList.add('desktop-canvas');
    
    // CRITICAL: Create centralized workspace container
    this.workspaceContainer = document.createElement('div');
    this.workspaceContainer.className = 'workspace-container';
    this.workspaceContainer.dataset.workspaceId = this.generateId();
    
    // UPDATED COMMENTS: Clean workspace without visual debugging elements
    this.workspaceContainer.style.width = 'calc(100vw - 20px)';
    this.workspaceContainer.style.height = 'calc(100vh - 20px)';
    this.workspaceContainer.style.minWidth = '320px';
    this.workspaceContainer.style.minHeight = '240px';
    this.workspaceContainer.style.maxWidth = 'none';
    this.workspaceContainer.style.maxHeight = 'none';
    this.workspaceContainer.style.border = 'none';
    this.workspaceContainer.style.background = 'transparent';
    this.workspaceContainer.style.backdropFilter = 'none';
    this.workspaceContainer.style.position = 'relative';
    this.workspaceContainer.style.boxSizing = 'border-box';
    this.workspaceContainer.style.borderRadius = '0';
    this.workspaceContainer.style.padding = '0';
    this.workspaceContainer.style.margin = '0';
    // CRITICAL: Don't set top/left/transform - let flexbox handle centering
    this.workspaceContainer.style.flexShrink = '0';
    
    // UPDATED COMMENTS: Workspace container becomes the widget parent
    this.container.appendChild(this.workspaceContainer);
    
    // Set data attributes for identification
    this.container.dataset.canvasId = this.generateId();
    
    // DEBUG: Log workspace dimensions after DOM insertion
    setTimeout(() => {
      const rect = this.workspaceContainer.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(this.workspaceContainer);
      console.log('Workspace container dimensions after insertion:', {
        element: this.workspaceContainer,
        rect: rect,
        computedWidth: computedStyle.width,
        computedHeight: computedStyle.height,
        clientWidth: this.workspaceContainer.clientWidth,
        clientHeight: this.workspaceContainer.clientHeight,
        offsetWidth: this.workspaceContainer.offsetWidth,
        offsetHeight: this.workspaceContainer.offsetHeight,
        scrollWidth: this.workspaceContainer.scrollWidth,
        scrollHeight: this.workspaceContainer.scrollHeight,
        parentRect: this.container.getBoundingClientRect()
      });
    }, 100);
    
    // Force immediate layout recalculation for workspace
    this.workspaceContainer.offsetHeight; // Trigger reflow
  }

  /**
   * Setup global event listeners
   * UPDATED COMMENTS: Comprehensive event handling for canvas management
   */
  setupEventListeners() {
    if (!this.eventBus) return;
    
    // Store event handlers for cleanup
    this.eventHandlers = {
      'widget:dragmove': this.handleWidgetDragMove.bind(this),
      'widget:dragend': this.handleWidgetDragEnd.bind(this),
      'widget:click': this.handleWidgetClick.bind(this),
      'widget:destroyed': this.handleWidgetDestroyed.bind(this),
      'app:hidden': this.handleAppHidden.bind(this),
      'app:visible': this.handleAppVisible.bind(this)
    };
    
    // Register event handlers
    Object.entries(this.eventHandlers).forEach(([event, handler]) => {
      this.eventBus.on(event, handler);
    });
  }

  /**
   * Setup resize observer for responsive canvas
   * REUSED: Responsive design pattern with ResizeObserver
   */
  setupResizeObserver() {
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === this.container) {
            this.handleResize();
          }
        }
      });
      
      this.resizeObserver.observe(this.container);
    } else {
      // Fallback to window resize event
      window.addEventListener('resize', this.handleResize.bind(this));
    }
  }

  /**
   * Handle canvas resize
   * SCALED FOR: Smooth responsive behavior with widget repositioning
   */
  handleResize() {
    const oldBounds = { ...this.bounds };
    this.updateBounds();
    
    // Reposition widgets if canvas size changed significantly
    if (this.shouldRepositionWidgets(oldBounds, this.bounds)) {
      this.repositionWidgets();
    }
    
    // Emit resize event
    if (this.eventBus) {
      this.eventBus.emit('canvas:resize', {
        canvas: this,
        oldBounds,
        newBounds: this.bounds
      });
    }
  }

  /**
   * Update canvas boundaries
   * UPDATED COMMENTS: Workspace-relative bounds calculation for internal positioning
   */
  updateBounds() {
    // CRITICAL: Use workspace container for bounds instead of main canvas
    const rect = this.workspaceContainer ? 
      this.workspaceContainer.getBoundingClientRect() : 
      this.container.getBoundingClientRect();
    
    this.bounds = {
      left: this.config.padding,
      top: this.config.padding,
      right: rect.width - this.config.padding,
      bottom: rect.height - this.config.padding,
      width: rect.width,
      height: rect.height,
      centerX: rect.width / 2,
      centerY: rect.height / 2
    };
  }

  /**
   * Check if widgets should be repositioned after resize
   * REUSED: Resize threshold logic for performance optimization
   */
  shouldRepositionWidgets(oldBounds, newBounds) {
    if (!oldBounds) return false;
    
    const widthChange = Math.abs(newBounds.width - oldBounds.width);
    const heightChange = Math.abs(newBounds.height - oldBounds.height);
    
    // Reposition if size changed by more than 100px
    return widthChange > 100 || heightChange > 100;
  }

  /**
   * Reposition widgets after significant canvas resize
   * SCALED FOR: Physics-based repositioning with smooth movement
   */
  repositionWidgets() {
    const widgets = Array.from(this.widgets.values());
    
    widgets.forEach(widget => {
      // CRITICAL: Physics system automatically handles viewport constraints
      // No manual position adjustment needed - physics system will constrain movement
      
      // UPDATED COMMENTS: If widget is outside viewport, physics will smoothly move it back
      if (widget.physicsBody) {
        // Physics system handles all positioning automatically
        // Widget will smoothly animate to valid position if needed
      }
    });
  }

  /**
   * Create default widgets for the desktop
   * UPDATED COMMENTS: Full-screen workspace layout with maximum space utilization
   * SCALED FOR: Full viewport widget placement with minimal margins
   */
  async createDefaultWidgets() {
    console.log('Canvas initialized - adding portfolio widgets with full-screen workspace');
    console.log('Workspace: calc(100% - 20px) for maximum space utilization');
    console.log('Layout: Sticker (left-top), Folders+Resume (left-center area), Clock (right-top), Telegram+Cat (right-side)');
    
    // UPDATED COMMENTS: Full-screen workspace layout with minimal margins
    // Workspace now uses calc(100vw - 20px) × calc(100vh - 20px) for maximum space
    // Widget positions remain percentage-based for responsive scaling
    
    // REUSED: Widget creation logic for sticker (левый верхний угол)
    const stickerWidget = {
      type: 'sticker',
      cssPositionClass: 'widget-position--sticker',
      config: {
        title: 'Hi! My name is Ivan, I am Product Designer',
        content: 'Leading design and prototyping of data dashboard for clinical workers scheduling surgery blocks, resolving critical block time issues\n\nDesigning product flows for clinical workers in maternity health, translating complex healthcare workflows into intuitive experiences for 2,600+ care sites',
        size: 'large',
        theme: 'yellow',
        showButton: true,
        buttonText: 'Chat Me',
        buttonUrl: 'https://t.me/vanyashuvalov'
      }
    };
    
    // REUSED: Widget creation logic for Projects folder (центр-лево)
    const projectsFolderWidget = {
      type: 'folder',
      cssPositionClass: 'widget-position--projects-folder',
      config: {
        title: 'Projects',
        itemCount: 17,
        theme: 'default', // CRITICAL: Default theme uses regular SVGs
        projects: await this.getProjectData()
      }
    };
    
    // REUSED: Widget creation logic for Fun folder (центр-право)
    const funFolderWidget = {
      type: 'folder',
      cssPositionClass: 'widget-position--fun-folder',
      config: {
        title: 'Fun',
        itemCount: 12, // UPDATED COMMENTS: 12 items as requested
        theme: 'pink', // CRITICAL: Pink theme uses pink SVGs
        projects: await this.getFunProjectData()
      }
    };
    
    // REUSED: Widget creation logic for resume (центр-низ)
    const resumeWidget = {
      type: 'resume',
      cssPositionClass: 'widget-position--resume',
      config: {
        personalInfo: {
          name: 'Ivan Shuvalov',
          title: 'Product Designer',
          location: 'Remote',
          email: 'ivan.shuvalov@example.com',
          phone: '+1 (555) 123-4567'
        }
      }
    };
    
    // REUSED: Widget creation logic for clock (правый верхний угол)
    const clockWidget = {
      type: 'clock',
      cssPositionClass: 'widget-position--clock',
      config: {
        timezone: 'Europe/Moscow',
        showSeconds: true,
        rotation: 0 // CRITICAL: Clock widget needs 0 rotation for readability
      }
    };
    
    // CRITICAL: Telegram widget with channel information (правая сторона, центр)
    // UPDATED COMMENTS: Now uses real API data from vanya_knopochkin channel
    const telegramWidget = {
      type: 'telegram',
      cssPositionClass: 'widget-position--telegram',
      config: {
        channelUsername: 'vanya_knopochkin', // UPDATED: Changed to working channel
        autoUpdate: true, // SCALED FOR: Auto-refresh every 5 minutes
        updateInterval: 300000 // 5 minutes in milliseconds
      }
    };
    
    // CRITICAL: Cat sticker widget with blue gradient theme (правая сторона, низ)
    const catStickerWidget = {
      type: 'cat-sticker',
      cssPositionClass: 'widget-position--cat-sticker',
      config: {
        catName: 'Cat Here',
        description: 'You can interact my boy as you want. But do not punch him',
        showFeedButton: true,
        targetCat: null // Will be set when cat widget is added
      }
    };
    
    // Create all seven widgets with organized workspace positioning
    this.createWidget(stickerWidget.type, null, stickerWidget.config, stickerWidget.cssPositionClass);
    this.createWidget(projectsFolderWidget.type, null, projectsFolderWidget.config, projectsFolderWidget.cssPositionClass);
    this.createWidget(funFolderWidget.type, null, funFolderWidget.config, funFolderWidget.cssPositionClass);
    this.createWidget(resumeWidget.type, null, resumeWidget.config, resumeWidget.cssPositionClass);
    this.createWidget(clockWidget.type, null, clockWidget.config, clockWidget.cssPositionClass);
    this.createWidget(telegramWidget.type, null, telegramWidget.config, telegramWidget.cssPositionClass);
    this.createWidget(catStickerWidget.type, null, catStickerWidget.config, catStickerWidget.cssPositionClass);
    
    // Store remaining planned widgets for future incremental addition
    this.plannedWidgets = [
      {
        type: 'cat',
        cssPositionClass: 'widget-position--cat',
        config: { name: 'Pixel' }
      },
      {
        type: 'feed-button',
        cssPositionClass: 'widget-position--feed-button',
        config: { targetCat: 'cat' }
      }
    ];
    
    // SCALED FOR: Clean incremental widget development within organized workspace
    return Promise.resolve();
  }

  /**
   * Get project data for folder widget
   * REUSED: Project data loading utility with realistic portfolio projects
   */
  async getProjectData() {
    // UPDATED COMMENTS: Real portfolio projects with proper image paths
    return [
      { 
        id: 'clinical-dashboard', 
        title: 'Clinical Dashboard', 
        image: '/assets/images/projects/clinical-dashboard.jpg',
        rotation: -0.33
      },
      { 
        id: 'maternity-app', 
        title: 'Maternity App', 
        image: '/assets/images/projects/maternity-app.jpg',
        rotation: 5.67
      },
      { 
        id: 'surgery-scheduling', 
        title: 'Surgery Scheduling', 
        image: '/assets/images/projects/surgery-scheduling.jpg',
        rotation: 11.67
      }
    ];
  }

  /**
   * Get fun project data for pink folder widget
   * REUSED: Fun project data loading utility with creative/personal projects
   * SCALED FOR: Different project categories with theme-appropriate content
   */
  async getFunProjectData() {
    // UPDATED COMMENTS: Fun/creative projects for pink folder theme
    return [
      { 
        id: 'pixel-art', 
        title: 'Pixel Art Collection', 
        image: '/assets/images/projects/pixel-art.jpg',
        rotation: -2.5
      },
      { 
        id: 'ui-experiments', 
        title: 'UI Experiments', 
        image: '/assets/images/projects/ui-experiments.jpg',
        rotation: 4.2
      },
      { 
        id: 'animation-studies', 
        title: 'Animation Studies', 
        image: '/assets/images/projects/animation-studies.jpg',
        rotation: 8.8
      }
    ];
  }

  /**
   * Create widget on canvas with proper initialization
   * UPDATED COMMENTS: CSS-based positioning with optional fallback to JS positioning
   * SCALED FOR: Separation of positioning and visual effects
   */
  createWidget(type, position = null, config = {}, cssPositionClass = null) {
    if (this.widgets.size >= this.config.maxWidgets) {
      console.warn(`Maximum widget limit (${this.config.maxWidgets}) reached`);
      return null;
    }
    
    const WidgetClass = this.widgetTypes.get(type);
    if (!WidgetClass) {
      console.error(`Unknown widget type: ${type}`);
      return null;
    }
    
    // CRITICAL: Create wrapper element for positioning
    const wrapperElement = document.createElement('div');
    const innerElement = document.createElement('div');
    
    // UPDATED COMMENTS: CSS-based positioning takes priority over JS positioning
    if (cssPositionClass) {
      // CRITICAL: Use CSS viewport positioning for responsive design
      wrapperElement.className = `widget-wrapper ${cssPositionClass}`;
      wrapperElement.style.position = 'absolute';
      // CRITICAL: Don't set transform here - SimpleDragHover will handle it
      wrapperElement.style.transformOrigin = 'top left';
      wrapperElement.style.willChange = 'transform';
      wrapperElement.style.opacity = '0';
      wrapperElement.style.transition = 'opacity 0.3s ease-out';
      
      // CRITICAL: Don't set dataset.initialX/Y for CSS positioning - let CSS handle it
      // SimpleDragHover will use current computed position as starting point
    } else {
      // FALLBACK: JavaScript positioning for backwards compatibility
      const finalPosition = position || this.findAvailablePosition();
      
      wrapperElement.className = 'widget-wrapper';
      wrapperElement.style.position = 'absolute';
      wrapperElement.style.transformOrigin = 'top left';
      wrapperElement.style.willChange = 'transform';
      wrapperElement.style.opacity = '0';
      wrapperElement.style.transition = 'opacity 0.3s ease-out';
      
      // CRITICAL: Set initial position data for WidgetBase (only for JS positioning)
      wrapperElement.dataset.initialX = finalPosition.x;
      wrapperElement.dataset.initialY = finalPosition.y;
    }
    
    // UPDATED COMMENTS: Inner element handles visual effects
    innerElement.className = 'widget-inner';
    wrapperElement.appendChild(innerElement);
    
    // REUSED: Widget creation with wrapper structure
    const widget = new WidgetClass(wrapperElement, {
      type,
      position: cssPositionClass ? null : (position || this.findAvailablePosition()),
      rotation: getWidgetRotation(type), // CRITICAL: Pass individual rotation from shared module
      eventBus: this.eventBus,
      assetManager: this.assetManager,
      canvasBounds: this.bounds,
      innerElement: innerElement,
      cssPositioning: !!cssPositionClass, // CRITICAL: Flag for CSS-based positioning
      ...config
    });
    
    // CRITICAL: Update widget position after creation (only for JS positioning)
    if (!cssPositionClass && position) {
      widget.currentPosition = { x: position.x, y: position.y };
    }
    
    // SCALED FOR: DOM insertion into workspace container
    const targetContainer = this.workspaceContainer || this.container;
    targetContainer.appendChild(wrapperElement);
    
    // Show widget smoothly
    requestAnimationFrame(() => {
      wrapperElement.style.opacity = '1';
    });
    
    // Add to widgets registry
    this.widgets.set(widget.id, widget);
    
    // Emit widget created event
    if (this.eventBus) {
      this.eventBus.emit('canvas:widget-created', {
        canvas: this,
        widget,
        type
      });
    }
    
    return widget;
  }

  /**
   * Find available position for new widget
   * UPDATED COMMENTS: Grid-based positioning with collision detection
   */
  findAvailablePosition() {
    const { gridSize } = this.config;
    const cols = Math.floor((this.bounds.right - this.bounds.left) / gridSize);
    const rows = Math.floor((this.bounds.bottom - this.bounds.top) / gridSize);
    
    // Try grid positions first
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = this.bounds.left + (col * gridSize);
        const y = this.bounds.top + (row * gridSize);
        
        if (!this.isPositionOccupied(x, y)) {
          return { x, y };
        }
      }
    }
    
    // Fallback to random position if grid is full
    return {
      x: this.bounds.left + Math.random() * (this.bounds.right - this.bounds.left - 200),
      y: this.bounds.top + Math.random() * (this.bounds.bottom - this.bounds.top - 200)
    };
  }

  /**
   * Check if position is occupied by another widget
   * REUSED: Collision detection utility for widget positioning
   */
  isPositionOccupied(x, y, excludeWidget = null) {
    const threshold = 100; // Minimum distance between widgets
    
    for (const widget of this.widgets.values()) {
      if (widget === excludeWidget) continue;
      
      const distance = Math.sqrt(
        Math.pow(widget.position.x - x, 2) + 
        Math.pow(widget.position.y - y, 2)
      );
      
      if (distance < threshold) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Constrain widget position to canvas boundaries
   * SCALED FOR: Flexible constraint system with widget-specific rules
   */
  constrainWidgetPosition(widget, position) {
    const widgetSize = 140; // Approximate widget size
    
    return {
      x: Math.max(this.bounds.left, 
          Math.min(this.bounds.right - widgetSize, position.x)),
      y: Math.max(this.bounds.top, 
          Math.min(this.bounds.bottom - widgetSize, position.y))
    };
  }

  /**
   * Handle widget drag move events
   * UPDATED COMMENTS: Physics-based constraint application during drag
   */
  handleWidgetDragMove(data) {
    // CRITICAL: Skip constraint handling - physics system handles boundaries
    // Physics system automatically constrains movement within viewport
    // No manual position adjustment needed
    
    // UPDATED COMMENTS: Optional custom constraint logic can be added here
    // if (this.config.customConstraints) {
    //   // Custom constraint logic using data.physicsBody
    // }
  }

  /**
   * Handle widget drag end events
   * REUSED: Post-drag processing with physics-based positioning
   */
  handleWidgetDragEnd(data) {
    // UPDATED COMMENTS: Physics system handles smooth movement to final position
    // Snap to grid if enabled
    if (this.config.autoArrange && data.physicsBody) {
      // Get current physics position and snap to grid
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const currentPixelX = data.physicsBody.position.x * viewport.width;
      const currentPixelY = data.physicsBody.position.y * viewport.height;
      
      const snappedPosition = this.snapToGrid({ x: currentPixelX, y: currentPixelY });
      data.widget.setPosition(snappedPosition.x, snappedPosition.y);
    }
  }

  /**
   * Snap position to grid
   * SCALED FOR: Automatic widget organization and alignment
   */
  snapToGrid(position) {
    const { gridSize } = this.config;
    
    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize
    };
  }

  /**
   * Handle widget click events
   * UPDATED COMMENTS: Widget-specific click handling delegation
   */
  handleWidgetClick(data) {
    // Delegate to widget-specific handlers
    // This can be extended for global click behaviors
  }

  /**
   * Handle widget destruction
   * REUSED: Widget cleanup and memory management
   */
  handleWidgetDestroyed(data) {
    this.widgets.delete(data.id);
    
    // Emit canvas update event
    if (this.eventBus) {
      this.eventBus.emit('canvas:widget-removed', {
        canvas: this,
        widgetId: data.id,
        widgetCount: this.widgets.size
      });
    }
  }

  /**
   * Handle app hidden (tab not visible)
   * SCALED FOR: Performance optimization when not visible
   */
  handleAppHidden() {
    // Pause animations and reduce update frequency
    this.widgets.forEach(widget => {
      if (widget.animationSystem) {
        widget.animationSystem.pauseAllAnimations();
      }
    });
  }

  /**
   * Handle app visible (tab becomes visible)
   * UPDATED COMMENTS: Smooth resumption of animations and updates
   */
  handleAppVisible() {
    // Resume animations
    this.widgets.forEach(widget => {
      if (widget.animationSystem) {
        widget.animationSystem.resumeAllAnimations();
      }
    });
  }

  /**
   * Remove widget from canvas
   * REUSED: Safe widget removal with cleanup
   */
  removeWidget(widgetId) {
    const widget = this.widgets.get(widgetId);
    if (widget) {
      widget.destroy();
      return true;
    }
    return false;
  }

  /**
   * Get all widgets of specific type
   * SCALED FOR: Widget management and batch operations
   */
  getWidgetsByType(type) {
    return Array.from(this.widgets.values()).filter(widget => widget.type === type);
  }

  /**
   * Generate unique canvas ID
   * REUSED: ID generation utility
   */
  generateId() {
    return `canvas_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get canvas statistics
   * UPDATED COMMENTS: Comprehensive canvas state for debugging
   */
  getStats() {
    return {
      widgetCount: this.widgets.size,
      maxWidgets: this.config.maxWidgets,
      bounds: { ...this.bounds },
      isInitialized: this.isInitialized,
      widgetTypes: Array.from(this.widgetTypes.keys())
    };
  }

  /**
   * Destroy canvas and clean up resources
   * SCALED FOR: Complete cleanup including workspace container
   */
  destroy() {
    // Destroy all widgets
    this.widgets.forEach(widget => widget.destroy());
    this.widgets.clear();
    
    // Remove event listeners
    if (this.eventBus && this.eventHandlers) {
      Object.entries(this.eventHandlers).forEach(([event, handler]) => {
        this.eventBus.off(event, handler);
      });
    }
    
    // Disconnect resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    // Clear workspace and container
    if (this.workspaceContainer) {
      this.workspaceContainer.innerHTML = '';
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    // Emit destruction event
    if (this.eventBus) {
      this.eventBus.emit('canvas:destroyed', {
        canvas: this
      });
    }
  }
}
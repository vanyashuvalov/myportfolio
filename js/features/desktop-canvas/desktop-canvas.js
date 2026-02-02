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
      this.registerWidgetTypes();
      this.setupCanvas();
      this.setupEventListeners();
      this.setupResizeObserver();
      
      // Calculate initial bounds
      this.updateBounds();
      
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
   * SCALED FOR: Optimal rendering performance with containment
   * UPDATED COMMENTS: Remove inline styles to allow CSS fullscreen control
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
    
    // Set data attributes for identification
    this.container.dataset.canvasId = this.generateId();
    
    // Force immediate layout recalculation for fullscreen
    this.container.offsetHeight; // Trigger reflow
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
   * UPDATED COMMENTS: Accurate bounds calculation with padding
   */
  updateBounds() {
    const rect = this.container.getBoundingClientRect();
    
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
   * UPDATED COMMENTS: Adding clock, resume, sticker, cat-sticker, telegram and dual folder widgets for professional portfolio
   * SCALED FOR: Theme-based folder variants with Projects (default) and Fun (pink)
   */
  async createDefaultWidgets() {
    console.log('Canvas initialized - adding portfolio widgets');
    console.log('Current widgets: Clock + Resume + Sticker + Cat Sticker + Telegram + Projects Folder + Fun Folder');
    
    // UPDATED COMMENTS: Calculate positions for seven widgets with proper spacing
    const clockPosition = {
      x: window.innerWidth * 0.05,  // 5% from left edge
      y: window.innerHeight * 0.05  // 5% from top
    };
    
    const resumePosition = {
      x: window.innerWidth * 0.25,  // 25% from left edge
      y: window.innerHeight * 0.15  // 15% from top
    };
    
    const stickerPosition = {
      x: window.innerWidth * 0.4,   // 40% from left edge
      y: window.innerHeight * 0.3   // 30% from top
    };
    
    // CRITICAL: Cat sticker positioned near bottom left for cat information
    const catStickerPosition = {
      x: window.innerWidth * 0.05,  // 5% from left edge (below clock)
      y: window.innerHeight * 0.6   // 60% from top
    };
    
    // CRITICAL: Telegram widget positioned in center-right area
    const telegramPosition = {
      x: window.innerWidth * 0.4,   // 40% from left edge
      y: window.innerHeight * 0.6   // 60% from top
    };
    
    const projectsFolderPosition = {
      x: window.innerWidth * 0.6,   // 60% from left edge
      y: window.innerHeight * 0.15  // 15% from top
    };
    
    // REUSED: Adjacent positioning for Fun folder next to Projects
    const funFolderPosition = {
      x: window.innerWidth * 0.75,  // 75% from left edge (15% right from Projects)
      y: window.innerHeight * 0.15  // Same vertical level as Projects
    };
    
    // REUSED: Widget creation logic for clock
    const clockWidget = {
      type: 'clock',
      position: clockPosition,
      config: {
        timezone: 'Europe/Moscow',
        showSeconds: true,
        rotation: 0 // CRITICAL: Clock widget needs 0 rotation for readability
      }
    };
    
    // REUSED: Widget creation logic for resume
    const resumeWidget = {
      type: 'resume',
      position: resumePosition,
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
    
    // REUSED: Widget creation logic for sticker introduction
    const stickerWidget = {
      type: 'sticker',
      position: stickerPosition,
      config: {
        title: 'Hi! My name is Ivan, I am Product Designer',
        content: 'Leading design and prototyping of data dashboard for clinical workers scheduling surgery blocks, resolving critical block time issues\n\nDesigning product flows for clinical workers in maternity health, translating complex healthcare workflows into intuitive experiences for 2,600+ care sites',
        size: 'large',
        theme: 'yellow'
      }
    };
    
    // CRITICAL: Cat sticker widget with blue gradient theme
    const catStickerWidget = {
      type: 'cat-sticker',
      position: catStickerPosition,
      config: {
        catName: 'Cat Here',
        description: 'You can interact my boy as you want. But do not punch him',
        showFeedButton: true,
        targetCat: null // Will be set when cat widget is added
      }
    };
    
    // CRITICAL: Telegram widget with channel information
    const telegramWidget = {
      type: 'telegram',
      position: telegramPosition,
      config: {
        channelName: 'ваня кнопочкин',
        channelType: 'Telegram Channel',
        channelAvatar: 'assets/images/telegram-avatar.jpg',
        postText: 'москва газ соревнования по счету в уме',
        viewCount: 43,
        timestamp: '0:58 Jan 27',
        channelUrl: 'https://t.me/example_channel'
      }
    };
    
    // REUSED: Widget creation logic for Projects folder (default theme)
    const projectsFolderWidget = {
      type: 'folder',
      position: projectsFolderPosition,
      config: {
        title: 'Projects',
        itemCount: 17,
        theme: 'default', // CRITICAL: Default theme uses regular SVGs
        projects: await this.getProjectData()
      }
    };
    
    // REUSED: Widget creation logic for Fun folder (pink theme)
    const funFolderWidget = {
      type: 'folder',
      position: funFolderPosition,
      config: {
        title: 'Fun',
        itemCount: 12, // UPDATED COMMENTS: 12 items as requested
        theme: 'pink', // CRITICAL: Pink theme uses pink SVGs
        projects: await this.getFunProjectData()
      }
    };
    
    // Create all seven widgets
    this.createWidget(clockWidget.type, clockWidget.position, clockWidget.config);
    this.createWidget(resumeWidget.type, resumeWidget.position, resumeWidget.config);
    this.createWidget(stickerWidget.type, stickerWidget.position, stickerWidget.config);
    this.createWidget(catStickerWidget.type, catStickerWidget.position, catStickerWidget.config);
    this.createWidget(telegramWidget.type, telegramWidget.position, telegramWidget.config);
    this.createWidget(projectsFolderWidget.type, projectsFolderWidget.position, projectsFolderWidget.config);
    this.createWidget(funFolderWidget.type, funFolderWidget.position, funFolderWidget.config);
    
    // Store remaining planned widgets for future incremental addition
    this.plannedWidgets = [
      {
        type: 'cat',
        position: { x: window.innerWidth * 0.3, y: window.innerHeight * 0.4 },
        config: { name: 'Pixel' }
      },
      {
        type: 'feed-button',
        position: { x: window.innerWidth * 0.25, y: window.innerHeight * 0.6 },
        config: { targetCat: 'cat' }
      }
    ];
    
    // SCALED FOR: Clean incremental widget development
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
   * UPDATED COMMENTS: Create wrapper + inner structure for clean interactions
   * SCALED FOR: Separation of positioning and visual effects
   */
  createWidget(type, position = null, config = {}) {
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
    const finalPosition = position || this.findAvailablePosition();
    
    // UPDATED COMMENTS: Wrapper handles positioning only
    wrapperElement.className = 'widget-wrapper';
    wrapperElement.style.position = 'absolute';
    // CRITICAL: Don't set transform here - SimpleDragHover will handle it
    wrapperElement.style.transformOrigin = 'top left'; // FIXED: Position from top-left corner
    wrapperElement.style.willChange = 'transform';
    wrapperElement.style.opacity = '0';
    wrapperElement.style.transition = 'opacity 0.3s ease-out';
    
    // CRITICAL: Set initial position data for WidgetBase
    wrapperElement.dataset.initialX = finalPosition.x;
    wrapperElement.dataset.initialY = finalPosition.y;
    
    // UPDATED COMMENTS: Inner element handles visual effects
    innerElement.className = 'widget-inner';
    wrapperElement.appendChild(innerElement);
    
    // REUSED: Widget creation with wrapper structure
    const widget = new WidgetClass(wrapperElement, {
      type,
      position: finalPosition,
      rotation: getWidgetRotation(type), // CRITICAL: Pass individual rotation from shared module
      eventBus: this.eventBus,
      assetManager: this.assetManager,
      canvasBounds: this.bounds,
      innerElement: innerElement,
      ...config
    });
    
    // CRITICAL: Update widget position after creation to ensure currentPosition is correct
    widget.currentPosition = { x: finalPosition.x, y: finalPosition.y };
    
    // SCALED FOR: DOM insertion after complete setup
    this.container.appendChild(wrapperElement);
    
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
   * SCALED FOR: Complete cleanup and memory management
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
    
    // Clear container
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
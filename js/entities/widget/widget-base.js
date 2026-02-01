/* ANCHOR: widget_base */
/* REUSED: Foundation class for all desktop widgets */
/* SCALED FOR: Simple direct positioning system */

import { ShadowSystem } from '../../shared/lib/shadow-system.js';
import { AnimationSystem } from '../../shared/lib/animation-system.js';
import { SimpleDragHover } from '../../shared/lib/simple-drag-hover.js';

/**
 * WidgetBase - Abstract base class for all desktop widgets
 * Uses simple direct positioning for reliable movement
 * 
 * @class WidgetBase
 */
export class WidgetBase {
  constructor(element, options = {}) {
    if (new.target === WidgetBase) {
      throw new Error('WidgetBase is abstract and cannot be instantiated directly');
    }
    
    this.element = element; // wrapper element
    this.innerElement = options.innerElement; // inner element for content
    this.id = options.id || this.generateId();
    this.type = options.type || 'widget';
    
    // CRITICAL: Track position in variables for accurate drag operations
    this.currentPosition = { x: 0, y: 0 };
    this.rotation = options.rotation || this.generateRandomTilt();
    this.scale = options.scale || 1;
    this.zIndex = options.zIndex || 1;
    
    // UPDATED COMMENTS: Simple positioning setup
    if (!this.element.style.position) {
      this.element.style.position = 'absolute';
    }
    
    // Interaction state
    this.state = {
      isHovered: false,
      isPressed: false,
      isDragging: false,
      isFocused: false,
      wasRecentlyDragged: false
    };
    
    // System references - SIMPLIFIED
    this.shadowSystem = options.shadowSystem || new ShadowSystem();
    this.animationSystem = options.animationSystem || new AnimationSystem();
    this.dragHover = new SimpleDragHover();
    this.eventBus = options.eventBus;
    
    // Configuration
    this.config = {
      isDraggable: options.draggable !== false,
      isClickable: options.clickable !== false,
      hasHoverEffects: options.hoverEffects !== false,
      hasShadows: options.shadows !== false,
      ...options.config
    };
    
    this.initialize();
  }

  /**
   * Initialize widget with base functionality
   * UPDATED COMMENTS: Simple initialization with new drag system
   */
  initialize() {
    try {
      this.setupElement();
      this.setupInteractions();
      this.setupEventListeners();
      
      // CRITICAL: Add initialized class to enable transitions after positioning
      setTimeout(() => {
        this.element.classList.add('widget--initialized');
      }, 50);
      
      // Emit initialization event
      if (this.eventBus) {
        this.eventBus.emit('widget:initialized', {
          widget: this,
          type: this.type,
          id: this.id
        });
      }
    } catch (error) {
      console.error(`Failed to initialize widget ${this.id}:`, error);
      throw error;
    }
  }

  /**
   * Setup base element properties and classes
   * REUSED: Common element setup for all widget types
   * UPDATED COMMENTS: Simple positioning setup
   */
  setupElement() {
    if (!this.element) {
      throw new Error('Widget element is required');
    }
    
    // Add base classes
    this.element.classList.add('widget', `widget--${this.type}`);
    
    // CRITICAL: Initialize element for JS animations
    this.element.style.position = 'absolute';
    this.element.style.willChange = 'transform';
    
    // Set initial transform directly
    const initialX = parseFloat(this.element.dataset.initialX) || 0;
    const initialY = parseFloat(this.element.dataset.initialY) || 0;
    
    // CRITICAL: Initialize position tracking
    this.currentPosition = { x: initialX, y: initialY };
    
    // UPDATED COMMENTS: SimpleDragHover will handle all transforms
    // Don't set initial transform here to avoid conflicts
    
    // Set other styles for performance
    Object.assign(this.element.style, {
      cursor: this.config.isDraggable ? 'grab' : 'default',
      willChange: 'transform',
      backfaceVisibility: 'hidden',
      transformStyle: 'preserve-3d',
      userSelect: 'none'
    });
    
    // Set data attributes for debugging
    this.element.dataset.widgetId = this.id;
    this.element.dataset.widgetType = this.type;
  }

  /**
   * Setup interaction handling
   * CRITICAL: Simple drag and hover with new system
   */
  setupInteractions() {
    // CRITICAL: Initialize simple drag and hover system
    if (this.dragHover) {
      this.dragHover.initWidget(this);
    }
  }

  /**
   * Setup event listeners for widget-specific events
   * UPDATED COMMENTS: Minimal event handling - hover managed by HoverSystem
   */
  setupEventListeners() {
    // CRITICAL: All interactions now handled by dedicated systems
    // HoverSystem handles mouse enter/leave
    // DragSystem handles mouse down/move/up
  }

  /**
   * Handle interaction start
   * UPDATED COMMENTS: Set pressed state and cursor for drag preparation
   */
  handleInteractionStart(data) {
    if (data.element !== this.element) return;
    
    this.state.isPressed = true;
    
    // Set grabbing cursor immediately on press
    if (this.config.isDraggable) {
      this.element.style.cursor = 'grabbing';
      this.element.classList.add('widget--pressed');
    }
  }

  /**
   * Handle interaction end
   * UPDATED COMMENTS: Reset cursor if drag didn't start
   */
  handleInteractionEnd(data) {
    if (data.element !== this.element) return;
    
    // CRITICAL: Reset cursor if not dragging
    if (!this.state.isDragging) {
      this.element.style.cursor = this.config.isDraggable ? 'grab' : 'default';
      this.state.isPressed = false;
    }
  }

  /**
   * Handle drag start
   * SCALED FOR: Visual effects during drag start
   */
  handleDragStart(data) {
    if (data.element !== this.element) return;
    
    this.state.isDragging = true;
    this.state.wasRecentlyDragged = false;
    
    // CRITICAL: Cancel any active animations before drag
    if (this.animationSystem) {
      this.animationSystem.cancelAnimation(this.element);
    }
    
    // CRITICAL: CSS classes and cursor
    this.element.classList.add('widget--dragging');
    this.element.style.cursor = 'grabbing';
    
    // UPDATED COMMENTS: Update visual effects for drag state
    this.updateVisualEffects();
    
    // Emit widget-specific drag start event
    if (this.eventBus) {
      this.eventBus.emit('widget:dragstart', {
        widget: this,
        position: this.getCurrentPosition()
      });
    }
  }

  /**
   * Handle drag move
   * CRITICAL: Positioning with preserved hover effects during drag
   */
  handleDragMove(data) {
    if (data.element !== this.element) return;
    
    // CRITICAL: Get current transform position, not getBoundingClientRect
    const currentTransform = this.element.style.transform;
    let currentX = 0;
    let currentY = 0;
    
    // Parse current transform if it exists
    if (currentTransform && currentTransform.includes('translate3d')) {
      const match = currentTransform.match(/translate3d\(([^,]+)px,\s*([^,]+)px/);
      if (match) {
        currentX = parseFloat(match[1]);
        currentY = parseFloat(match[2]);
      }
    }
    
    // UPDATED COMMENTS: Apply delta directly to current transform position
    const newX = currentX + data.deltaX;
    const newY = currentY + data.deltaY;
    
    // CRITICAL: During drag, use direct transform for immediate response
    const rotation = this.rotation + this.getHoverRotation();
    const scale = this.scale * this.getInteractionScale();
    
    this.element.style.transform = `translate3d(${newX}px, ${newY}px, 0) rotate(${rotation}deg) scale(${scale})`;
    
    // Emit move event for external listeners
    if (this.eventBus) {
      this.eventBus.emit('widget:dragmove', {
        widget: this,
        position: { x: newX, y: newY },
        delta: { x: data.deltaX, y: data.deltaY }
      });
    }
  }

  /**
   * Handle drag end
   * REUSED: Simple cleanup without physics complications
   */
  handleDragEnd(data) {
    if (data.element !== this.element) return;
    
    this.state.isDragging = false;
    this.state.isPressed = false;
    this.state.wasRecentlyDragged = true;
    
    // CRITICAL: Reset cursor and remove ALL drag/press classes
    this.element.style.cursor = this.config.isDraggable ? 'grab' : 'default';
    this.element.classList.remove('widget--dragging', 'widget--pressed');
    
    // UPDATED COMMENTS: Preserve hover effects after drag if mouse still over widget
    this.updateVisualEffects();
    
    // UPDATED COMMENTS: Reset inner element to base transform
    if (this.innerElement) {
      this.innerElement.style.transform = `rotate(${this.rotation}deg) scale(1)`;
    }
    
    // Clear recent drag state after delay
    setTimeout(() => {
      this.state.wasRecentlyDragged = false;
      // CRITICAL: Ensure no lingering interaction classes
      this.element.classList.remove('widget--dragging', 'widget--pressed');
    }, 800);
    
    // Emit drag end event
    if (this.eventBus) {
      this.eventBus.emit('widget:dragend', {
        widget: this,
        position: this.getCurrentPosition()
      });
    }
  }

  /**
   * Update visual effects (rotation, scale) while preserving position
   * CRITICAL: Simplified - now handled by HoverSystem
   */
  updateVisualEffects() {
    // CRITICAL: Visual effects now handled by HoverSystem
    // This method kept for backward compatibility
  }

  /**
   * Set widget position directly
   * UPDATED COMMENTS: Uses DragSystem for position management
   */
  setPosition(x, y, animate = true) {
    // CRITICAL: Use DragSystem for consistent position management
    if (this.dragSystem) {
      this.dragSystem.setWidgetPosition(this, x, y, animate);
    } else {
      // Fallback direct positioning
      this.currentPosition = { x, y };
      const rotation = this.rotation; // Base rotation only
      const scale = this.scale; // Base scale only
      this.element.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${scale})`;
    }
  }

  /**
   * Get current widget position
   * REUSED: Position retrieval from DragSystem
   */
  getCurrentPosition() {
    return this.dragSystem ? 
      this.dragSystem.getWidgetPosition(this) : 
      { ...this.currentPosition };
  }

  /**
   * Update widget transform for visual effects only
   * CRITICAL: Deprecated - now handled by HoverSystem and DragSystem
   */
  updateTransform() {
    // CRITICAL: This method is deprecated
    // Visual effects now handled by HoverSystem and DragSystem
  }

  /**
   * Get hover rotation offset
   * CRITICAL: Deprecated - now handled by HoverSystem
   */
  getHoverRotation() {
    // CRITICAL: This method is deprecated
    return 0;
  }

  /**
   * Get interaction scale multiplier
   * CRITICAL: Deprecated - now handled by HoverSystem
   */
  getInteractionScale() {
    // CRITICAL: This method is deprecated
    return 1;
  }

  /**
   * Generate random tilt for natural appearance
   * SCALED FOR: Subtle randomization for organic desktop feel
   * UPDATED COMMENTS: Clock widgets get 0 rotation, others get ±2 degrees
   */
  generateRandomTilt() {
    // CRITICAL: Clock widgets should have 0 rotation for readability
    if (this.type === 'clock') {
      return 0;
    }
    
    // REUSED: All other widgets get random tilt within 2 degrees
    return (Math.random() - 0.5) * 4; // ±2 degrees
  }

  /**
   * Generate unique widget ID
   * REUSED: ID generation utility
   */
  generateId() {
    return `widget_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Widget-specific click handler (override in subclasses)
   * UPDATED COMMENTS: Extensible click handling for custom widget behavior
   */
  onClick(data) {
    // Override in subclasses
  }

  /**
   * Widget-specific long press handler (override in subclasses)
   * REUSED: Extensible long press handling pattern
   */
  onLongPress(data) {
    // Override in subclasses
  }

  /**
   * Destroy widget and clean up resources
   * SCALED FOR: Comprehensive cleanup and memory management
   */
  destroy() {
    // Remove event listeners
    if (this.eventBus && this.eventHandlers) {
      Object.entries(this.eventHandlers).forEach(([event, handler]) => {
        this.eventBus.off(event, handler);
      });
    }
    
    // Destroy interaction handler
    if (this.interactionHandler) {
      this.interactionHandler.destroy();
    }
    
    // Cancel active animations
    if (this.animationSystem) {
      this.animationSystem.cancelAnimation(this.element);
    }
    
    // Remove element from DOM
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    // Emit destruction event
    if (this.eventBus) {
      this.eventBus.emit('widget:destroyed', {
        widget: this,
        id: this.id,
        type: this.type
      });
    }
  }

  /**
   * Get widget information for debugging
   * UPDATED COMMENTS: Simple widget state without physics complications
   */
  getInfo() {
    return {
      id: this.id,
      type: this.type,
      position: this.getCurrentPosition(),
      rotation: this.rotation,
      scale: this.scale,
      zIndex: this.zIndex,
      state: { ...this.state },
      config: { ...this.config }
    };
  }
}
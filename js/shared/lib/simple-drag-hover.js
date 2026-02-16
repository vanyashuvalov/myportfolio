/* ANCHOR: simple_drag_hover */
/* REUSED: Universal drag and hover system - offset-based approach */
/* SCALED FOR: Proven drag pattern from Kirupa tutorial */

/**
 * SimpleDragHover - Offset-based drag and hover system
 * Uses offset tracking pattern for reliable position management
 * Based on proven drag implementation from Kirupa.com
 * UPDATED COMMENTS: Added manual boundary offset correction
 * 
 * @class SimpleDragHover
 */
export class SimpleDragHover {
  constructor(options = {}) {
    // UPDATED COMMENTS: Offset-based drag state tracking
    this.active = false;
    this.dragWidget = null;
    
    // CRITICAL: Offset tracking variables for precise positioning
    this.currentX = 0;
    this.currentY = 0;
    this.initialX = 0;
    this.initialY = 0;
    this.xOffset = 0;
    this.yOffset = 0;
    
    // REUSABLE LOGIC: Configurable boundary offset
    // UPDATED COMMENTS: Small bevel offset creates elegant frame effect
    // Boundaries are slightly narrower than screen for visual appeal
    this.globalBoundaryOffset = options.boundaryOffset ?? -60; // Small bevel margin from all edges
    
    // CRITICAL: Bind global handlers once to avoid memory leaks
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);
    
    // CRITICAL: Track active listeners for proper cleanup
    this.activeListeners = new WeakMap();
  }

  /**
   * Initialize drag and hover for a widget
   * CRITICAL: Support both CSS and JS positioning modes with proper debugging and cleanup tracking
   */
  initWidget(widget) {
    if (!widget || !widget.element) {
      console.error('SimpleDragHover: Invalid widget or element');
      return;
    }
    
    const element = widget.element;
    
    // CRITICAL: Check if widget uses CSS positioning
    const usesCssPositioning = widget.config && widget.config.cssPositioning;
    
    if (usesCssPositioning) {
      // UPDATED COMMENTS: For CSS positioning, DON'T apply any transforms initially
      // Let CSS positioning work first, then we can drag from there
      this.xOffset = 0;
      this.yOffset = 0;
    } else {
      // UPDATED COMMENTS: For JS positioning, use dataset values
      const initialX = parseFloat(element.dataset.initialX) || 100;
      const initialY = parseFloat(element.dataset.initialY) || 100;
      
      this.xOffset = initialX;
      this.yOffset = initialY;
    }
    
    // CRITICAL: Hardware acceleration and smooth transform transitions
    element.style.willChange = 'transform';
    element.style.transformStyle = 'preserve-3d';
    element.style.backfaceVisibility = 'hidden';
    
    // UPDATED COMMENTS: CSS transitions for transforms only - shadows handled separately
    element.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // CRITICAL: Listen on container for reliable drag (Kirupa pattern)
    const container = element.parentElement || document.body;
    
    // CRITICAL: Create bound handlers for this specific widget
    const hoverStartHandler = () => this.handleHoverStart(widget);
    const hoverEndHandler = () => this.handleHoverEnd(widget);
    const mouseDownHandler = (e) => this.handleMouseDown(e, widget);
    
    // UPDATED COMMENTS: Direct mouse events for immediate response
    element.addEventListener('mouseenter', hoverStartHandler);
    element.addEventListener('mouseleave', hoverEndHandler);
    
    // CRITICAL: Container-based drag events for reliable tracking
    container.addEventListener('mousedown', mouseDownHandler);
    
    // CRITICAL: Store listener references for cleanup
    this.activeListeners.set(widget, {
      element,
      container,
      handlers: {
        hoverStart: hoverStartHandler,
        hoverEnd: hoverEndHandler,
        mouseDown: mouseDownHandler
      }
    });
    
    // Store references for cleanup
    widget._simpleDragHover = this;
    widget._dragContainer = container;
    
    // CRITICAL: Apply initial transform ONLY for JS positioning
    if (!usesCssPositioning) {
      this.setTranslate(this.xOffset, this.yOffset, element, widget.rotation, widget.scale);
    } else {
      // CRITICAL: For CSS positioning, don't apply any transform initially
    }
    
    // CRITICAL: Ensure widget is visible
    element.style.opacity = '1';
    element.style.display = 'block';
  }

  /**
   * Handle hover start - CSS transitions handle transforms and shadows
   * REUSED: CSS handles both transforms and shadows automatically
   */
  handleHoverStart(widget) {
    if (this.active) return; // Skip hover during drag
    
    widget.state.isHovered = true;
    widget.element.classList.add('widget--hovered');
    
    // CRITICAL: Check if widget uses CSS positioning
    const usesCssPositioning = widget.config && widget.config.cssPositioning;
    
    if (!usesCssPositioning) {
      // UPDATED COMMENTS: Only apply transforms for JS positioned widgets
      const hoverRotation = widget.rotation + 3;
      const hoverScale = widget.scale * 1.02;
      this.setTranslate(this.xOffset, this.yOffset, widget.element, hoverRotation, hoverScale);
    } else {
      // CRITICAL: For CSS positioned widgets, only apply rotation and scale effects
      const hoverRotation = widget.rotation + 3;
      const hoverScale = widget.scale * 1.02;
      widget.element.style.transform = `rotate(${hoverRotation}deg) scale(${hoverScale})`;
    }
  }

  /**
   * Handle hover end - CSS transitions handle transforms and shadows
   * SCALED FOR: Standard hover reset for all widgets
   */
  handleHoverEnd(widget) {
    if (this.active && this.dragWidget === widget) return; // Keep hover during drag
    
    widget.state.isHovered = false;
    widget.element.classList.remove('widget--hovered');
    
    // CRITICAL: Check if widget uses CSS positioning
    const usesCssPositioning = widget.config && widget.config.cssPositioning;
    
    if (!usesCssPositioning) {
      // UPDATED COMMENTS: Only apply transforms for JS positioned widgets
      this.setTranslate(this.xOffset, this.yOffset, widget.element, widget.rotation, widget.scale);
    } else {
      // CRITICAL: For CSS positioned widgets, reset to base rotation and scale only
      widget.element.style.transform = `rotate(${widget.rotation}deg) scale(${widget.scale})`;
    }
  }

  /**
   * Handle mouse down - initialize drag with offset calculation
   * UPDATED COMMENTS: Kirupa-style offset initialization with CSS positioning support
   */
  handleMouseDown(event, widget) {
    if (event.button !== 0) return; // Only left mouse button
    if (!widget.config.isDraggable) return;
    
    // CRITICAL: Check if click is on widget wrapper or its children (including inner content)
    const isWidgetClick = widget.element === event.target || widget.element.contains(event.target);
    if (!isWidgetClick) return;
    
    event.preventDefault();
    
    // CRITICAL: For CSS positioned widgets, get current computed position
    const usesCssPositioning = widget.config && widget.config.cssPositioning;
    if (usesCssPositioning) {
      const rect = widget.element.getBoundingClientRect();
      this.xOffset = rect.left;
      this.yOffset = rect.top;
    }
    
    // CRITICAL: Calculate initial position with offset (Kirupa pattern)
    this.initialX = event.clientX - this.xOffset;
    this.initialY = event.clientY - this.yOffset;
    
    // CRITICAL: Set drag state
    this.active = true;
    this.dragWidget = widget;
    
    // UPDATED COMMENTS: Visual feedback for drag start
    widget.state.isDragging = true;
    widget.element.style.cursor = 'grabbing';
    widget.element.classList.add('widget--dragging');
    widget.element.style.zIndex = widget.zIndex + 1000;
    
    // CRITICAL: Enable smooth transitions for dragging - transform only, not shadows
    widget.element.style.transition = 'transform 0.1s ease-out';
    
    // CRITICAL: Attach global mouse events to container
    const container = widget._dragContainer;
    container.addEventListener('mousemove', this.boundMouseMove);
    container.addEventListener('mouseup', this.boundMouseUp);
  }

  /**
   * Handle mouse move - update position with offset tracking
   * CRITICAL: Hardware-accelerated dragging with no boundaries
   */
  handleMouseMove(event) {
    if (!this.active || !this.dragWidget) return;
    
    event.preventDefault();
    
    const widget = this.dragWidget;
    
    // CRITICAL: Calculate current position using offset pattern
    let newX = event.clientX - this.initialX;
    let newY = event.clientY - this.initialY;
    
    // UPDATED COMMENTS: Round to prevent subpixel blurriness
    newX = Math.round(newX);
    newY = Math.round(newY);
    
    // CRITICAL: No boundary constraints - free movement
    this.currentX = newX;
    this.currentY = newY;
    this.xOffset = newX;
    this.yOffset = newY;
    
    // REUSED: Keep hover effects during drag
    const hoverRotation = widget.rotation + 3;
    const hoverScale = widget.scale * 1.02;
    
    // CRITICAL: Set transform using unconstrained position
    this.setTranslate(this.currentX, this.currentY, widget.element, hoverRotation, hoverScale);
  }

  /**
   * Handle mouse up - end drag with offset preservation
   * SCALED FOR: Clean drag end with optimized transitions for both positioning modes
   */
  handleMouseUp(event) {
    if (!this.active || !this.dragWidget) return;
    
    const widget = this.dragWidget;
    const container = widget._dragContainer;
    
    // CRITICAL: Remove global listeners
    container.removeEventListener('mousemove', this.boundMouseMove);
    container.removeEventListener('mouseup', this.boundMouseUp);
    
    // CRITICAL: Preserve position for next drag operation
    this.initialX = this.currentX;
    this.initialY = this.currentY;
    
    // UPDATED COMMENTS: Reset drag state
    this.active = false;
    widget.state.isDragging = false;
    
    // CRITICAL: Keep smooth transitions for post-drag animations
    widget.element.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // REUSED: Visual state cleanup
    widget.element.style.cursor = widget.config.isDraggable ? 'grab' : 'default';
    widget.element.classList.remove('widget--dragging');
    widget.element.style.zIndex = widget.zIndex;
    
    // CRITICAL: Check hover state after drag
    const elementUnderMouse = document.elementFromPoint(event.clientX, event.clientY);
    const isStillHovered = widget.element.contains(elementUnderMouse) || widget.element === elementUnderMouse;
    
    // UPDATED COMMENTS: Handle hover state for both positioning modes
    const usesCssPositioning = widget.config && widget.config.cssPositioning;
    
    if (isStillHovered) {
      // UPDATED COMMENTS: Maintain hover state - CSS handles both transforms and shadows
      widget.state.isHovered = true;
      widget.element.classList.add('widget--hovered');
      
      // CRITICAL: Apply hover effects with current position
      const hoverRotation = widget.rotation + 3;
      const hoverScale = widget.scale * 1.02;
      this.setTranslate(this.xOffset, this.yOffset, widget.element, hoverRotation, hoverScale);
    } else {
      // CRITICAL: Reset to normal state with current position
      widget.state.isHovered = false;
      widget.element.classList.remove('widget--hovered');
      this.setTranslate(this.xOffset, this.yOffset, widget.element, widget.rotation, widget.scale);
    }
    
    // CRITICAL: Clear drag widget reference
    this.dragWidget = null;
  }

  /**
   * REUSABLE LOGIC: Get actual widget dimensions for boundary calculation
   * UPDATED COMMENTS: Multiple measurement methods for accurate sizing
   * 
   * @param {HTMLElement} element - Widget element to measure
   * @returns {Object} Widget dimensions {width, height}
   */
  getWidgetDimensions(element) {
    // CRITICAL: Try multiple measurement methods
    const rect = element.getBoundingClientRect();
    const offset = { width: element.offsetWidth, height: element.offsetHeight };
    const client = { width: element.clientWidth, height: element.clientHeight };
    
    // SCALED FOR: Account for scale transforms
    const computedStyle = window.getComputedStyle(element);
    const transform = computedStyle.transform;
    
    let scaleX = 1, scaleY = 1;
    if (transform && transform !== 'none') {
      const matrix = new DOMMatrix(transform);
      scaleX = Math.abs(matrix.a);
      scaleY = Math.abs(matrix.d);
    }
    
    // UPDATED COMMENTS: Use the most reliable measurement
    // getBoundingClientRect accounts for all transforms and positioning
    const actualWidth = rect.width;
    const actualHeight = rect.height;
    
    return { width: actualWidth, height: actualHeight };
  }

  /**
   * REUSABLE LOGIC: Constrain widget position to screen boundaries
   * Prevents widgets from being dragged outside viewport edges
   * UPDATED COMMENTS: FIXED - Properly shrinks draggable area with global offset
   * 
   * @param {number} x - Desired X position (top-left corner)
   * @param {number} y - Desired Y position (top-left corner)
   * @param {HTMLElement} element - Widget element to constrain
   * @returns {Object} Constrained position {x, y}
   */
  constrainToScreenBounds(x, y, element) {
    // CRITICAL: Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // UPDATED COMMENTS: Get actual widget dimensions
    const dimensions = this.getWidgetDimensions(element);
    
    // CRITICAL: FIXED COORDINATES - Shrink draggable area by offset from all sides
    const minX = this.globalBoundaryOffset;  // Left boundary moves RIGHT by offset
    const minY = this.globalBoundaryOffset;  // Top boundary moves DOWN by offset
    const maxX = viewportWidth - this.globalBoundaryOffset - dimensions.width;   // Right boundary moves LEFT by offset + widget width
    const maxY = viewportHeight - this.globalBoundaryOffset - dimensions.height; // Bottom boundary moves UP by offset + widget height
    
    // CRITICAL: Constrain position to boundaries
    const constrainedX = Math.max(minX, Math.min(maxX, x));
    const constrainedY = Math.max(minY, Math.min(maxY, y));
    
    // REUSABLE LOGIC: Boundary verification
    
    return { x: constrainedX, y: constrainedY };
  }

  /**
   * REUSABLE LOGIC: Set element transform with position and effects
   * Hardware-accelerated transform with subpixel precision
   * 
   * @param {number} xPos - X position
   * @param {number} yPos - Y position  
   * @param {HTMLElement} element - Element to transform
   * @param {number} rotation - Rotation in degrees
   * @param {number} scale - Scale factor
   */
  setTranslate(xPos, yPos, element, rotation = 0, scale = 1) {
    // CRITICAL: Round positions to prevent subpixel blurriness
    const roundedX = Math.round(xPos);
    const roundedY = Math.round(yPos);
    
    // UPDATED COMMENTS: Hardware-accelerated transform with translateZ(0)
    element.style.transform = `translate3d(${roundedX}px, ${roundedY}px, 0) rotate(${rotation}deg) scale(${scale})`;
  }

  /**
   * Destroy drag hover system for widget
   * UPDATED COMMENTS: Comprehensive cleanup with listener tracking to prevent memory leaks
   */
  destroyWidget(widget) {
    if (this.dragWidget === widget) {
      this.handleMouseUp();
    }
    
    // CRITICAL: Clean up tracked listeners
    const listenerData = this.activeListeners.get(widget);
    if (listenerData) {
      const { element, container, handlers } = listenerData;
      
      // Remove element listeners
      element.removeEventListener('mouseenter', handlers.hoverStart);
      element.removeEventListener('mouseleave', handlers.hoverEnd);
      
      // Remove container listeners
      container.removeEventListener('mousedown', handlers.mouseDown);
      container.removeEventListener('mousemove', this.boundMouseMove);
      container.removeEventListener('mouseup', this.boundMouseUp);
      
      // Remove from tracking
      this.activeListeners.delete(widget);
    }
    
    // Clean up legacy references
    if (widget._dragContainer) {
      widget._dragContainer.removeEventListener('mousemove', this.boundMouseMove);
      widget._dragContainer.removeEventListener('mouseup', this.boundMouseUp);
    }
    
    delete widget._simpleDragHover;
    delete widget._dragContainer;
  }
}
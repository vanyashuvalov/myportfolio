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
  constructor() {
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
    
    // REUSABLE LOGIC: Global boundary offset configuration
    // UPDATED COMMENTS: Small bevel offset creates elegant frame effect
    // Boundaries are slightly narrower than screen for visual appeal
    this.globalBoundaryOffset = -60; // Small bevel margin from all edges
    
    // CRITICAL: Bind global handlers once to avoid memory leaks
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);
  }

  /**
   * Initialize drag and hover for a widget
   * CRITICAL: Pure JS animations without CSS transitions
   */
  initWidget(widget) {
    if (!widget || !widget.element) {
      console.error('SimpleDragHover: Invalid widget or element');
      return;
    }
    
    const element = widget.element;
    
    // CRITICAL: Initialize offset with widget's current position, constrained to bounds
    const initialX = parseFloat(element.dataset.initialX) || 100;
    const initialY = parseFloat(element.dataset.initialY) || 100;
    
    // UPDATED COMMENTS: Apply boundary constraints to initial position
    const constrainedPosition = this.constrainToScreenBounds(initialX, initialY, element);
    this.xOffset = constrainedPosition.x;
    this.yOffset = constrainedPosition.y;
    
    // CRITICAL: Hardware acceleration and smooth transform transitions
    element.style.willChange = 'transform';
    element.style.transformStyle = 'preserve-3d';
    element.style.backfaceVisibility = 'hidden';
    
    // UPDATED COMMENTS: CSS transitions for transforms only - shadows handled separately
    element.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // CRITICAL: Listen on container for reliable drag (Kirupa pattern)
    const container = element.parentElement || document.body;
    
    // UPDATED COMMENTS: Direct mouse events for immediate response
    element.addEventListener('mouseenter', () => this.handleHoverStart(widget));
    element.addEventListener('mouseleave', () => this.handleHoverEnd(widget));
    
    // CRITICAL: Container-based drag events for reliable tracking
    container.addEventListener('mousedown', (e) => this.handleMouseDown(e, widget));
    
    // Store references for cleanup
    widget._simpleDragHover = this;
    widget._dragContainer = container;
    
    // CRITICAL: Apply initial transform with current offset
    this.setTranslate(this.xOffset, this.yOffset, element, widget.rotation, widget.scale);
    
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
    
    // CRITICAL: CSS handles both transform and shadow transitions automatically
    const hoverRotation = widget.rotation + 3;
    const hoverScale = widget.scale * 1.02;
    
    // UPDATED COMMENTS: Direct CSS transform - CSS transition handles animation
    this.setTranslate(this.xOffset, this.yOffset, widget.element, hoverRotation, hoverScale);
  }

  /**
   * Handle hover end - CSS transitions handle transforms and shadows
   * SCALED FOR: Standard hover reset for all widgets
   */
  handleHoverEnd(widget) {
    if (this.active && this.dragWidget === widget) return; // Keep hover during drag
    
    widget.state.isHovered = false;
    widget.element.classList.remove('widget--hovered');
    
    // CRITICAL: Direct CSS transform - CSS transition handles animation back to base state
    this.setTranslate(this.xOffset, this.yOffset, widget.element, widget.rotation, widget.scale);
  }

  /**
   * Handle mouse down - initialize drag with offset calculation
   * UPDATED COMMENTS: Kirupa-style offset initialization
   */
  handleMouseDown(event, widget) {
    if (event.button !== 0) return; // Only left mouse button
    if (!widget.config.isDraggable) return;
    
    // CRITICAL: Check if click is on widget wrapper or its children (including inner content)
    const isWidgetClick = widget.element === event.target || widget.element.contains(event.target);
    if (!isWidgetClick) return;
    
    console.log('DRAG START - Widget clicked!', widget.id); // DEBUG
    
    event.preventDefault();
    
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
    
    console.log('DRAG INITIALIZED'); // DEBUG
  }

  /**
   * Handle mouse move - update position with offset tracking
   * CRITICAL: Hardware-accelerated dragging with subpixel precision
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
    
    // UPDATED COMMENTS: Apply screen boundaries constraint
    const constrainedPosition = this.constrainToScreenBounds(newX, newY, widget.element);
    this.currentX = constrainedPosition.x;
    this.currentY = constrainedPosition.y;
    
    // UPDATED COMMENTS: Update offset for next operation
    this.xOffset = this.currentX;
    this.yOffset = this.currentY;
    
    // REUSED: Keep hover effects during drag
    const hoverRotation = widget.rotation + 3;
    const hoverScale = widget.scale * 1.02;
    
    // CRITICAL: Set transform using constrained position
    this.setTranslate(this.currentX, this.currentY, widget.element, hoverRotation, hoverScale);
  }

  /**
   * Handle mouse up - end drag with offset preservation
   * SCALED FOR: Clean drag end with optimized transitions
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
    
    if (isStillHovered) {
      // UPDATED COMMENTS: Maintain hover state - CSS handles both transforms and shadows
      widget.state.isHovered = true;
      widget.element.classList.add('widget--hovered');
      
      // CRITICAL: Direct CSS transform - CSS transition handles animation
      const hoverRotation = widget.rotation + 3;
      const hoverScale = widget.scale * 1.02;
      this.setTranslate(this.xOffset, this.yOffset, widget.element, hoverRotation, hoverScale);
    } else {
      // CRITICAL: Direct CSS transform back to normal state
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
    
    console.log('WIDGET DIMENSIONS:', {
      element: element.className,
      measurements: {
        boundingRect: { width: rect.width, height: rect.height },
        offset: offset,
        client: client
      },
      transform: { scaleX, scaleY },
      final: { width: actualWidth, height: actualHeight }
    });
    
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
    
    // REUSABLE LOGIC: Debug output for boundary verification
    console.log('CORRECTED BOUNDARY CALCULATION:', {
      input: { x, y },
      output: { x: constrainedX, y: constrainedY },
      viewport: { width: viewportWidth, height: viewportHeight },
      widget: dimensions,
      globalOffset: this.globalBoundaryOffset,
      boundaries: { minX, maxX, minY, maxY },
      availableArea: {
        width: maxX - minX,
        height: maxY - minY
      },
      constrained: constrainedX !== x || constrainedY !== y
    });
    
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
   * UPDATED COMMENTS: Proper cleanup and memory management
   */
  destroyWidget(widget) {
    if (this.dragWidget === widget) {
      this.handleMouseUp();
    }
    
    // Clean up container listeners
    if (widget._dragContainer) {
      widget._dragContainer.removeEventListener('mousemove', this.boundMouseMove);
      widget._dragContainer.removeEventListener('mouseup', this.boundMouseUp);
    }
    
    delete widget._simpleDragHover;
    delete widget._dragContainer;
  }
}
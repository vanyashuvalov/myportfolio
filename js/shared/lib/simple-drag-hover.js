/* ANCHOR: simple_drag_hover */
/* REUSED: Universal drag and hover system - simple and reliable */
/* SCALED FOR: Direct mouse events without complex state management */

/**
 * SimpleDragHover - Minimal drag and hover system
 * No bullshit, just works. Direct mouse events for reliable dragging.
 * 
 * @class SimpleDragHover
 */
export class SimpleDragHover {
  constructor() {
    // UPDATED COMMENTS: Minimal state tracking for active drag
    this.isDragging = false;
    this.dragWidget = null;
    this.startPos = { x: 0, y: 0 };
    this.startWidgetPos = { x: 0, y: 0 };
    
    // CRITICAL: Viewport padding to keep widgets away from screen edges
    this.viewportPadding = 20; // pixels
    
    // SCALED FOR: Boundary offset to shift drag area (negative = left/up, positive = right/down)
    this.boundaryOffset = { x: -30, y: -30 }; // shift left 30px, up 30px
    
    // CRITICAL: Bind global handlers once to avoid memory leaks
    this.boundMouseMove = this.handleGlobalMouseMove.bind(this);
    this.boundMouseUp = this.handleGlobalMouseUp.bind(this);
  }

  /**
   * Initialize drag and hover for a widget
   * CRITICAL: Simple direct event attachment with smooth transitions
   */
  initWidget(widget) {
    if (!widget || !widget.element) return;
    
    const element = widget.element;
    
    // UPDATED COMMENTS: Add smooth transition for hover effects
    element.style.transition = 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)';
    
    // UPDATED COMMENTS: Direct mouse events for immediate response
    element.addEventListener('mouseenter', () => this.handleHoverStart(widget));
    element.addEventListener('mouseleave', () => this.handleHoverEnd(widget));
    element.addEventListener('mousedown', (e) => this.handleMouseDown(e, widget));
    
    // Store reference for cleanup
    widget._simpleDragHover = this;
  }

  /**
   * Handle hover start - simple scale and rotation
   * REUSED: Basic hover effects without animation conflicts
   */
  handleHoverStart(widget) {
    if (this.isDragging) return; // Skip hover during drag
    
    widget.state.isHovered = true;
    
    // CRITICAL: Direct transform update for immediate response
    const pos = widget.currentPosition;
    const hoverRotation = widget.rotation + 3;
    const hoverScale = widget.scale * 1.02;
    
    widget.element.style.transform = 
      `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${hoverRotation}deg) scale(${hoverScale})`;
    
    // UPDATED COMMENTS: Add hover class for CSS effects
    widget.element.classList.add('widget--hovered');
  }

  /**
   * Handle hover end - return to normal state
   * SCALED FOR: Smooth transition back to base state
   */
  handleHoverEnd(widget) {
    if (this.isDragging && this.dragWidget === widget) return; // Keep hover during drag
    
    widget.state.isHovered = false;
    
    // CRITICAL: Return to base transform
    const pos = widget.currentPosition;
    widget.element.style.transform = 
      `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${widget.rotation}deg) scale(${widget.scale})`;
    
    widget.element.classList.remove('widget--hovered');
  }

  /**
   * Handle mouse down - start potential drag
   * UPDATED COMMENTS: Simple drag initiation with transition disabled during drag
   */
  handleMouseDown(event, widget) {
    if (event.button !== 0) return; // Only left mouse button
    if (!widget.config.isDraggable) return;
    
    event.preventDefault();
    
    // CRITICAL: Disable transitions during drag for immediate response
    widget.element.style.transition = 'none';
    
    // CRITICAL: Store drag start state
    this.isDragging = true;
    this.dragWidget = widget;
    this.startPos = { x: event.clientX, y: event.clientY };
    this.startWidgetPos = { x: widget.currentPosition.x, y: widget.currentPosition.y };
    
    // UPDATED COMMENTS: Visual feedback for drag start
    widget.state.isDragging = true;
    widget.element.style.cursor = 'grabbing';
    widget.element.classList.add('widget--dragging');
    widget.element.style.zIndex = widget.zIndex + 1000;
    
    // CRITICAL: Attach global mouse events
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
  }

  /**
   * Handle global mouse move - update drag position with boundary constraints
   * CRITICAL: Direct position calculation with viewport boundary enforcement
   */
  handleGlobalMouseMove(event) {
    if (!this.isDragging || !this.dragWidget) return;
    
    const widget = this.dragWidget;
    
    // UPDATED COMMENTS: Calculate new position from drag delta
    const deltaX = event.clientX - this.startPos.x;
    const deltaY = event.clientY - this.startPos.y;
    
    const newX = this.startWidgetPos.x + deltaX;
    const newY = this.startWidgetPos.y + deltaY;
    
    // CRITICAL: Get widget dimensions for boundary calculation
    const rect = widget.element.getBoundingClientRect();
    const widgetWidth = rect.width;
    const widgetHeight = rect.height;
    
    // SCALED FOR: Viewport boundary constraints with padding and offset adjustment
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = this.viewportPadding;
    const offsetX = this.boundaryOffset.x;
    const offsetY = this.boundaryOffset.y;
    
    const constrainedX = Math.max(padding + offsetX, Math.min(viewportWidth - widgetWidth - padding + offsetX, newX));
    const constrainedY = Math.max(padding + offsetY, Math.min(viewportHeight - widgetHeight - padding + offsetY, newY));
    
    // CRITICAL: Update widget position with constraints
    widget.currentPosition = { x: constrainedX, y: constrainedY };
    
    // REUSED: Keep hover effects during drag - scale and rotation
    const hoverRotation = widget.rotation + 3;
    const hoverScale = widget.scale * 1.02;
    
    widget.element.style.transform = 
      `translate3d(${constrainedX}px, ${constrainedY}px, 0) rotate(${hoverRotation}deg) scale(${hoverScale})`;
  }

  /**
   * Handle global mouse up - end drag
   * SCALED FOR: Clean drag end with hover state preserved and transitions restored
   */
  handleGlobalMouseUp(event) {
    if (!this.isDragging || !this.dragWidget) return;
    
    const widget = this.dragWidget;
    
    // CRITICAL: Remove global listeners
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
    
    // UPDATED COMMENTS: Restore smooth transitions after drag
    widget.element.style.transition = 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)';
    
    // UPDATED COMMENTS: Reset drag state
    this.isDragging = false;
    widget.state.isDragging = false;
    
    // REUSED: Visual state cleanup
    widget.element.style.cursor = widget.config.isDraggable ? 'grab' : 'default';
    widget.element.classList.remove('widget--dragging');
    widget.element.style.zIndex = widget.zIndex;
    
    // CRITICAL: Keep hover effects if mouse is still over widget
    // Check if mouse is still over the widget element
    const elementUnderMouse = document.elementFromPoint(event.clientX, event.clientY);
    const isStillHovered = widget.element.contains(elementUnderMouse) || widget.element === elementUnderMouse;
    
    if (isStillHovered) {
      // UPDATED COMMENTS: Maintain hover state and effects
      widget.state.isHovered = true;
      widget.element.classList.add('widget--hovered');
      
      // Keep hover transform with smooth transition
      const pos = widget.currentPosition;
      const hoverRotation = widget.rotation + 3;
      const hoverScale = widget.scale * 1.02;
      
      widget.element.style.transform = 
        `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${hoverRotation}deg) scale(${hoverScale})`;
    } else {
      // CRITICAL: Return to normal state if mouse not over widget
      widget.state.isHovered = false;
      widget.element.classList.remove('widget--hovered');
      
      const pos = widget.currentPosition;
      widget.element.style.transform = 
        `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${widget.rotation}deg) scale(${widget.scale})`;
    }
    
    // CRITICAL: Clear drag widget reference
    this.dragWidget = null;
  }

  /**
   * Destroy drag hover system for widget
   * UPDATED COMMENTS: Proper cleanup and memory management
   */
  destroyWidget(widget) {
    if (this.dragWidget === widget) {
      this.handleGlobalMouseUp();
    }
    
    delete widget._simpleDragHover;
  }
}
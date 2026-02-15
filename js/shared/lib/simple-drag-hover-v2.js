/* ANCHOR: simple_drag_hover_v2 */
/* REUSED: Simplified drag system - CSS-FIRST approach */
/* SCALED FOR: All widgets use CSS positioning, JS only for drag */
/* // UPDATED COMMENTS: Complete rewrite for simplicity and maintainability */

/**
 * @typedef {Object} DragOptions
 * @property {number} [boundaryOffset] - Boundary offset in pixels (defaults to CSS variable --drag-boundary-offset)
 */

/**
 * SimpleDragHover - CSS-FIRST drag and hover system
 * All widgets positioned via CSS, JS handles only drag interactions
 * 
 * @class SimpleDragHover
 */
export class SimpleDragHover {
  /**
   * @param {DragOptions} options - Configuration options
   */
  constructor(options = {}) {
    // CRITICAL: Drag state tracking
    this.active = false;
    this.dragWidget = null;
    
    // CRITICAL: Offset tracking for drag operations
    this.currentX = 0;
    this.currentY = 0;
    this.initialX = 0;
    this.initialY = 0;
    this.xOffset = 0;
    this.yOffset = 0;
    
    // REUSABLE LOGIC: Configurable boundary offset from CSS variable
    // UPDATED COMMENTS: Now reads from CSS variable --drag-boundary-offset with fallback
    this.globalBoundaryOffset = options.boundaryOffset ?? this.getBoundaryOffsetFromCSS();
    
    // CRITICAL: Bind global handlers once
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);
    
    // CRITICAL: Track active listeners for cleanup
    this.activeListeners = new WeakMap();
  }

  /**
   * Get boundary offset from CSS variable
   * REUSED: CSS variable integration for consistent configuration
   * 
   * @returns {number} Boundary offset in pixels
   */
  getBoundaryOffsetFromCSS() {
    const cssValue = getComputedStyle(document.documentElement)
      .getPropertyValue('--drag-boundary-offset')
      .trim();
    
    if (cssValue) {
      const numericValue = parseInt(cssValue, 10);
      if (!isNaN(numericValue)) {
        return numericValue;
      }
    }
    
    // CRITICAL: Fallback if CSS variable not found
    return -60;
  }

  /**
   * Initialize drag and hover for a widget
   * // UPDATED COMMENTS: Simplified - assumes CSS positioning for all widgets
   * 
   * @param {Object} widget - Widget instance
   */
  initWidget(widget) {
    if (!widget || !widget.element) {
      console.error('SimpleDragHover: Invalid widget or element');
      return;
    }
    
    const element = widget.element;
    
    // CRITICAL: Get current CSS position as starting point for drag
    const rect = element.getBoundingClientRect();
    this.xOffset = rect.left;
    this.yOffset = rect.top;
    
    // CRITICAL: Hardware acceleration
    element.style.willChange = 'transform';
    element.style.transformStyle = 'preserve-3d';
    element.style.backfaceVisibility = 'hidden';
    element.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // CRITICAL: Event listeners
    const container = element.parentElement || document.body;
    
    const hoverStartHandler = () => this.handleHoverStart(widget);
    const hoverEndHandler = () => this.handleHoverEnd(widget);
    const mouseDownHandler = (e) => this.handleMouseDown(e, widget);
    
    element.addEventListener('mouseenter', hoverStartHandler);
    element.addEventListener('mouseleave', hoverEndHandler);
    container.addEventListener('mousedown', mouseDownHandler);
    
    // CRITICAL: Store for cleanup
    this.activeListeners.set(widget, {
      element,
      container,
      handlers: { hoverStart: hoverStartHandler, hoverEnd: hoverEndHandler, mouseDown: mouseDownHandler }
    });
    
    widget._simpleDragHover = this;
    widget._dragContainer = container;
    
    // CRITICAL: Widget visible
    element.style.opacity = '1';
    element.style.display = 'block';
  }

  /**
   * Handle hover start
   * // REUSED: CSS handles visual effects
   */
  handleHoverStart(widget) {
    if (this.active) return;
    
    widget.state.isHovered = true;
    widget.element.classList.add('widget--hovered');
    
    // UPDATED: Apply hover transform
    const hoverRotation = widget.rotation + 3;
    const hoverScale = widget.scale * 1.02;
    widget.element.style.transform = `rotate(${hoverRotation}deg) scale(${hoverScale})`;
  }

  /**
   * Handle hover end
   * // REUSED: Reset to base state
   */
  handleHoverEnd(widget) {
    if (this.active && this.dragWidget === widget) return;
    
    widget.state.isHovered = false;
    widget.element.classList.remove('widget--hovered');
    
    // UPDATED: Reset transform
    widget.element.style.transform = `rotate(${widget.rotation}deg) scale(${widget.scale})`;
  }

  /**
   * Handle mouse down - start drag
   * // UPDATED COMMENTS: Simplified drag initialization
   * 
   * @param {MouseEvent} event
   * @param {Object} widget
   */
  handleMouseDown(event, widget) {
    if (event.button !== 0) return;
    if (!widget.config.isDraggable) return;
    
    const isWidgetClick = widget.element === event.target || widget.element.contains(event.target);
    if (!isWidgetClick) return;
    
    event.preventDefault();
    
    // CRITICAL: Get current position from CSS
    const rect = widget.element.getBoundingClientRect();
    this.xOffset = rect.left;
    this.yOffset = rect.top;
    
    // CRITICAL: Calculate offset
    this.initialX = event.clientX - this.xOffset;
    this.initialY = event.clientY - this.yOffset;
    
    // CRITICAL: Set drag state
    this.active = true;
    this.dragWidget = widget;
    
    widget.state.isDragging = true;
    widget.element.style.cursor = 'grabbing';
    widget.element.classList.add('widget--dragging');
    widget.element.style.zIndex = widget.zIndex + 1000;
    widget.element.style.transition = 'transform 0.1s ease-out';
    
    // CRITICAL: Attach global listeners
    const container = widget._dragContainer;
    container.addEventListener('mousemove', this.boundMouseMove);
    container.addEventListener('mouseup', this.boundMouseUp);
  }

  /**
   * Handle mouse move - update position
   * // CRITICAL: Hardware-accelerated dragging
   * 
   * @param {MouseEvent} event
   */
  handleMouseMove(event) {
    if (!this.active || !this.dragWidget) return;
    
    event.preventDefault();
    
    const widget = this.dragWidget;
    
    // CRITICAL: Calculate new position
    let newX = event.clientX - this.initialX;
    let newY = event.clientY - this.initialY;
    
    // UPDATED: Round to prevent blur
    newX = Math.round(newX);
    newY = Math.round(newY);
    
    this.currentX = newX;
    this.currentY = newY;
    this.xOffset = newX;
    this.yOffset = newY;
    
    // REUSED: Keep hover effects during drag
    const hoverRotation = widget.rotation + 3;
    const hoverScale = widget.scale * 1.02;
    
    // CRITICAL: Apply transform
    this.setTranslate(this.currentX, this.currentY, widget.element, hoverRotation, hoverScale);
  }

  /**
   * Handle mouse up - end drag
   * // SCALED FOR: Clean drag end with state management
   * 
   * @param {MouseEvent} event
   */
  handleMouseUp(event) {
    if (!this.active || !this.dragWidget) return;
    
    const widget = this.dragWidget;
    const container = widget._dragContainer;
    
    // CRITICAL: Remove global listeners
    container.removeEventListener('mousemove', this.boundMouseMove);
    container.removeEventListener('mouseup', this.boundMouseUp);
    
    // CRITICAL: Preserve position
    this.initialX = this.currentX;
    this.initialY = this.currentY;
    
    // UPDATED: Reset drag state
    this.active = false;
    widget.state.isDragging = false;
    
    widget.element.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
    widget.element.style.cursor = widget.config.isDraggable ? 'grab' : 'default';
    widget.element.classList.remove('widget--dragging');
    widget.element.style.zIndex = widget.zIndex;
    
    // CRITICAL: Check hover state
    const elementUnderMouse = document.elementFromPoint(event.clientX, event.clientY);
    const isStillHovered = widget.element.contains(elementUnderMouse) || widget.element === elementUnderMouse;
    
    if (isStillHovered) {
      widget.state.isHovered = true;
      widget.element.classList.add('widget--hovered');
      
      const hoverRotation = widget.rotation + 3;
      const hoverScale = widget.scale * 1.02;
      this.setTranslate(this.xOffset, this.yOffset, widget.element, hoverRotation, hoverScale);
    } else {
      widget.state.isHovered = false;
      widget.element.classList.remove('widget--hovered');
      this.setTranslate(this.xOffset, this.yOffset, widget.element, widget.rotation, widget.scale);
    }
    
    this.dragWidget = null;
  }

  /**
   * Set element transform
   * // REUSABLE LOGIC: Hardware-accelerated transform
   * 
   * @param {number} xPos - X position
   * @param {number} yPos - Y position
   * @param {HTMLElement} element - Element to transform
   * @param {number} rotation - Rotation in degrees
   * @param {number} scale - Scale factor
   */
  setTranslate(xPos, yPos, element, rotation = 0, scale = 1) {
    const roundedX = Math.round(xPos);
    const roundedY = Math.round(yPos);
    
    element.style.transform = `translate3d(${roundedX}px, ${roundedY}px, 0) rotate(${rotation}deg) scale(${scale})`;
  }

  /**
   * Destroy drag hover system
   * // UPDATED COMMENTS: Comprehensive cleanup
   * 
   * @param {Object} widget - Widget to cleanup
   */
  destroyWidget(widget) {
    if (this.dragWidget === widget) {
      this.handleMouseUp();
    }
    
    const listenerData = this.activeListeners.get(widget);
    if (listenerData) {
      const { element, container, handlers } = listenerData;
      
      element.removeEventListener('mouseenter', handlers.hoverStart);
      element.removeEventListener('mouseleave', handlers.hoverEnd);
      container.removeEventListener('mousedown', handlers.mouseDown);
      container.removeEventListener('mousemove', this.boundMouseMove);
      container.removeEventListener('mouseup', this.boundMouseUp);
      
      this.activeListeners.delete(widget);
    }
    
    if (widget._dragContainer) {
      widget._dragContainer.removeEventListener('mousemove', this.boundMouseMove);
      widget._dragContainer.removeEventListener('mouseup', this.boundMouseUp);
    }
    
    delete widget._simpleDragHover;
    delete widget._dragContainer;
  }
}

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
    
    // CRITICAL: Bind global handlers once (mouse and touch)
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);
    this.boundTouchMove = this.handleTouchMove.bind(this);
    this.boundTouchEnd = this.handleTouchEnd.bind(this);
    
    // SCALED FOR: Touch gesture tracking
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchMoveThreshold = 10; // pixels
    this.isTouchDragging = false;
    
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
   * // SCALED FOR: Touch and mouse event handling for mobile compatibility
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
    
    // CRITICAL: Event listeners (mouse and touch)
    const container = element.parentElement || document.body;
    
    const hoverStartHandler = () => this.handleHoverStart(widget);
    const hoverEndHandler = () => this.handleHoverEnd(widget);
    const mouseDownHandler = (e) => this.handleMouseDown(e, widget);
    const touchStartHandler = (e) => this.handleTouchStart(e, widget);
    
    // UPDATED COMMENTS: Mouse events for desktop
    element.addEventListener('mouseenter', hoverStartHandler);
    element.addEventListener('mouseleave', hoverEndHandler);
    container.addEventListener('mousedown', mouseDownHandler);
    
    // SCALED FOR: Touch events for mobile
    container.addEventListener('touchstart', touchStartHandler, { passive: false });
    
    // CRITICAL: Store for cleanup
    this.activeListeners.set(widget, {
      element,
      container,
      handlers: { 
        hoverStart: hoverStartHandler, 
        hoverEnd: hoverEndHandler, 
        mouseDown: mouseDownHandler,
        touchStart: touchStartHandler
      }
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
   * Handle touch start - begin touch interaction
   * // SCALED FOR: Touch gesture detection for mobile widget dragging
   * // UPDATED COMMENTS: Differentiates between tap, drag, and canvas pan
   * 
   * @param {TouchEvent} event
   * @param {Object} widget
   */
  handleTouchStart(event, widget) {
    if (!widget.config.isDraggable) return;
    
    // CRITICAL: Check if touch is on widget element
    const touch = event.touches[0];
    const isWidgetTouch = widget.element === event.target || widget.element.contains(event.target);
    if (!isWidgetTouch) return;
    
    // UPDATED COMMENTS: Prevent default to stop canvas scrolling during widget drag
    event.preventDefault();
    
    // CRITICAL: Store touch start position for gesture detection
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.isTouchDragging = false;
    
    // CRITICAL: Get current position from CSS
    const rect = widget.element.getBoundingClientRect();
    this.xOffset = rect.left;
    this.yOffset = rect.top;
    
    // CRITICAL: Calculate offset
    this.initialX = touch.clientX - this.xOffset;
    this.initialY = touch.clientY - this.yOffset;
    
    // CRITICAL: Set drag state
    this.active = true;
    this.dragWidget = widget;
    
    widget.state.isDragging = true;
    widget.element.classList.add('widget--dragging');
    widget.element.style.zIndex = widget.zIndex + 1000;
    widget.element.style.transition = 'transform 0.1s ease-out';
    
    // CRITICAL: Attach global touch listeners
    const container = widget._dragContainer;
    container.addEventListener('touchmove', this.boundTouchMove, { passive: false });
    container.addEventListener('touchend', this.boundTouchEnd);
    container.addEventListener('touchcancel', this.boundTouchEnd);
  }

  /**
   * Handle touch move - update position during drag
   * // CRITICAL: Hardware-accelerated touch dragging with gesture detection
   * 
   * @param {TouchEvent} event
   */
  handleTouchMove(event) {
    if (!this.active || !this.dragWidget) return;
    
    const touch = event.touches[0];
    const widget = this.dragWidget;
    
    // CRITICAL: Check if movement exceeds threshold for drag
    const deltaX = Math.abs(touch.clientX - this.touchStartX);
    const deltaY = Math.abs(touch.clientY - this.touchStartY);
    
    if (!this.isTouchDragging && (deltaX > this.touchMoveThreshold || deltaY > this.touchMoveThreshold)) {
      this.isTouchDragging = true;
    }
    
    // UPDATED COMMENTS: Only prevent default if actually dragging
    if (this.isTouchDragging) {
      event.preventDefault();
      
      // CRITICAL: Calculate new position
      let newX = touch.clientX - this.initialX;
      let newY = touch.clientY - this.initialY;
      
      // UPDATED: Round to prevent blur
      newX = Math.round(newX);
      newY = Math.round(newY);
      
      this.currentX = newX;
      this.currentY = newY;
      this.xOffset = newX;
      this.yOffset = newY;
      
      // REUSED: Apply hover effects during drag
      const hoverRotation = widget.rotation + 3;
      const hoverScale = widget.scale * 1.02;
      
      // CRITICAL: Apply transform
      this.setTranslate(this.currentX, this.currentY, widget.element, hoverRotation, hoverScale);
    }
  }

  /**
   * Handle touch end - finish touch interaction
   * // SCALED FOR: Clean touch drag end with tap detection
   * // UPDATED COMMENTS: Properly triggers widget onClick handler for tap gestures
   * 
   * @param {TouchEvent} event
   */
  handleTouchEnd(event) {
    if (!this.active || !this.dragWidget) return;
    
    const widget = this.dragWidget;
    const container = widget._dragContainer;
    
    // CRITICAL: Remove global touch listeners
    container.removeEventListener('touchmove', this.boundTouchMove);
    container.removeEventListener('touchend', this.boundTouchEnd);
    container.removeEventListener('touchcancel', this.boundTouchEnd);
    
    // CRITICAL: If no drag occurred, treat as tap (click)
    if (!this.isTouchDragging) {
      // UPDATED COMMENTS: Trigger widget onClick handler directly for tap gesture
      if (widget.onClick && typeof widget.onClick === 'function') {
        widget.onClick({ event, widget });
      }
    }
    
    // CRITICAL: Preserve position
    this.initialX = this.currentX;
    this.initialY = this.currentY;
    
    // UPDATED: Reset drag state
    this.active = false;
    this.isTouchDragging = false;
    widget.state.isDragging = false;
    
    widget.element.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
    widget.element.classList.remove('widget--dragging');
    widget.element.style.zIndex = widget.zIndex;
    
    // UPDATED COMMENTS: Reset to base transform (no hover on touch)
    widget.element.classList.remove('widget--hovered');
    this.setTranslate(this.xOffset, this.yOffset, widget.element, widget.rotation, widget.scale);
    
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
   * // UPDATED COMMENTS: Comprehensive cleanup including touch events
   * // SCALED FOR: Complete memory cleanup for mobile and desktop
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
      
      // CRITICAL: Remove mouse event listeners
      element.removeEventListener('mouseenter', handlers.hoverStart);
      element.removeEventListener('mouseleave', handlers.hoverEnd);
      container.removeEventListener('mousedown', handlers.mouseDown);
      container.removeEventListener('mousemove', this.boundMouseMove);
      container.removeEventListener('mouseup', this.boundMouseUp);
      
      // CRITICAL: Remove touch event listeners
      container.removeEventListener('touchstart', handlers.touchStart);
      container.removeEventListener('touchmove', this.boundTouchMove);
      container.removeEventListener('touchend', this.boundTouchEnd);
      container.removeEventListener('touchcancel', this.boundTouchEnd);
      
      this.activeListeners.delete(widget);
    }
    
    if (widget._dragContainer) {
      widget._dragContainer.removeEventListener('mousemove', this.boundMouseMove);
      widget._dragContainer.removeEventListener('mouseup', this.boundMouseUp);
      widget._dragContainer.removeEventListener('touchmove', this.boundTouchMove);
      widget._dragContainer.removeEventListener('touchend', this.boundTouchEnd);
      widget._dragContainer.removeEventListener('touchcancel', this.boundTouchEnd);
    }
    
    delete widget._simpleDragHover;
    delete widget._dragContainer;
  }
}

/* ANCHOR: simple_drag_hover */
/* REUSED: Universal drag and hover system - offset-based approach */
/* SCALED FOR: Proven drag pattern from Kirupa tutorial */

/**
 * SimpleDragHover - Offset-based drag and hover system
 * Uses offset tracking pattern for reliable position management
 * Based on proven drag implementation from Kirupa.com
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
    
    // CRITICAL: Bind global handlers once to avoid memory leaks
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);
  }

  /**
   * Initialize drag and hover for a widget
   * CRITICAL: Offset-based event attachment with current position initialization
   */
  initWidget(widget) {
    if (!widget || !widget.element) {
      console.error('SimpleDragHover: Invalid widget or element');
      return;
    }
    
    const element = widget.element;
    
    // CRITICAL: Initialize offset with widget's current position
    const initialX = parseFloat(element.dataset.initialX) || 100; // Default to 100px if no position
    const initialY = parseFloat(element.dataset.initialY) || 100; // Default to 100px if no position
    this.xOffset = initialX;
    this.yOffset = initialY;
    
    console.log('🎯 SimpleDragHover initialized with offset:', this.xOffset, this.yOffset); // DEBUG
    console.log('📍 Dataset values - initialX:', element.dataset.initialX, 'initialY:', element.dataset.initialY); // DEBUG
    
    // UPDATED COMMENTS: Add smooth transition for hover effects only
    element.style.transition = 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)';
    
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
  }

  /**
   * Handle hover start - simple scale and rotation
   * REUSED: Basic hover effects without position interference
   */
  handleHoverStart(widget) {
    if (this.active) return; // Skip hover during drag
    
    widget.state.isHovered = true;
    
    // CRITICAL: Apply hover effects without changing position
    const hoverRotation = widget.rotation + 3;
    const hoverScale = widget.scale * 1.02;
    
    // UPDATED COMMENTS: Use current offset position for hover
    this.setTranslate(this.xOffset, this.yOffset, widget.element, hoverRotation, hoverScale);
    
    widget.element.classList.add('widget--hovered');
  }

  /**
   * Handle hover end - return to normal state
   * SCALED FOR: Smooth transition back to base state
   */
  handleHoverEnd(widget) {
    if (this.active && this.dragWidget === widget) return; // Keep hover during drag
    
    widget.state.isHovered = false;
    
    // CRITICAL: Return to base transform with current offset
    this.setTranslate(this.xOffset, this.yOffset, widget.element, widget.rotation, widget.scale);
    
    widget.element.classList.remove('widget--hovered');
  }

  /**
   * Handle mouse down - initialize drag with offset calculation
   * UPDATED COMMENTS: Kirupa-style offset initialization with debugging
   */
  handleMouseDown(event, widget) {
    console.log('🎯 Mouse down on:', event.target, 'Widget element:', widget.element); // DEBUG
    
    if (event.button !== 0) return; // Only left mouse button
    if (!widget.config.isDraggable) return;
    
    // CRITICAL: Check if click is on widget or its children
    const isWidgetClick = widget.element === event.target || widget.element.contains(event.target);
    if (!isWidgetClick) {
      console.log('❌ Click not on widget - ignoring'); // DEBUG
      return;
    }
    
    console.log('✅ Starting drag for widget:', widget.id); // DEBUG
    
    event.preventDefault();
    
    // CRITICAL: Calculate initial position with offset (Kirupa pattern)
    this.initialX = event.clientX - this.xOffset;
    this.initialY = event.clientY - this.yOffset;
    
    console.log('📍 Drag start - clientX:', event.clientX, 'clientY:', event.clientY); // DEBUG
    console.log('📍 Current offset - xOffset:', this.xOffset, 'yOffset:', this.yOffset); // DEBUG
    console.log('📍 Calculated initial - initialX:', this.initialX, 'initialY:', this.initialY); // DEBUG
    
    // CRITICAL: Set drag state
    this.active = true;
    this.dragWidget = widget;
    
    // UPDATED COMMENTS: Visual feedback for drag start
    widget.state.isDragging = true;
    widget.element.style.cursor = 'grabbing';
    widget.element.classList.add('widget--dragging');
    widget.element.style.zIndex = widget.zIndex + 1000;
    
    // CRITICAL: Disable transitions during drag
    widget.element.style.transition = 'none';
    
    // CRITICAL: Attach global mouse events to container
    const container = widget._dragContainer;
    container.addEventListener('mousemove', this.boundMouseMove);
    container.addEventListener('mouseup', this.boundMouseUp);
    
    console.log('✅ Drag initialized successfully'); // DEBUG
  }

  /**
   * Handle mouse move - update position with offset tracking
   * CRITICAL: Kirupa-style position calculation with debugging
   */
  handleMouseMove(event) {
    if (!this.active || !this.dragWidget) return;
    
    console.log('🎯 Mouse move - active:', this.active, 'dragWidget:', !!this.dragWidget); // DEBUG
    
    event.preventDefault();
    
    const widget = this.dragWidget;
    
    // CRITICAL: Calculate current position using offset pattern
    this.currentX = event.clientX - this.initialX;
    this.currentY = event.clientY - this.initialY;
    
    console.log('📍 Mouse move - clientX:', event.clientX, 'clientY:', event.clientY); // DEBUG
    console.log('📍 Calculated position - currentX:', this.currentX, 'currentY:', this.currentY); // DEBUG
    
    // UPDATED COMMENTS: Update offset for next operation
    this.xOffset = this.currentX;
    this.yOffset = this.currentY;
    
    // REUSED: Keep hover effects during drag
    const hoverRotation = widget.rotation + 3;
    const hoverScale = widget.scale * 1.02;
    
    // CRITICAL: Set transform using offset position
    this.setTranslate(this.currentX, this.currentY, widget.element, hoverRotation, hoverScale);
    
    console.log('✅ Transform applied:', `translate3d(${this.currentX}px, ${this.currentY}px, 0)`); // DEBUG
  }

  /**
   * Handle mouse up - end drag with offset preservation
   * SCALED FOR: Clean drag end with position preservation
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
    
    // UPDATED COMMENTS: Restore smooth transitions after drag
    widget.element.style.transition = 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)';
    
    // REUSED: Visual state cleanup
    widget.element.style.cursor = widget.config.isDraggable ? 'grab' : 'default';
    widget.element.classList.remove('widget--dragging');
    widget.element.style.zIndex = widget.zIndex;
    
    // CRITICAL: Check hover state after drag
    const elementUnderMouse = document.elementFromPoint(event.clientX, event.clientY);
    const isStillHovered = widget.element.contains(elementUnderMouse) || widget.element === elementUnderMouse;
    
    if (isStillHovered) {
      // UPDATED COMMENTS: Maintain hover state with current position
      widget.state.isHovered = true;
      widget.element.classList.add('widget--hovered');
      
      const hoverRotation = widget.rotation + 3;
      const hoverScale = widget.scale * 1.02;
      this.setTranslate(this.xOffset, this.yOffset, widget.element, hoverRotation, hoverScale);
    } else {
      // CRITICAL: Return to normal state with current position
      widget.state.isHovered = false;
      widget.element.classList.remove('widget--hovered');
      this.setTranslate(this.xOffset, this.yOffset, widget.element, widget.rotation, widget.scale);
    }
    
    // CRITICAL: Clear drag widget reference
    this.dragWidget = null;
  }

  /**
   * REUSABLE LOGIC: Set element transform with position and effects
   * Kirupa-style transform setting with rotation and scale
   * 
   * @param {number} xPos - X position
   * @param {number} yPos - Y position  
   * @param {HTMLElement} element - Element to transform
   * @param {number} rotation - Rotation in degrees
   * @param {number} scale - Scale factor
   */
  setTranslate(xPos, yPos, element, rotation = 0, scale = 1) {
    element.style.transform = `translate3d(${xPos}px, ${yPos}px, 0) rotate(${rotation}deg) scale(${scale})`;
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
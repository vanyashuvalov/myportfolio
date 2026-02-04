/* ANCHOR: widget_button_component */
/* FSD: shared/ui/widget-button → reusable button component */
/* REUSED: Universal button for all widgets */

/**
 * WidgetButton - Universal button component for widgets
 * Features: Icon + text, hug content sizing, consistent styling
 * 
 * @class WidgetButton
 */
export class WidgetButton {
  constructor(options = {}) {
    this.text = options.text || '';
    this.icon = options.icon || null; // SVG string or null
    this.onClick = options.onClick || (() => {});
    this.className = options.className || '';
    this.variant = options.variant || 'default'; // default, primary, success
    this.type = options.type || 'button'; // button, text-only, icon-only
    
    this.element = null;
    this.isHovered = false;
    this.isPressed = false;
  }

  /**
   * Create button element with proper structure
   * UPDATED COMMENTS: Hug content button with flexible icon/text combinations
   */
  createElement() {
    this.element = document.createElement('button');
    this.element.className = this.buildClassName();
    this.element.type = 'button';
    
    // REUSED: Button content structure
    const iconHtml = this.icon && this.type !== 'text-only' ? `
      <div class="widget-button-icon">
        ${this.icon}
      </div>
    ` : '';
    
    const textHtml = this.text && this.type !== 'icon-only' ? `
      <span class="widget-button-text">${this.escapeHtml(this.text)}</span>
    ` : '';
    
    this.element.innerHTML = iconHtml + textHtml;
    
    // SCALED FOR: Event listeners setup
    this.setupEventListeners();
    
    return this.element;
  }

  /**
   * Build CSS class name based on options
   * REUSED: Class name building utility
   */
  buildClassName() {
    const classes = ['widget-button'];
    
    if (this.variant !== 'default') {
      classes.push(`widget-button--${this.variant}`);
    }
    
    if (this.type !== 'button') {
      classes.push(`widget-button--${this.type}`);
    }
    
    if (this.className) {
      classes.push(this.className);
    }
    
    return classes.join(' ');
  }

  /**
   * Setup button event listeners
   * UPDATED COMMENTS: Comprehensive button interaction handling
   */
  setupEventListeners() {
    if (!this.element) return;
    
    // CRITICAL: Mouse events for button states
    this.element.addEventListener('mouseenter', () => {
      this.isHovered = true;
      this.element.classList.add('widget-button--hovered');
    });
    
    this.element.addEventListener('mouseleave', () => {
      this.isHovered = false;
      this.isPressed = false;
      this.element.classList.remove('widget-button--hovered', 'widget-button--pressed');
    });
    
    this.element.addEventListener('mousedown', () => {
      this.isPressed = true;
      this.element.classList.add('widget-button--pressed');
    });
    
    this.element.addEventListener('mouseup', () => {
      this.isPressed = false;
      this.element.classList.remove('widget-button--pressed');
    });
    
    // SCALED FOR: Click handling with preventDefault
    this.element.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onClick(e);
    });
  }

  /**
   * Update button text
   * REUSED: Dynamic content update utility
   */
  setText(newText) {
    this.text = newText;
    if (this.element) {
      const textElement = this.element.querySelector('.widget-button-text');
      if (textElement) {
        textElement.textContent = newText;
      }
    }
  }

  /**
   * Update button icon
   * UPDATED COMMENTS: Dynamic icon replacement
   */
  setIcon(newIcon) {
    this.icon = newIcon;
    if (this.element) {
      const iconElement = this.element.querySelector('.widget-button-icon');
      if (iconElement && newIcon) {
        iconElement.innerHTML = newIcon;
      }
    }
  }

  /**
   * Enable/disable button
   * SCALED FOR: Button state management
   */
  setEnabled(enabled) {
    if (this.element) {
      this.element.disabled = !enabled;
      this.element.style.opacity = enabled ? '1' : '0.5';
      this.element.style.cursor = enabled ? 'pointer' : 'not-allowed';
    }
  }

  /**
   * Destroy button and clean up
   * REUSED: Component cleanup pattern
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
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
   * Static factory method for quick button creation
   * UPDATED COMMENTS: Convenience method for common use cases
   */
  static create(text, icon, onClick, options = {}) {
    const button = new WidgetButton({
      text,
      icon,
      onClick,
      ...options
    });
    return button.createElement();
  }
}
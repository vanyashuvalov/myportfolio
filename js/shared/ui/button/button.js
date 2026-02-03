/* ANCHOR: universal_button_component */
/* REUSED: Universal button system for all UI components */
/* SCALED FOR: Extensible button variants and themes */
/* UPDATED COMMENTS: Two button types - icon-only and icon+text combinations */

/**
 * Button class - Universal button component with two variants
 * Supports icon-only buttons (square) and icon+text buttons (rectangular)
 * 
 * @class Button
 */
export class Button {
  constructor(options = {}) {
    this.options = {
      type: 'icon', // 'icon' or 'text'
      icon: null,
      text: null,
      action: null,
      ariaLabel: null,
      className: '',
      size: 'default', // 'small', 'default', 'large'
      ...options
    };
  }

  /**
   * Render button HTML based on type
   * REUSED: Template-based rendering with variant support
   */
  render() {
    const baseClasses = this.getBaseClasses();
    const sizeClasses = this.getSizeClasses();
    
    if (this.options.type === 'icon') {
      return this.renderIconButton(baseClasses, sizeClasses);
    } else if (this.options.type === 'text') {
      return this.renderTextButton(baseClasses, sizeClasses);
    }
    
    throw new Error(`Unknown button type: ${this.options.type}`);
  }

  /**
   * Render icon-only button (square)
   * UPDATED COMMENTS: Square button with only icon, perfect for social media
   */
  renderIconButton(baseClasses, sizeClasses) {
    return `
      <button class="${baseClasses} nav-button--icon ${sizeClasses} ${this.options.className}" 
              data-action="${this.options.action}" 
              aria-label="${this.options.ariaLabel}">
        ${this.options.icon}
      </button>
    `;
  }

  /**
   * Render icon+text button (rectangular)
   * UPDATED COMMENTS: Rectangular button with icon and text, for actions like "GET CV"
   */
  renderTextButton(baseClasses, sizeClasses) {
    return `
      <button class="${baseClasses} nav-button--text ${sizeClasses} ${this.options.className}" 
              data-action="${this.options.action}" 
              aria-label="${this.options.ariaLabel}">
        ${this.options.icon ? `<div class="nav-button__icon">${this.options.icon}</div>` : ''}
        <span class="nav-button__text">${this.options.text}</span>
      </button>
    `;
  }

  /**
   * Get base CSS classes
   * REUSED: Consistent button styling across all variants
   */
  getBaseClasses() {
    return 'nav-button';
  }

  /**
   * Get size-specific CSS classes
   * SCALED FOR: Multiple button sizes
   */
  getSizeClasses() {
    const sizeMap = {
      small: 'nav-button--small',
      default: '',
      large: 'nav-button--large'
    };
    return sizeMap[this.options.size] || '';
  }

  /**
   * Update button options
   * UPDATED COMMENTS: Dynamic button updates
   */
  updateOptions(newOptions) {
    Object.assign(this.options, newOptions);
  }
}
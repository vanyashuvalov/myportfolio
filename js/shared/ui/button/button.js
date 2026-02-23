/* ANCHOR: universal_button_component */
/* REUSED: Universal button system for all UI components */
/* SCALED FOR: Extensible button variants and themes */
/* UPDATED COMMENTS: Two button types - icon-only and icon+text combinations */

/**
 * Button class - Universal button component with multiple variants
 * Supports icon-only, icon+text, dropdown, and custom content buttons
 * UPDATED COMMENTS: Extended with dropdown variants and active states
 * 
 * @class Button
 */
export class Button {
  constructor(options = {}) {
    this.options = {
      type: 'icon', // 'icon', 'text', 'dropdown', 'dropdown-flag'
      icon: null,
      text: null,
      action: null,
      ariaLabel: null,
      className: '',
      size: 'default', // 'small', 'default', 'large'
      isActive: false, // Active state for navigation items
      customContent: null, // Custom HTML content (e.g., flag icons)
      dropdown: null, // Dropdown identifier for aria-haspopup
      ariaExpanded: false, // Dropdown expanded state
      ...options
    };
  }

  /**
   * Render button HTML based on type
   * REUSED: Template-based rendering with variant support
   * UPDATED COMMENTS: Extended with dropdown and dropdown-flag variants
   */
  render() {
    const baseClasses = this.getBaseClasses();
    const sizeClasses = this.getSizeClasses();
    const activeClass = this.options.isActive ? 'mobile-menu__item--active' : '';
    
    if (this.options.type === 'icon') {
      return this.renderIconButton(baseClasses, sizeClasses);
    } else if (this.options.type === 'text') {
      return this.renderTextButton(baseClasses, sizeClasses);
    } else if (this.options.type === 'dropdown') {
      return this.renderDropdownButton(baseClasses, sizeClasses);
    } else if (this.options.type === 'dropdown-flag') {
      return this.renderDropdownFlagButton(baseClasses, sizeClasses);
    } else if (this.options.type === 'menu-item') {
      return this.renderMenuItem(activeClass);
    } else if (this.options.type === 'menu-social') {
      return this.renderMenuSocialButton();
    } else if (this.options.type === 'menu-action') {
      return this.renderMenuActionButton();
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
   * Render dropdown button (text only)
   * UPDATED COMMENTS: Dropdown button for page navigation
   * REUSED: Consistent with existing nav-button--dropdown class
   */
  renderDropdownButton(baseClasses, sizeClasses) {
    return `
      <button class="${baseClasses}--dropdown ${sizeClasses} ${this.options.className}" 
              aria-expanded="${this.options.ariaExpanded}" 
              aria-haspopup="true"
              data-dropdown="${this.options.dropdown}">
        <span class="nav-button__text">${this.options.text}</span>
      </button>
    `;
  }

  /**
   * Render dropdown button with flag (flag + text)
   * UPDATED COMMENTS: Dropdown button for language selection with flag icon
   * REUSED: Consistent with existing nav-button--dropdown--flag class
   */
  renderDropdownFlagButton(baseClasses, sizeClasses) {
    return `
      <button class="${baseClasses}--dropdown ${baseClasses}--dropdown--flag ${sizeClasses} ${this.options.className}" 
              aria-expanded="${this.options.ariaExpanded}" 
              aria-haspopup="true"
              data-dropdown="${this.options.dropdown}">
        <div class="nav-button__flag">
          ${this.options.customContent}
        </div>
        <span class="nav-button__text">${this.options.text}</span>
      </button>
    `;
  }

  /**
   * Render mobile menu item button
   * UPDATED COMMENTS: Menu navigation button with active state support
   * REUSED: Consistent with existing mobile-menu__item class
   */
  renderMenuItem(activeClass) {
    const dataAttrs = Object.entries(this.options.dataAttrs || {})
      .map(([key, value]) => `data-${key}="${value}"`)
      .join(' ');
    
    return `
      <button class="mobile-menu__item ${activeClass} ${this.options.className}" 
              data-action="${this.options.action}" 
              ${dataAttrs}>
        ${this.options.customContent || ''}
        ${this.options.text}
      </button>
    `;
  }

  /**
   * Render mobile menu social button
   * UPDATED COMMENTS: Social link button with icon + text
   * REUSED: Consistent with existing mobile-menu__social-button class
   */
  renderMenuSocialButton() {
    return `
      <button class="mobile-menu__social-button ${this.options.className}" 
              data-action="${this.options.action}" 
              aria-label="${this.options.ariaLabel}">
        ${this.options.icon}
        <span>${this.options.text}</span>
      </button>
    `;
  }

  /**
   * Render mobile menu action button
   * UPDATED COMMENTS: Primary/secondary action button with icon + text
   * REUSED: Consistent with existing mobile-menu__action-button class
   */
  renderMenuActionButton() {
    const primaryClass = this.options.isPrimary ? 'mobile-menu__action-button--primary' : '';
    
    return `
      <button class="mobile-menu__action-button ${primaryClass} ${this.options.className}" 
              data-action="${this.options.action}">
        ${this.options.icon}
        <span>${this.options.text}</span>
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
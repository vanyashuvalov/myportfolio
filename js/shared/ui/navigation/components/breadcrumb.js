/* ANCHOR: breadcrumb_component */
/* REUSED: Breadcrumb navigation with dropdowns */
/* SCALED FOR: Dynamic page and language switching */
/* UPDATED COMMENTS: Modular breadcrumb component with dropdown support */

import { IconProvider } from './icon-provider.js';

/**
 * Breadcrumb class - Navigation breadcrumb with page and language selectors
 * Handles page navigation and language switching with dropdown menus
 * 
 * @class Breadcrumb
 */
export class Breadcrumb {
  constructor(options = {}) {
    this.options = {
      currentPage: 'Home',
      currentLanguage: 'EN',
      ...options
    };
    this.iconProvider = new IconProvider();
    this.dropdownStates = {
      page: false,
      language: false
    };
  }

  /**
   * Render page section as dropdown button
   * REUSED: New dropdown button variant with text and arrow
   * UPDATED COMMENTS: Single button component with text and arrow icon
   */
  renderPageSection() {
    return `
      <button class="nav-button--dropdown" 
              aria-expanded="${this.dropdownStates.page}" 
              aria-haspopup="true"
              data-dropdown="page">
        <span class="nav-button__text">${this.options.currentPage}</span>
        <div class="nav-button__icon">
          ${this.iconProvider.getArrowSVG()}
        </div>
      </button>
    `;
  }

  /**
   * Render language section as dropdown button with flag
   * REUSED: New dropdown button variant with flag, text and arrow
   * UPDATED COMMENTS: Single button component with flag, text and arrow icon
   */
  renderLanguageSection() {
    return `
      <button class="nav-button--dropdown nav-button--dropdown--flag" 
              aria-expanded="${this.dropdownStates.language}" 
              aria-haspopup="true"
              data-dropdown="language">
        <div class="nav-button__flag">
          ${this.iconProvider.getFlagSVG()}
        </div>
        <span class="nav-button__text">${this.options.currentLanguage}</span>
        <div class="nav-button__icon">
          ${this.iconProvider.getArrowSVG()}
        </div>
      </button>
    `;
  }

  /**
   * Render breadcrumb HTML - DEPRECATED, use separate methods
   * REUSED: Legacy method for backward compatibility only
   * UPDATED COMMENTS: Returns combined sections WITHOUT internal separators
   */
  render() {
    // UPDATED COMMENTS: Return combined sections for legacy compatibility
    // NOTE: This method should not be used for new dynamic breadcrumb system
    return this.renderPageSection() + this.renderLanguageSection();
  }

  /**
   * Toggle dropdown state
   * UPDATED COMMENTS: Dropdown state management
   */
  toggleDropdown(type) {
    this.dropdownStates[type] = !this.dropdownStates[type];
  }

  /**
   * Update breadcrumb data
   * SCALED FOR: Dynamic navigation updates
   */
  updateBreadcrumb(newData) {
    Object.assign(this.options, newData);
  }
}
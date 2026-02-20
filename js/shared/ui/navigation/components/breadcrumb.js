/* ANCHOR: breadcrumb_component */
/* REUSED: Breadcrumb navigation with dropdowns */
/* SCALED FOR: Dynamic page and language switching */
/* UPDATED COMMENTS: Modular breadcrumb component with dropdown support */

import { IconProvider } from './icon-provider.js';
import { PageDropdown } from '../../dropdown/page-dropdown.js';
import { LanguageDropdown } from '../../dropdown/language-dropdown.js';

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
      eventBus: options.eventBus,
      ...options
    };
    this.iconProvider = new IconProvider();
    this.dropdownStates = {
      page: false,
      language: false
    };
    
    // CRITICAL: Initialize page dropdown
    this.pageDropdown = new PageDropdown({
      eventBus: this.options.eventBus,
      currentPage: this.options.currentPage
    });
    
    // CRITICAL: Initialize language dropdown
    this.languageDropdown = new LanguageDropdown({
      eventBus: this.options.eventBus,
      currentLanguage: this.options.currentLanguage
    });
  }

  /**
   * Render page section as dropdown button
   * REUSED: New dropdown button variant with text and arrow
   * UPDATED COMMENTS: Single button component with text only (no arrow icon)
   */
  renderPageSection() {
    return `
      <button class="nav-button--dropdown" 
              aria-expanded="${this.dropdownStates.page}" 
              aria-haspopup="true"
              data-dropdown="page">
        <span class="nav-button__text">${this.options.currentPage}</span>
      </button>
    `;
  }

  /**
   * Render language section as dropdown button with flag
   * REUSED: New dropdown button variant with flag, text and arrow
   * UPDATED COMMENTS: Single button component with flag and text only (no arrow icon)
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
   * UPDATED COMMENTS: Dropdown state management with PageDropdown and LanguageDropdown integration
   */
  toggleDropdown(type, buttonElement) {
    this.dropdownStates[type] = !this.dropdownStates[type];
    
    // CRITICAL: Handle page dropdown toggle
    if (type === 'page' && this.pageDropdown) {
      this.pageDropdown.toggle(buttonElement);
    }
    
    // CRITICAL: Handle language dropdown toggle
    if (type === 'language' && this.languageDropdown) {
      this.languageDropdown.toggle(buttonElement);
    }
  }

  /**
   * Update breadcrumb data
   * SCALED FOR: Dynamic navigation updates
   */
  updateBreadcrumb(newData) {
    Object.assign(this.options, newData);
    
    // CRITICAL: Update page dropdown current page
    if (newData.currentPage && this.pageDropdown) {
      this.pageDropdown.updateCurrentPage(newData.currentPage);
    }
    
    // CRITICAL: Update language dropdown current language
    if (newData.currentLanguage && this.languageDropdown) {
      this.languageDropdown.updateCurrentLanguage(newData.currentLanguage);
    }
  }
  
  /**
   * Destroy breadcrumb and cleanup
   * SCALED FOR: Memory management
   */
  destroy() {
    if (this.pageDropdown) {
      this.pageDropdown.destroy();
    }
    if (this.languageDropdown) {
      this.languageDropdown.destroy();
    }
  }
}
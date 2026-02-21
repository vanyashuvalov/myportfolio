/* ANCHOR: language_dropdown_wrapper */
/* FSD: shared/ui/dropdown → Language dropdown wrapper using universal Dropdown */
/* REUSED: Universal Dropdown component from shared/ui/dropdown */
/* UPDATED COMMENTS: Thin wrapper for language-specific configuration */

import { Dropdown } from './dropdown.js';

/**
 * LanguageDropdown class - Wrapper for language selection
 * REUSED: Uses universal Dropdown component with language-specific config
 * CRITICAL: Frontend only, no backend logic yet
 * 
 * @class LanguageDropdown
 */
export class LanguageDropdown {
  constructor(options = {}) {
    const languages = options.languages || [
      { id: 'en', label: 'EN', flag: 'usa' },
      { id: 'ru', label: 'RU', flag: 'russia' }
    ];
    
    const currentLanguage = options.currentLanguage || 'EN';
    const activeItemId = languages.find(lang => lang.label === currentLanguage)?.id || 'en';
    
    // REUSED: Create universal dropdown with language config
    this.dropdown = new Dropdown({
      eventBus: options.eventBus,
      items: languages,
      activeItemId: activeItemId,
      eventName: 'language-dropdown:select',
      ariaLabel: 'Language selection',
      minWidth: '100px'
    });
    
    this.currentLanguage = currentLanguage;
  }

  /**
   * Show dropdown - delegates to universal Dropdown
   * REUSED: Universal Dropdown.show()
   */
  show(buttonElement) {
    this.dropdown.show(buttonElement);
  }

  /**
   * Hide dropdown - delegates to universal Dropdown
   * REUSED: Universal Dropdown.hide()
   */
  hide() {
    this.dropdown.hide();
  }

  /**
   * Toggle dropdown - delegates to universal Dropdown
   * REUSED: Universal Dropdown.toggle()
   */
  toggle(buttonElement) {
    this.dropdown.toggle(buttonElement);
  }

  /**
   * Update current language
   * CRITICAL: Update active state in universal dropdown
   */
  updateCurrentLanguage(langLabel) {
    this.currentLanguage = langLabel;
    const langId = this.dropdown.options.items.find(lang => lang.label === langLabel)?.id;
    if (langId) {
      this.dropdown.updateActiveItem(langId);
    }
  }

  /**
   * Destroy dropdown - delegates to universal Dropdown
   * REUSED: Universal Dropdown.destroy()
   */
  destroy() {
    this.dropdown.destroy();
  }
  
  // UPDATED COMMENTS: Expose isOpen for compatibility
  get isOpen() {
    return this.dropdown.isOpen;
  }
}

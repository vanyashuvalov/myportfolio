/* ANCHOR: page_dropdown_wrapper */
/* FSD: shared/ui/dropdown → Page dropdown wrapper using universal Dropdown */
/* REUSED: Universal Dropdown component from shared/ui/dropdown */
/* UPDATED COMMENTS: Thin wrapper for page navigation configuration */

import { Dropdown } from './dropdown.js';

/**
 * PageDropdown class - Wrapper for page navigation
 * REUSED: Uses universal Dropdown component with page-specific config
 * 
 * @class PageDropdown
 */
export class PageDropdown {
  constructor(options = {}) {
    const pages = options.pages || [
      { id: 'home', label: 'Home', url: '/' },
      { id: 'projects', label: 'Projects', url: '/projects' },
      { id: 'fun', label: 'Fun', url: '/fun' }
    ];
    
    const currentPage = options.currentPage || 'Home';
    const activeItemId = pages.find(page => page.label === currentPage)?.id || 'home';
    
    // REUSED: Create universal dropdown with page config
    this.dropdown = new Dropdown({
      eventBus: options.eventBus,
      items: pages.map(page => ({
        id: page.id,
        label: page.label,
        customData: { url: page.url }
      })),
      activeItemId: activeItemId,
      eventName: 'page-dropdown:select',
      ariaLabel: 'Page navigation',
      minWidth: '140px'
    });
    
    this.currentPage = currentPage;
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
   * Update current page
   * CRITICAL: Update active state in universal dropdown
   */
  updateCurrentPage(pageName) {
    this.currentPage = pageName;
    const pageId = this.dropdown.options.items.find(page => page.label === pageName)?.id;
    if (pageId) {
      this.dropdown.updateActiveItem(pageId);
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

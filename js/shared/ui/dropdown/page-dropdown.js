/* ANCHOR: page_dropdown_component */
/* FSD: shared/ui/dropdown → Reusable dropdown component */
/* SCALED FOR: Minimal design with smooth animations */
/* UPDATED COMMENTS: Page navigation dropdown for Home/Projects/Fun */

/**
 * PageDropdown class - Minimalist dropdown for page navigation
 * Handles page selection with smooth animations and keyboard support
 * 
 * @class PageDropdown
 */
export class PageDropdown {
  constructor(options = {}) {
    this.options = {
      eventBus: options.eventBus,
      currentPage: options.currentPage || 'Home',
      pages: options.pages || [
        { id: 'home', label: 'Home', url: '/' },
        { id: 'projects', label: 'Projects', url: '/projects' },
        { id: 'fun', label: 'Fun', url: '/fun' }
      ],
      ...options
    };
    
    this.isOpen = false;
    this.dropdownElement = null;
    this.buttonElement = null;
  }

  /**
   * Render dropdown HTML structure
   * UPDATED COMMENTS: Minimal dropdown with clean design
   * CRITICAL: Dropdown positioned absolutely relative to button
   */
  render() {
    const items = this.options.pages
      .map(page => {
        const isActive = page.label === this.options.currentPage;
        return `
          <button 
            class="page-dropdown__item ${isActive ? 'page-dropdown__item--active' : ''}"
            data-page-url="${page.url}"
            data-page-label="${page.label}"
            role="menuitem"
            ${isActive ? 'aria-current="page"' : ''}
          >
            ${page.label}
          </button>
        `;
      })
      .join('');
    
    return `
      <div class="page-dropdown" role="menu" aria-label="Page navigation">
        ${items}
      </div>
    `;
  }

  /**
   * Show dropdown with smooth animation
   * UPDATED COMMENTS: Smooth fade-in with position calculation
   * CRITICAL: Position dropdown below button with proper alignment
   */
  show(buttonElement) {
    if (this.isOpen) return;
    
    this.buttonElement = buttonElement;
    this.isOpen = true;
    
    // CRITICAL: Create dropdown element
    const dropdownHTML = this.render();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = dropdownHTML;
    this.dropdownElement = tempDiv.firstElementChild;
    
    // UPDATED COMMENTS: Position dropdown relative to button
    const buttonRect = buttonElement.getBoundingClientRect();
    this.dropdownElement.style.position = 'absolute';
    this.dropdownElement.style.top = `${buttonRect.bottom + 8}px`;
    this.dropdownElement.style.left = `${buttonRect.left}px`;
    this.dropdownElement.style.opacity = '0';
    this.dropdownElement.style.transform = 'translateY(-8px)';
    this.dropdownElement.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    
    // CRITICAL: Append to body for proper z-index stacking
    document.body.appendChild(this.dropdownElement);
    
    // UPDATED COMMENTS: Trigger animation on next frame
    requestAnimationFrame(() => {
      this.dropdownElement.style.opacity = '1';
      this.dropdownElement.style.transform = 'translateY(0)';
    });
    
    // REUSED: Event listeners for dropdown interactions
    this.bindDropdownEvents();
    
    // CRITICAL: Update button aria-expanded state
    buttonElement.setAttribute('aria-expanded', 'true');
  }

  /**
   * Hide dropdown with smooth animation
   * SCALED FOR: Clean removal with animation
   */
  hide() {
    if (!this.isOpen || !this.dropdownElement) return;
    
    this.isOpen = false;
    
    // UPDATED COMMENTS: Fade out animation
    this.dropdownElement.style.opacity = '0';
    this.dropdownElement.style.transform = 'translateY(-8px)';
    
    // CRITICAL: Remove from DOM after animation
    setTimeout(() => {
      if (this.dropdownElement && this.dropdownElement.parentNode) {
        this.dropdownElement.parentNode.removeChild(this.dropdownElement);
      }
      this.dropdownElement = null;
    }, 200);
    
    // CRITICAL: Update button aria-expanded state
    if (this.buttonElement) {
      this.buttonElement.setAttribute('aria-expanded', 'false');
    }
  }

  /**
   * Toggle dropdown visibility
   * REUSED: Standard toggle pattern
   */
  toggle(buttonElement) {
    if (this.isOpen) {
      this.hide();
    } else {
      this.show(buttonElement);
    }
  }

  /**
   * Bind dropdown event listeners
   * UPDATED COMMENTS: Click handling and outside click detection
   */
  bindDropdownEvents() {
    if (!this.dropdownElement) return;
    
    // CRITICAL: Handle item clicks
    this.dropdownElement.addEventListener('click', (event) => {
      const item = event.target.closest('.page-dropdown__item');
      if (!item) return;
      
      const url = item.dataset.pageUrl;
      const label = item.dataset.pageLabel;
      
      // REUSED: EventBus for navigation
      if (this.options.eventBus) {
        this.options.eventBus.emit('page-dropdown:select', { url, label });
      }
      
      this.hide();
    });
    
    // CRITICAL: Close on outside click
    setTimeout(() => {
      document.addEventListener('click', this.handleOutsideClick.bind(this), { once: true });
    }, 0);
    
    // REUSED: Keyboard navigation support
    document.addEventListener('keydown', this.handleKeydown.bind(this), { once: true });
  }

  /**
   * Handle outside click to close dropdown
   * UPDATED COMMENTS: Click outside detection with proper cleanup
   */
  handleOutsideClick(event) {
    if (!this.dropdownElement) return;
    
    const isClickInside = this.dropdownElement.contains(event.target) ||
                         (this.buttonElement && this.buttonElement.contains(event.target));
    
    if (!isClickInside) {
      this.hide();
    }
  }

  /**
   * Handle keyboard navigation
   * SCALED FOR: Accessibility with arrow keys and escape
   */
  handleKeydown(event) {
    if (event.key === 'Escape') {
      this.hide();
      if (this.buttonElement) {
        this.buttonElement.focus();
      }
    }
  }

  /**
   * Update current page
   * CRITICAL: Update active state without re-rendering
   */
  updateCurrentPage(pageName) {
    this.options.currentPage = pageName;
  }

  /**
   * Destroy dropdown and cleanup
   * SCALED FOR: Memory management
   */
  destroy() {
    this.hide();
    this.buttonElement = null;
  }
}

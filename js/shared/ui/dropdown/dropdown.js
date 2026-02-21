/* ANCHOR: dropdown_component */
/* FSD: shared/ui/dropdown → Universal reusable dropdown component */
/* SCALED FOR: Configurable dropdown for any use case (language, pages, etc.) */
/* UPDATED COMMENTS: Generic dropdown with event-driven architecture */

/**
 * Dropdown class - Universal dropdown component
 * CRITICAL: Handles any type of dropdown with configurable items and events
 * REUSED: Single component for language, page, and future dropdowns
 * 
 * @class Dropdown
 * @param {Object} options - Configuration options
 * @param {EventBus} options.eventBus - Event bus for communication
 * @param {Array} options.items - Array of dropdown items [{id, label, ...customData}]
 * @param {string} options.activeItemId - Currently active item ID
 * @param {string} options.eventName - Event name to emit on selection (e.g., 'dropdown:select')
 * @param {string} options.ariaLabel - Accessibility label for the dropdown
 */
export class Dropdown {
  constructor(options = {}) {
    // CRITICAL: Validate required options
    if (!options.items || !Array.isArray(options.items)) {
      throw new Error('Dropdown requires items array');
    }
    
    this.options = {
      eventBus: options.eventBus,
      items: options.items,
      activeItemId: options.activeItemId || null,
      eventName: options.eventName || 'dropdown:select',
      ariaLabel: options.ariaLabel || 'Dropdown menu',
      minWidth: options.minWidth || '100px',
      ...options
    };
    
    this.isOpen = false;
    this.dropdownElement = null;
    this.buttonElement = null;
  }

  /**
   * Render dropdown HTML structure
   * UPDATED COMMENTS: Dynamic rendering based on items array
   * CRITICAL: Dropdown positioned absolutely relative to button
   */
  render() {
    const items = this.options.items
      .map(item => {
        const isActive = item.id === this.options.activeItemId;
        return `
          <button 
            class="dropdown__item ${isActive ? 'dropdown__item--active' : ''}"
            data-item-id="${item.id}"
            data-item-label="${item.label}"
            ${item.customData ? `data-custom='${JSON.stringify(item.customData)}'` : ''}
            role="menuitem"
            ${isActive ? 'aria-current="true"' : ''}
          >
            ${item.label}
          </button>
        `;
      })
      .join('');
    
    return `
      <div class="dropdown" role="menu" aria-label="${this.options.ariaLabel}" style="min-width: ${this.options.minWidth}">
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
      const item = event.target.closest('.dropdown__item');
      if (!item) return;
      
      const itemId = item.dataset.itemId;
      const itemLabel = item.dataset.itemLabel;
      const customData = item.dataset.custom ? JSON.parse(item.dataset.custom) : {};
      
      // REUSED: EventBus for item selection
      if (this.options.eventBus) {
        this.options.eventBus.emit(this.options.eventName, { 
          itemId, 
          itemLabel,
          ...customData
        });
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
   * Update active item
   * CRITICAL: Update active state without re-rendering
   */
  updateActiveItem(itemId) {
    this.options.activeItemId = itemId;
  }

  /**
   * Update items array
   * SCALED FOR: Dynamic item updates
   */
  updateItems(items) {
    this.options.items = items;
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

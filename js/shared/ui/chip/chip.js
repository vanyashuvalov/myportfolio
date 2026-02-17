/* ANCHOR: chip_component */
/* FSD: shared/ui/chip → reusable tag/category component */
/* REUSED: Simple UI component pattern from button/widget-button */
/* SCALED FOR: Multiple variants, sizes, and interactive states */

/**
 * ## ANCHOR POINTS
 * - ENTRY: Chip UI component for tags and categories
 * - MAIN: createChip factory function
 * - EXPORTS: Chip class and createChip helper
 * - DEPS: None (vanilla JS)
 * - TODOs: Add icon support, custom colors
 * 
 * Chip Component
 * UPDATED COMMENTS: Lightweight pill-shaped tag component for categories and labels
 * Based on Figma design with semi-transparent backgrounds and uppercase text
 * 
 * Features:
 * - Multiple variants (default, light, solid, primary)
 * - Multiple sizes (small, default, large)
 * - Interactive mode with hover effects
 * - Click handler support
 * - Accessible markup
 * 
 * @class Chip
 */

export class Chip {
  /**
   * Create a new Chip instance
   * CRITICAL: Flexible configuration for different use cases
   * 
   * @param {Object} options - Chip configuration
   * @param {string} options.label - Chip text content (required)
   * @param {string} [options.variant='default'] - Chip variant: 'default', 'light', 'solid', 'primary'
   * @param {string} [options.size='default'] - Chip size: 'small', 'default', 'large'
   * @param {boolean} [options.interactive=false] - Enable hover/click interactions
   * @param {Function} [options.onClick] - Click handler function
   * @param {string} [options.className] - Additional CSS classes
   * @param {Object} [options.data] - Custom data attributes
   */
  constructor(options = {}) {
    // UPDATED COMMENTS: Validate required parameters
    if (!options.label) {
      throw new Error('Chip requires a label');
    }
    
    // REUSED: Configuration pattern from other UI components
    this.label = options.label;
    this.variant = options.variant || 'default';
    this.size = options.size || 'default';
    this.interactive = options.interactive || false;
    this.onClick = options.onClick || null;
    this.className = options.className || '';
    this.data = options.data || {};
    
    // SCALED FOR: Element reference for DOM manipulation
    this.element = null;
  }

  /**
   * Render chip as HTML string
   * CRITICAL: Returns markup for innerHTML insertion
   * REUSED: String-based rendering pattern
   * 
   * @returns {string} HTML string
   */
  render() {
    // UPDATED COMMENTS: Build CSS classes
    const classes = this.buildClasses();
    
    // SCALED FOR: Build data attributes
    const dataAttrs = this.buildDataAttributes();
    
    return `
      <span class="${classes}" ${dataAttrs}>
        ${this.escapeHtml(this.label)}
      </span>
    `;
  }

  /**
   * Create chip as DOM element
   * UPDATED COMMENTS: Returns actual DOM node for appendChild
   * SCALED FOR: Event listener attachment
   * 
   * @returns {HTMLElement} Chip element
   */
  createElement() {
    // CRITICAL: Create element
    const chip = document.createElement('span');
    chip.className = this.buildClasses();
    chip.textContent = this.label;
    
    // UPDATED COMMENTS: Add data attributes
    Object.entries(this.data).forEach(([key, value]) => {
      chip.dataset[key] = value;
    });
    
    // REUSED: Event listener pattern
    if (this.onClick && typeof this.onClick === 'function') {
      chip.addEventListener('click', (event) => {
        this.onClick(event, this);
      });
    }
    
    // SCALED FOR: Store reference
    this.element = chip;
    
    return chip;
  }

  /**
   * Build CSS class string
   * UPDATED COMMENTS: Combines base, variant, size, and custom classes
   * 
   * @returns {string} Space-separated class names
   */
  buildClasses() {
    const classes = ['chip'];
    
    // CRITICAL: Add variant class
    if (this.variant !== 'default') {
      classes.push(`chip--${this.variant}`);
    }
    
    // UPDATED COMMENTS: Add size class
    if (this.size !== 'default') {
      classes.push(`chip--${this.size}`);
    }
    
    // REUSED: Add interactive class
    if (this.interactive || this.onClick) {
      classes.push('chip--interactive');
    }
    
    // SCALED FOR: Add custom classes
    if (this.className) {
      classes.push(this.className);
    }
    
    return classes.join(' ');
  }

  /**
   * Build data attributes string
   * UPDATED COMMENTS: Converts data object to HTML attributes
   * 
   * @returns {string} Data attributes string
   */
  buildDataAttributes() {
    return Object.entries(this.data)
      .map(([key, value]) => `data-${key}="${this.escapeHtml(String(value))}"`)
      .join(' ');
  }

  /**
   * Escape HTML to prevent XSS
   * CRITICAL: Security-first content handling
   * REUSED: XSS prevention pattern from modal components
   * 
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Update chip label
   * SCALED FOR: Dynamic content updates
   * 
   * @param {string} newLabel - New label text
   */
  updateLabel(newLabel) {
    this.label = newLabel;
    if (this.element) {
      this.element.textContent = newLabel;
    }
  }

  /**
   * Destroy chip and cleanup
   * UPDATED COMMENTS: Remove element and event listeners
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.remove();
    }
    this.element = null;
    this.onClick = null;
  }
}

/**
 * Factory function to create chip HTML
 * REUSED: Convenient helper for quick chip creation
 * SCALED FOR: Simplified API for common use cases
 * 
 * @param {string} label - Chip text
 * @param {Object} [options] - Chip options
 * @returns {string} HTML string
 * 
 * @example
 * // Simple chip
 * createChip('B2B')
 * 
 * @example
 * // Chip with variant
 * createChip('Featured', { variant: 'primary' })
 * 
 * @example
 * // Interactive chip
 * createChip('Filter', { interactive: true, onClick: handleClick })
 */
export function createChip(label, options = {}) {
  const chip = new Chip({ label, ...options });
  return chip.render();
}

/**
 * Create multiple chips from array
 * CRITICAL: Batch chip creation for tag lists
 * UPDATED COMMENTS: Returns HTML string with chips container
 * 
 * @param {Array<string|Object>} items - Array of labels or chip configs
 * @param {Object} [options] - Default options for all chips
 * @param {Object} [containerOptions] - Container configuration
 * @returns {string} HTML string with chips container
 * 
 * @example
 * // Simple tags
 * createChips(['B2B', 'AI', 'Product'])
 * 
 * @example
 * // With default options
 * createChips(['Tag1', 'Tag2'], { variant: 'light' })
 * 
 * @example
 * // With container alignment
 * createChips(['Tag1', 'Tag2'], {}, { align: 'left' })
 */
export function createChips(items, options = {}, containerOptions = {}) {
  if (!Array.isArray(items) || items.length === 0) {
    return '';
  }
  
  // UPDATED COMMENTS: Build container classes
  const containerClasses = ['chips-container'];
  if (containerOptions.align && containerOptions.align !== 'center') {
    containerClasses.push(`chips-container--${containerOptions.align}`);
  }
  if (containerOptions.spaced) {
    containerClasses.push('chips-container--spaced');
  }
  if (containerOptions.className) {
    containerClasses.push(containerOptions.className);
  }
  
  // SCALED FOR: Generate chips HTML
  const chipsHtml = items.map(item => {
    // CRITICAL: Handle both string and object items
    if (typeof item === 'string') {
      return createChip(item, options);
    } else if (typeof item === 'object' && item.label) {
      return createChip(item.label, { ...options, ...item });
    }
    return '';
  }).filter(Boolean).join('');
  
  return `
    <div class="${containerClasses.join(' ')}">
      ${chipsHtml}
    </div>
  `;
}

/**
 * Create chips as DOM elements
 * REUSED: DOM-based batch creation for dynamic insertion
 * 
 * @param {Array<string|Object>} items - Array of labels or chip configs
 * @param {Object} [options] - Default options for all chips
 * @returns {Array<HTMLElement>} Array of chip elements
 */
export function createChipElements(items, options = {}) {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }
  
  return items.map(item => {
    // UPDATED COMMENTS: Handle both string and object items
    if (typeof item === 'string') {
      const chip = new Chip({ label: item, ...options });
      return chip.createElement();
    } else if (typeof item === 'object' && item.label) {
      const chip = new Chip({ ...options, ...item });
      return chip.createElement();
    }
    return null;
  }).filter(Boolean);
}

// UPDATED COMMENTS: Export default for convenient importing
export default Chip;

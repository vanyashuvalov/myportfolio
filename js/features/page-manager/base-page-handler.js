/**
 * BasePageHandler - Base class for all page handlers
 * FSD: features/page-manager → common page patterns
 * 
 * @class BasePageHandler
 */
export class BasePageHandler {
  constructor(options = {}) {
    this.eventBus = options.eventBus;
    this.pageContainer = options.pageContainer;
    this.escapeHtml = options.escapeHtml || this._escapeHtml.bind(this);
  }

  /**
   * Load page data - override in subclasses
   * @returns {Promise<Object>} Page data
   */
  async load() {
    throw new Error('load() must be implemented');
  }

  /**
   * Render page HTML - override in subclasses
   * @param {Object} data - Page data
   * @returns {string} HTML content
   */
  render(data) {
    throw new Error('render() must be implemented');
  }

  /**
   * Setup event listeners - override in subclasses
   */
  setupEvents() {
    // Optional override
  }

  /**
   * Transition to page mode
   * @param {string} html - Page HTML
   * @returns {Promise}
   */
  async transitionToPage(html) {
    // Render content
    this.pageContainer.innerHTML = html;
    
    // Setup events
    this.setupEvents();
    
    // Add page-mode class
    document.body.classList.add('page-mode');
    document.documentElement.classList.add('page-mode');
    
    // Show container
    this.pageContainer.style.display = 'block';
    this.pageContainer.style.opacity = '1';
    this.pageContainer.scrollTop = 0;
    
    // Hide desktop
    const desktopCanvas = document.getElementById('desktop-canvas');
    if (desktopCanvas) {
      desktopCanvas.style.display = 'none';
      desktopCanvas.style.opacity = '0';
    }
    
    // Fade in content
    const content = this.pageContainer.firstElementChild;
    if (content) {
      content.style.opacity = '0';
      content.style.transition = 'opacity 0.3s ease-out';
      await new Promise(r => setTimeout(r, 50));
      content.style.opacity = '1';
    }
    
    await new Promise(r => setTimeout(r, 300));
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

/**
 * FunGalleryPageHandler - Handles fun gallery page rendering
 * FSD: features/page-manager → fun gallery page logic
 * REUSED: ImageViewer component
 * 
 * @class FunGalleryPageHandler
 */
export class FunGalleryPageHandler {
  constructor(options = {}) {
    this.eventBus = options.eventBus;
    this.pageContainer = options.pageContainer;
    this.imageViewer = null;
  }

  /**
   * Load fun items from backend
   * @returns {Promise<Array>} Fun items array
   */
  async load() {
    const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:8000/api/fun'
      : '/api/fun';

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to load fun items: ${response.statusText}`);
    }

    const data = await response.json();
    return { items: data.items || [] };
  }

  /**
   * Render fun gallery page HTML
   * @param {Object} data - Page data
   * @returns {string} HTML content
   */
  render(data) {
    const { items } = data;

    return `
      <div class="page-wrapper" data-page="fun-gallery">
        <button class="page-back" data-action="back-to-desktop" aria-label="Back to desktop">
          <img src="/assets/icons/iconamoon_arrow-down-2.svg" alt="Back" style="transform: rotate(90deg);" />
        </button>
        
        <button class="page-close" data-action="back-to-desktop" aria-label="Close page">
          <img src="/assets/icons/iconamoon_close.svg" alt="Close" />
        </button>
        
        <div class="fun-gallery">
          ${items.map(item => this.renderGalleryItem(item)).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render single gallery item
   * REUSED: Universal gallery-item classes from gallery-shared.css
   * @param {Object} item - Fun item
   * @returns {string} HTML content
   */
  renderGalleryItem(item) {
    const { id, image, description, title } = item;

    return `
      <article class="fun-gallery-item gallery-item" data-id="${this.escapeHtml(id)}" data-image="${this.escapeHtml(image)}">
        <div class="fun-gallery-item-image gallery-item-image">
          <img src="${this.escapeHtml(image)}" alt="${this.escapeHtml(title || description || 'Fun item')}" loading="lazy" />
        </div>
        ${description ? `
          <div class="gallery-item-content">
            <p class="fun-gallery-item-description gallery-item-description">${this.escapeHtml(description)}</p>
          </div>
        ` : ''}
      </article>
    `;
  }

  /**
   * Setup event listeners
   */
  async setupEvents() {
    // Close button
    const closeButton = this.pageContainer.querySelector('.page-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.eventBus?.emit('page:close'));
      closeButton.classList.add('page-close--visible');
    }

    // Back button
    const backButton = this.pageContainer.querySelector('.page-back');
    if (backButton) {
      backButton.addEventListener('click', () => this.eventBus?.emit('page:close'));
      backButton.classList.add('page-back--visible');
    }

    // Image click handlers
    await this.setupImageViewers();
  }

  /**
   * Setup image click handlers for fullscreen viewing
   */
  async setupImageViewers() {
    const { ImageViewer } = await import('../../shared/ui/image-viewer/image-viewer.js');
    
    if (!this.imageViewer) {
      this.imageViewer = new ImageViewer({ eventBus: this.eventBus });
    }

    const items = this.pageContainer.querySelectorAll('.fun-gallery-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        const image = item.dataset.image;
        const description = item.querySelector('.fun-gallery-item-description')?.textContent || '';
        if (image) {
          this.imageViewer.open(image, description);
        }
      });

      item.addEventListener('mouseenter', () => item.classList.add('fun-gallery-item--hovered'));
      item.addEventListener('mouseleave', () => item.classList.remove('fun-gallery-item--hovered'));
    });
  }

  /**
   * Escape HTML
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Cleanup
   */
  destroy() {
    this.imageViewer = null;
  }
}
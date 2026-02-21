/* ANCHOR: image_viewer_component */
/* FSD: shared/ui/image-viewer → Fullscreen image viewer component */
/* SCALED FOR: Smooth animations and keyboard navigation */
/* UPDATED COMMENTS: Fullscreen image viewer with close button */

/**
 * ImageViewer class - Fullscreen image viewer
 * CRITICAL: Shows images at 95% screen size with close button
 * REUSED: Modal-like overlay pattern
 * 
 * @class ImageViewer
 */
export class ImageViewer {
  constructor(options = {}) {
    this.eventBus = options.eventBus;
    this.viewerElement = null;
    this.isOpen = false;
  }

  /**
   * Open image viewer with specified image
   * CRITICAL: Creates fullscreen overlay with image
   * 
   * @param {string} imageSrc - Image source URL
   * @param {string} imageAlt - Image alt text
   */
  open(imageSrc, imageAlt = '') {
    if (this.isOpen) return;
    
    this.isOpen = true;
    
    // CRITICAL: Create viewer element
    this.viewerElement = document.createElement('div');
    this.viewerElement.className = 'image-viewer';
    this.viewerElement.innerHTML = `
      <div class="image-viewer__overlay"></div>
      <div class="image-viewer__container">
        <img 
          src="${this.escapeHtml(imageSrc)}" 
          alt="${this.escapeHtml(imageAlt)}"
          class="image-viewer__image"
        />
        <button class="image-viewer__close" aria-label="Close image viewer">
          <img src="/assets/icons/iconamoon_close.svg" alt="Close" />
        </button>
      </div>
    `;
    
    // UPDATED COMMENTS: Append to body
    document.body.appendChild(this.viewerElement);
    
    // SCALED FOR: Smooth fade-in animation
    requestAnimationFrame(() => {
      this.viewerElement.classList.add('image-viewer--visible');
      
      // CRITICAL: Show close button with delay like page-close
      const closeButton = this.viewerElement.querySelector('.image-viewer__close');
      if (closeButton) {
        closeButton.classList.add('image-viewer__close--visible');
      }
    });
    
    // REUSED: Event listeners
    this.bindEvents();
    
    // CRITICAL: Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close image viewer
   * SCALED FOR: Smooth fade-out animation
   */
  close() {
    if (!this.isOpen || !this.viewerElement) return;
    
    this.isOpen = false;
    
    // UPDATED COMMENTS: Fade out animation
    this.viewerElement.classList.remove('image-viewer--visible');
    
    // CRITICAL: Remove from DOM after animation
    setTimeout(() => {
      if (this.viewerElement && this.viewerElement.parentNode) {
        this.viewerElement.parentNode.removeChild(this.viewerElement);
      }
      this.viewerElement = null;
    }, 300);
    
    // CRITICAL: Restore body scroll
    document.body.style.overflow = '';
  }

  /**
   * Bind event listeners
   * UPDATED COMMENTS: Close button, overlay click, and keyboard
   */
  bindEvents() {
    if (!this.viewerElement) return;
    
    // CRITICAL: Close button click
    const closeButton = this.viewerElement.querySelector('.image-viewer__close');
    closeButton.addEventListener('click', () => this.close());
    
    // UPDATED COMMENTS: Overlay click to close
    const overlay = this.viewerElement.querySelector('.image-viewer__overlay');
    overlay.addEventListener('click', () => this.close());
    
    // REUSED: Keyboard navigation (Escape key)
    this.handleKeydown = (event) => {
      if (event.key === 'Escape') {
        this.close();
      }
    };
    document.addEventListener('keydown', this.handleKeydown);
  }

  /**
   * Escape HTML to prevent XSS
   * CRITICAL: Security-first content handling
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Destroy viewer and cleanup
   * SCALED FOR: Memory management
   */
  destroy() {
    this.close();
    if (this.handleKeydown) {
      document.removeEventListener('keydown', this.handleKeydown);
    }
  }
}

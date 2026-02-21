/* ANCHOR: pdf_viewer_component */
/* FSD: shared/ui/pdf-viewer → Fullscreen PDF viewer component */
/* REUSED: ImageViewer pattern for fullscreen display */
/* SCALED FOR: Smooth animations and keyboard navigation */
/* UPDATED COMMENTS: Fullscreen PDF viewer with iframe embed */

/**
 * PDFViewer class - Fullscreen PDF viewer
 * CRITICAL: Shows PDF at 95% screen size with close button
 * REUSED: Modal-like overlay pattern from ImageViewer
 * 
 * @class PDFViewer
 */
export class PDFViewer {
  constructor(options = {}) {
    this.eventBus = options.eventBus;
    this.viewerElement = null;
    this.isOpen = false;
  }

  /**
   * Open PDF viewer with specified PDF file
   * CRITICAL: Creates fullscreen overlay with embedded PDF
   * UPDATED COMMENTS: Uses iframe for native browser PDF rendering
   * 
   * @param {string} pdfSrc - PDF source URL
   * @param {string} pdfTitle - PDF title for accessibility
   */
  open(pdfSrc, pdfTitle = 'Resume') {
    if (this.isOpen) return;
    
    this.isOpen = true;
    
    // CRITICAL: Create viewer element
    this.viewerElement = document.createElement('div');
    this.viewerElement.className = 'pdf-viewer';
    this.viewerElement.innerHTML = `
      <div class="pdf-viewer__overlay"></div>
      <div class="pdf-viewer__container">
        <iframe 
          src="${this.escapeHtml(pdfSrc)}" 
          title="${this.escapeHtml(pdfTitle)}"
          class="pdf-viewer__iframe"
          frameborder="0"
        ></iframe>
        <button class="pdf-viewer__close" aria-label="Close PDF viewer">
          <img src="/assets/icons/iconamoon_close.svg" alt="Close" />
        </button>
      </div>
    `;
    
    // UPDATED COMMENTS: Append to body
    document.body.appendChild(this.viewerElement);
    
    // SCALED FOR: Smooth fade-in animation
    requestAnimationFrame(() => {
      this.viewerElement.classList.add('pdf-viewer--visible');
      
      // CRITICAL: Show close button with delay like ImageViewer
      const closeButton = this.viewerElement.querySelector('.pdf-viewer__close');
      if (closeButton) {
        closeButton.classList.add('pdf-viewer__close--visible');
      }
    });
    
    // REUSED: Event listeners
    this.bindEvents();
    
    // CRITICAL: Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // REUSED: Emit event
    if (this.eventBus) {
      this.eventBus.emit('pdf-viewer:opened', { pdfSrc, pdfTitle });
    }
  }

  /**
   * Close PDF viewer
   * SCALED FOR: Smooth fade-out animation
   */
  close() {
    if (!this.isOpen || !this.viewerElement) return;
    
    this.isOpen = false;
    
    // UPDATED COMMENTS: Fade out animation
    this.viewerElement.classList.remove('pdf-viewer--visible');
    
    // CRITICAL: Remove from DOM after animation
    setTimeout(() => {
      if (this.viewerElement && this.viewerElement.parentNode) {
        this.viewerElement.parentNode.removeChild(this.viewerElement);
      }
      this.viewerElement = null;
    }, 300);
    
    // CRITICAL: Restore body scroll
    document.body.style.overflow = '';
    
    // REUSED: Emit event
    if (this.eventBus) {
      this.eventBus.emit('pdf-viewer:closed');
    }
  }

  /**
   * Bind event listeners
   * UPDATED COMMENTS: Close button, overlay click, and keyboard
   * REUSED: Same pattern as ImageViewer
   */
  bindEvents() {
    if (!this.viewerElement) return;
    
    // CRITICAL: Close button click
    const closeButton = this.viewerElement.querySelector('.pdf-viewer__close');
    closeButton.addEventListener('click', () => this.close());
    
    // UPDATED COMMENTS: Overlay click to close
    const overlay = this.viewerElement.querySelector('.pdf-viewer__overlay');
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

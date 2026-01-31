/* ANCHOR: sticker_widget */
/* FSD: widgets/sticker → customizable note sticker implementation */
/* REUSED: WidgetBase class with content-specific functionality */

import { WidgetBase } from '../../entities/widget/widget-base.js';

/**
 * StickerWidget - Customizable note sticker with professional typography
 * Features: Title/body content, multiple sizes, gradient backgrounds
 * 
 * @class StickerWidget
 * @extends WidgetBase
 */
export class StickerWidget extends WidgetBase {
  constructor(element, options = {}) {
    super(element, { ...options, type: 'sticker' });
    
    this.title = options.title || 'Note';
    this.content = options.content || 'Click to edit this note';
    this.size = options.size || 'medium'; // small, medium, large
    this.theme = options.theme || 'yellow'; // yellow, blue, green, pink
    
    this.createStickerContent();
  }

  /**
   * Create sticker content with title and body
   * UPDATED COMMENTS: Use innerElement for content to separate from wrapper
   */
  createStickerContent() {
    const targetElement = this.innerElement || this.element;
    targetElement.innerHTML = `
      <div class="sticker-container sticker-container--${this.size} sticker-container--${this.theme}">
        <div class="sticker-title">${this.escapeHtml(this.title)}</div>
        <div class="sticker-body">${this.formatContent(this.content)}</div>
      </div>
    `;
  }

  /**
   * Format content with paragraph support
   * REUSED: Content formatting utility for rich text display
   */
  formatContent(content) {
    if (!content) return '';
    
    // Split by double newlines for paragraphs
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    return paragraphs
      .map(paragraph => `<p>${this.escapeHtml(paragraph.trim())}</p>`)
      .join('');
  }

  /**
   * Escape HTML to prevent XSS
   * SCALED FOR: Security-first content handling
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Update sticker content
   * UPDATED COMMENTS: Dynamic content updates with re-rendering
   */
  updateContent(title, content) {
    this.title = title || this.title;
    this.content = content || this.content;
    this.createStickerContent();
    
    // Emit content update event
    if (this.eventBus) {
      this.eventBus.emit('sticker:updated', {
        widget: this,
        title: this.title,
        content: this.content
      });
    }
  }

  /**
   * Change sticker theme
   * REUSED: Theme switching utility for visual variety
   */
  setTheme(theme) {
    const validThemes = ['yellow', 'blue', 'green', 'pink', 'purple'];
    
    if (validThemes.includes(theme)) {
      this.theme = theme;
      this.createStickerContent();
    }
  }

  /**
   * Change sticker size
   * SCALED FOR: Responsive sizing with consistent ratios
   */
  setSize(size) {
    const validSizes = ['small', 'medium', 'large'];
    
    if (validSizes.includes(size)) {
      this.size = size;
      this.createStickerContent();
    }
  }

  /**
   * Widget-specific click handler
   * UPDATED COMMENTS: Click functionality disabled
   */
  onClick(data) {
    // DISABLED - no click functionality needed
    return;
  }

  /**
   * Widget-specific long press handler
   * REUSED: Context menu pattern for additional options
   */
  onLongPress(data) {
    // Cycle through themes on long press
    const themes = ['yellow', 'blue', 'green', 'pink', 'purple'];
    const currentIndex = themes.indexOf(this.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    
    this.setTheme(nextTheme);
  }

  /**
   * Get sticker data for serialization
   * SCALED FOR: Data persistence and export functionality
   */
  getData() {
    return {
      ...super.getInfo(),
      title: this.title,
      content: this.content,
      size: this.size,
      theme: this.theme
    };
  }
}
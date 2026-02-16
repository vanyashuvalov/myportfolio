/* ANCHOR: sticker_widget */
/* FSD: widgets/sticker → customizable note sticker implementation */
/* REUSED: WidgetBase class with content-specific functionality */

import { WidgetBase } from '../../entities/widget/widget-base.js';
import { WidgetButton } from '../../shared/ui/widget-button/widget-button.js';
import { getSocialLink } from '../../shared/config/social-links.js';

/**
 * StickerWidget - Customizable note sticker with professional typography
 * Features: Title/body content, multiple sizes, gradient backgrounds, optional button
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
    this.showButton = options.showButton !== false; // Show button by default
    this.buttonText = options.buttonText || 'Tell Me More';
    this.buttonUrl = options.buttonUrl || '#';
    
    this.createStickerContent();
  }

  /**
   * Create sticker content with title and body
   * UPDATED COMMENTS: Use shared WidgetButton component
   */
  createStickerContent() {
    const targetElement = this.innerElement || this.element;
    
    targetElement.innerHTML = `
      <div class="sticker-container sticker-container--${this.size} sticker-container--${this.theme}">
        <div class="sticker-title">${this.escapeHtml(this.title)}</div>
        <div class="sticker-body">${this.formatContent(this.content)}</div>
        <div class="sticker-button-container"></div>
      </div>
    `;
    
    // CRITICAL: Add button using shared component if enabled
    if (this.showButton) {
      this.createButton();
    }
  }

  /**
   * Create button using shared WidgetButton component
   * REUSED: Shared button component for consistent styling
   */
  createButton() {
    const buttonContainer = this.element.querySelector('.sticker-button-container');
    if (!buttonContainer) return;
    
    // UPDATED COMMENTS: Telegram icon SVG for Chat Me button
    const telegramIcon = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.7101 3.65451C20.7101 3.65451 22.6526 2.89701 22.4901 4.73651C22.4366 5.49401 21.9511 8.14551 21.5731 11.013L20.2781 19.508C20.2781 19.508 20.1701 20.7525 19.1986 20.969C18.2276 21.185 16.7706 20.2115 16.5006 19.995C16.2846 19.8325 12.4536 17.3975 11.1046 16.2075C10.7266 15.8825 10.2946 15.2335 11.1586 14.476L16.8246 9.06501C17.4721 8.41501 18.1196 6.90001 15.4216 8.74001L7.86665 13.88C7.86665 13.88 7.00315 14.4215 5.38465 13.9345L1.87665 12.852C1.87665 12.852 0.581647 12.0405 2.79415 11.229C8.19065 8.68601 14.8281 6.08901 20.7096 3.65401" fill="currentColor"/>
      </svg>
    `;
    
    // SCALED FOR: Button creation with shared component and social links
    const telegramLink = getSocialLink('telegram');
    
    this.button = new WidgetButton({
      text: this.buttonText,
      icon: telegramIcon,
      onClick: () => this.handleButtonClick(),
      className: 'sticker-button'
    });
    
    const buttonElement = this.button.createElement();
    buttonContainer.appendChild(buttonElement);
  }

  /**
   * Handle button click action
   * UPDATED COMMENTS: Button click handler with URL navigation
   */
  handleButtonClick() {
    // Emit button click event
    if (this.eventBus) {
      this.eventBus.emit('sticker:button-clicked', {
        widget: this,
        buttonText: this.buttonText,
        buttonUrl: this.buttonUrl
      });
    }
    
    // Navigate to URL if provided
    if (this.buttonUrl && this.buttonUrl !== '#') {
      window.open(this.buttonUrl, '_blank');
    }
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
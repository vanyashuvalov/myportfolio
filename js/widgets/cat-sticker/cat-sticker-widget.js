/* ANCHOR: cat_sticker_widget */
/* FSD: widgets/cat-sticker → cat information sticker implementation */
/* REUSED: WidgetBase class with cat-specific functionality */

import { WidgetBase } from '../../entities/widget/widget-base.js';
import { WidgetButton } from '../../shared/ui/widget-button/widget-button.js';
import { SOCIAL_LINKS, getIconPath } from '../../shared/config/social-links.js';

/**
 * CatStickerWidget - Information sticker about the interactive cat
 * Features: Cat status display, feeding button, heart icon, blue gradient theme
 * 
 * @class CatStickerWidget
 * @extends WidgetBase
 */
export class CatStickerWidget extends WidgetBase {
  constructor(element, options = {}) {
    super(element, { ...options, type: 'cat-sticker' });
    
    // UPDATED COMMENTS: Cat sticker configuration with Figma specifications
    this.catName = options.catName || 'Cat Here';
    this.description = options.description || 'You can interact my boy as you want. But do not punch him';
    this.showFeedButton = options.showFeedButton !== false;
    this.targetCat = options.targetCat || null; // Reference to cat widget for feeding
    
    this.createCatStickerContent();
  }

  /**
   * Create cat sticker content with exact Figma specifications
   * UPDATED COMMENTS: 300x191px blue gradient sticker with flexbox layout and cat face icon
   */
  createCatStickerContent() {
    const targetElement = this.innerElement || this.element;
    targetElement.innerHTML = `
      <div class="cat-sticker-container">
        <!-- CRITICAL: Cat name title with exact Figma typography -->
        <div class="cat-sticker-title">${this.escapeHtml(this.catName)}</div>
        
        <!-- REUSED: Description text with proper line height -->
        <div class="cat-sticker-description">${this.escapeHtml(this.description)}</div>
        
        <!-- CRITICAL: Chat Me button container for shared WidgetButton -->
        <div class="cat-sticker-button-container"></div>
        
        <!-- CRITICAL: Cat face icon in bottom right corner -->
        <div class="cat-sticker-cat-icon">
          <img src="assets/images/dinkie-icons_cat-face.svg" alt="Cat face icon" />
        </div>
      </div>
    `;
    
    // REUSED: Create shared WidgetButton component
    this.createChatButton();
  }

  /**
   * Create Chat Me button using shared WidgetButton component
   * REUSED: Shared WidgetButton with Telegram icon and link
   */
  createChatButton() {
    const buttonContainer = this.element.querySelector('.cat-sticker-button-container');
    if (!buttonContainer) return;
    
    // CRITICAL: Load Telegram icon from assets
    const telegramIcon = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.13-.31-1.09-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06-.01.24-.02.38z" fill="currentColor"/>
      </svg>
    `;
    
    // UPDATED COMMENTS: Create WidgetButton with Chat Me text and Telegram functionality
    this.chatButton = new WidgetButton({
      text: 'Chat Me',
      icon: telegramIcon,
      onClick: () => this.handleChatClick(),
      className: 'cat-sticker-chat-button',
      variant: 'default'
    });
    
    // SCALED FOR: Append button to container
    const buttonElement = this.chatButton.createElement();
    buttonContainer.appendChild(buttonElement);
  }

  /**
   * Handle Chat Me button click
   * REUSED: Social links configuration for Telegram navigation
   */
  handleChatClick() {
    // CRITICAL: Open Telegram link from centralized config
    const telegramLink = SOCIAL_LINKS.telegram.url;
    window.open(telegramLink, '_blank', 'noopener,noreferrer');
    
    // UPDATED COMMENTS: Visual feedback for button press
    if (this.chatButton && this.chatButton.element) {
      this.chatButton.element.classList.add('widget-button--pressed');
      
      setTimeout(() => {
        this.chatButton.element.classList.remove('widget-button--pressed');
      }, 150);
    }
    
    console.log('Cat sticker: Chat Me button clicked - opening Telegram');
  }

  /**
   * Update cat information
   * UPDATED COMMENTS: Dynamic content updates for cat status changes
   */
  updateCatInfo(catName, description) {
    this.catName = catName || this.catName;
    this.description = description || this.description;
    
    // REUSED: Content re-rendering pattern
    this.createCatStickerContent();
    
    // Emit update event
    if (this.eventBus) {
      this.eventBus.emit('cat-sticker:updated', {
        widget: this,
        catName: this.catName,
        description: this.description
      });
    }
  }

  /**
   * Set target cat for feeding
   * SCALED FOR: Dynamic cat widget targeting
   */
  setTargetCat(catWidget) {
    this.targetCat = catWidget;
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
   * Widget-specific click handler
   * UPDATED COMMENTS: Click functionality disabled for sticker area
   */
  onClick(data) {
    // DISABLED - only feed button should be clickable
    return;
  }

  /**
   * Widget-specific long press handler
   * REUSED: Context menu pattern for cat sticker options
   */
  onLongPress(data) {
    // Could show cat status menu or edit options
    console.log('Cat sticker long press - could show cat status');
  }

  /**
   * Get cat sticker data for serialization
   * SCALED FOR: Data persistence and export functionality
   */
  getData() {
    return {
      ...super.getInfo(),
      catName: this.catName,
      description: this.description,
      showFeedButton: this.showFeedButton,
      targetCat: this.targetCat?.id || null
    };
  }
}
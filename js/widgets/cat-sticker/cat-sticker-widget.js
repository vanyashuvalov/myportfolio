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
   * REUSED: Shared WidgetButton with heart icon and Telegram link
   * UPDATED COMMENTS: Changed from Telegram icon to heart icon for better UX
   */
  createChatButton() {
    const buttonContainer = this.element.querySelector('.cat-sticker-button-container');
    if (!buttonContainer) return;
    
    // CRITICAL: Load heart icon from assets instead of Telegram icon
    // UPDATED COMMENTS: Heart icon represents love/care for the cat
    const heartIcon = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.0712 13.1437L13.4142 18.8017C13.0391 19.1767 12.5305 19.3873 12.0002 19.3873C11.4699 19.3873 10.9613 19.1767 10.5862 18.8017L4.9292 13.1447C4.46157 12.6812 4.09011 12.1298 3.83613 11.5223C3.58216 10.9148 3.45067 10.2632 3.44923 9.6047C3.44779 8.94625 3.57642 8.294 3.82773 7.68539C4.07904 7.07679 4.44809 6.52381 4.91369 6.05822C5.37928 5.59262 5.93226 5.22357 6.54086 4.97226C7.14947 4.72095 7.80172 4.59232 8.46017 4.59376C9.11862 4.5952 9.7703 4.72669 10.3778 4.98066C10.9853 5.23464 11.5367 5.6061 12.0002 6.07373C12.9418 5.15561 14.2072 4.6454 15.5222 4.65364C16.8373 4.66188 18.0962 5.1879 19.0262 6.11776C19.9562 7.04761 20.4824 8.30643 20.4908 9.62151C20.4992 10.9366 19.9892 12.202 19.0712 13.1437Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    
    // UPDATED COMMENTS: Create WidgetButton with Chat Me text and heart icon
    this.chatButton = new WidgetButton({
      text: 'Chat Me',
      icon: heartIcon,
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
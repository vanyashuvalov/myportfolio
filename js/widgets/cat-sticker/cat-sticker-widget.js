/* ANCHOR: cat_sticker_widget */
/* FSD: widgets/cat-sticker → cat information sticker implementation */
/* REUSED: WidgetBase class with cat-specific functionality */

import { WidgetBase } from '../../entities/widget/widget-base.js';

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
    this.setupFeedButton();
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
        
        <!-- CRITICAL: Feed button with heart icon and exact styling -->
        <div class="cat-sticker-feed-button" data-action="feed">
          <!-- REUSED: Heart icon with proper opacity -->
          <div class="cat-sticker-heart-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39467C21.7563 5.72723 21.351 5.1208 20.84 4.61V4.61Z" 
                    stroke="currentColor" 
                    stroke-width="2" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"/>
            </svg>
          </div>
          
          <!-- CRITICAL: Feed text with SF UI Display font -->
          <span class="cat-sticker-feed-text">Feed</span>
        </div>
        
        <!-- CRITICAL: Cat face icon in bottom right corner -->
        <div class="cat-sticker-cat-icon">
          <img src="assets/images/dinkie-icons_cat-face.svg" alt="Cat face icon" />
        </div>
      </div>
    `;
  }

  /**
   * Setup feed button interaction
   * SCALED FOR: Cat feeding system integration with event bus
   */
  setupFeedButton() {
    const feedButton = this.element.querySelector('.cat-sticker-feed-button');
    if (!feedButton) return;
    
    // UPDATED COMMENTS: Click handler for cat feeding
    feedButton.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent widget drag
      this.handleFeedClick();
    });
    
    // REUSED: Hover effects for button interactivity
    feedButton.addEventListener('mouseenter', () => {
      feedButton.classList.add('cat-sticker-feed-button--hovered');
    });
    
    feedButton.addEventListener('mouseleave', () => {
      feedButton.classList.remove('cat-sticker-feed-button--hovered');
    });
  }

  /**
   * Handle feed button click
   * REUSED: Event bus pattern for cat feeding communication
   */
  handleFeedClick() {
    // CRITICAL: Emit cat feeding event through event bus
    if (this.eventBus) {
      this.eventBus.emit('cat:feed-requested', {
        source: 'cat-sticker',
        widget: this,
        targetCat: this.targetCat,
        foodType: 'kibble'
      });
    }
    
    // UPDATED COMMENTS: Visual feedback for button press
    const feedButton = this.element.querySelector('.cat-sticker-feed-button');
    if (feedButton) {
      feedButton.classList.add('cat-sticker-feed-button--pressed');
      
      setTimeout(() => {
        feedButton.classList.remove('cat-sticker-feed-button--pressed');
      }, 150);
    }
    
    console.log('Cat sticker: Feed button clicked!');
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
    this.setupFeedButton();
    
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
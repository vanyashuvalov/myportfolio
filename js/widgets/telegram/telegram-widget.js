/* ANCHOR: telegram_widget */
/* FSD: widgets/telegram → telegram channel post widget implementation */
/* REUSED: WidgetBase class with telegram-specific functionality */

import { WidgetBase } from '../../entities/widget/widget-base.js';

/**
 * TelegramWidget - Latest post from telegram channel display
 * Features: Channel avatar, name, post content, views, timestamp, external link
 * 
 * @class TelegramWidget
 * @extends WidgetBase
 */
export class TelegramWidget extends WidgetBase {
  constructor(element, options = {}) {
    super(element, { ...options, type: 'telegram' });
    
    // UPDATED COMMENTS: Telegram widget configuration with Figma specifications
    this.channelName = options.channelName || 'ваня кнопочкин';
    this.channelType = options.channelType || 'Telegram Channel';
    this.channelAvatar = options.channelAvatar || 'assets/images/telegram-avatar.jpg';
    this.postText = options.postText || 'москва газ соревнования по счету в уме';
    this.viewCount = options.viewCount || 43;
    this.timestamp = options.timestamp || '0:58 Jan 27';
    this.channelUrl = options.channelUrl || '#';
    
    this.createTelegramContent();
    this.setupExternalLink();
  }

  /**
   * Create telegram widget content with exact Figma specifications
   * UPDATED COMMENTS: 300x161px white widget with header, post content, info and cat icons gradient
   */
  createTelegramContent() {
    const targetElement = this.innerElement || this.element;
    targetElement.innerHTML = `
      <div class="telegram-container">
        <!-- CRITICAL: Header section with avatar, channel info and external link -->
        <div class="telegram-header">
          <!-- REUSED: Channel avatar with rounded styling -->
          <div class="telegram-avatar">
            <img src="${this.channelAvatar}" alt="${this.escapeHtml(this.channelName)} avatar" />
          </div>
          
          <!-- CRITICAL: Channel information section -->
          <div class="telegram-channel-info">
            <div class="telegram-channel-name">${this.escapeHtml(this.channelName)}</div>
            <div class="telegram-channel-type">${this.escapeHtml(this.channelType)}</div>
          </div>
          
          <!-- REUSED: External link arrow icon -->
          <div class="telegram-external-link" data-action="open-channel">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 17L17 7M17 7H7M17 7V17" 
                    stroke="currentColor" 
                    stroke-width="2" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        
        <!-- CRITICAL: Post content section -->
        <div class="telegram-post">
          <!-- UPDATED COMMENTS: Post text with proper line height -->
          <div class="telegram-post-text">${this.escapeHtml(this.postText)}</div>
          
          <!-- CRITICAL: Post info with views and timestamp -->
          <div class="telegram-post-info">
            <!-- REUSED: Views section with eye icon from iconamoon -->
            <div class="telegram-views">
              <div class="telegram-views-icon">
                <!-- UPDATED COMMENTS: 16x16px eye icon from assets/icons/iconamoon_eye.svg -->
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g opacity="0.6">
                    <path d="M14.999 12C14.999 12.7956 14.683 13.5587 14.1203 14.1213C13.5577 14.6839 12.7947 15 11.999 15C11.2034 15 10.4403 14.6839 9.8777 14.1213C9.31509 13.5587 8.99902 12.7956 8.99902 12C8.99902 11.2044 9.31509 10.4413 9.8777 9.87868C10.4403 9.31607 11.2034 9 11.999 9C12.7947 9 13.5577 9.31607 14.1203 9.87868C14.683 10.4413 14.999 11.2044 14.999 12Z" stroke="#0E1621" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M1.99805 12C3.59805 7.903 7.33405 5 11.998 5C16.662 5 20.398 7.903 21.998 12C20.398 16.097 16.662 19 11.998 19C7.33405 19 3.59805 16.097 1.99805 12Z" stroke="#0E1621" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </g>
                </svg>
              </div>
              <span class="telegram-views-count">${this.viewCount}</span>
            </div>
            
            <!-- REUSED: Timestamp section with clock icon from iconamoon -->
            <div class="telegram-time">
              <div class="telegram-time-icon">
                <!-- UPDATED COMMENTS: 16x16px clock icon from assets/icons/iconamoon_clock.svg -->
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g opacity="0.6">
                    <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#0E1621" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10.999 8V13H15.999" stroke="#0E1621" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </g>
                </svg>
              </div>
              <span class="telegram-time-text">${this.escapeHtml(this.timestamp)}</span>
            </div>
          </div>
        </div>
        
        <!-- CRITICAL: Cat icons gradient in bottom right corner -->
        <div class="telegram-cat-gradient">
          ${this.createCatIconsGradient()}
        </div>
      </div>
    `;
  }

  /**
   * Create cat icons gradient with right-based Figma positioning
   * UPDATED COMMENTS: 9 cat icons with exact right-based coordinates from Figma specs
   * SCALED FOR: Right-based positioning within 89x88px container
   */
  createCatIconsGradient() {
    // CRITICAL: Right-based Figma positioning for each cat icon
    const catIcons = [
      // UPDATED COMMENTS: Cat icons with exact right-based Figma positioning
      { right: 67.58, top: 63.71, size: 18, opacity: 0.5 },
      { right: 7.87, top: 80.75, size: 18, opacity: 1.0 },
      { right: 33.2, top: 42.3, size: 18, opacity: 1.0 },
      { right: 63.01, top: 34.86, size: 14, opacity: 0.6 },
      { right: 18.68, top: 16.62, size: 14, opacity: 1.0 },
      { right: 80.54, top: 9.58, size: 12, opacity: 0.22 },
      { right: 50.56, top: 11.1, size: 12, opacity: 0.5 },
      { right: 4.21, top: 48.92, size: 12, opacity: 1.0 },
      { right: 39.71, top: 75.27, size: 14, opacity: 0.7 }
    ];
    
    return catIcons.map((icon, index) => `
      <div class="telegram-cat-icon" 
           style="
             position: absolute;
             right: ${icon.right}px; 
             top: ${icon.top}px; 
             width: ${icon.size}px; 
             height: ${icon.size}px; 
             opacity: ${icon.opacity};
             transform: rotate(1deg);
           ">
        <img src="assets/images/streamline_cat-1-solid.svg" alt="Cat icon ${index + 1}" />
      </div>
    `).join('');
  }

  /**
   * Setup external link functionality
   * SCALED FOR: Channel opening with proper event handling
   */
  setupExternalLink() {
    const externalLink = this.element.querySelector('.telegram-external-link');
    if (!externalLink) return;
    
    // UPDATED COMMENTS: Click handler for opening telegram channel
    externalLink.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent widget drag
      this.handleExternalLinkClick();
    });
    
    // REUSED: Hover effects for link interactivity
    externalLink.addEventListener('mouseenter', () => {
      externalLink.classList.add('telegram-external-link--hovered');
    });
    
    externalLink.addEventListener('mouseleave', () => {
      externalLink.classList.remove('telegram-external-link--hovered');
    });
  }

  /**
   * Handle external link click
   * REUSED: External link opening pattern with event bus
   */
  handleExternalLinkClick() {
    // CRITICAL: Open telegram channel in new tab
    if (this.channelUrl && this.channelUrl !== '#') {
      window.open(this.channelUrl, '_blank', 'noopener,noreferrer');
    }
    
    // UPDATED COMMENTS: Emit external link event
    if (this.eventBus) {
      this.eventBus.emit('telegram:channel-opened', {
        widget: this,
        channelName: this.channelName,
        channelUrl: this.channelUrl
      });
    }
    
    console.log('Telegram widget: Channel link clicked!');
  }

  /**
   * Update telegram post content
   * UPDATED COMMENTS: Dynamic content updates for new posts
   */
  updatePost(postData) {
    if (postData.text) this.postText = postData.text;
    if (postData.viewCount !== undefined) this.viewCount = postData.viewCount;
    if (postData.timestamp) this.timestamp = postData.timestamp;
    
    // REUSED: Content re-rendering pattern
    this.createTelegramContent();
    this.setupExternalLink();
    
    // Emit update event
    if (this.eventBus) {
      this.eventBus.emit('telegram:post-updated', {
        widget: this,
        postData: {
          text: this.postText,
          viewCount: this.viewCount,
          timestamp: this.timestamp
        }
      });
    }
  }

  /**
   * Update channel information
   * SCALED FOR: Dynamic channel switching
   */
  updateChannel(channelData) {
    if (channelData.name) this.channelName = channelData.name;
    if (channelData.type) this.channelType = channelData.type;
    if (channelData.avatar) this.channelAvatar = channelData.avatar;
    if (channelData.url) this.channelUrl = channelData.url;
    
    // REUSED: Content re-rendering pattern
    this.createTelegramContent();
    this.setupExternalLink();
    
    // Emit channel update event
    if (this.eventBus) {
      this.eventBus.emit('telegram:channel-updated', {
        widget: this,
        channelData: {
          name: this.channelName,
          type: this.channelType,
          avatar: this.channelAvatar,
          url: this.channelUrl
        }
      });
    }
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
   * UPDATED COMMENTS: Click functionality for opening channel
   */
  onClick(data) {
    // Open channel on widget click
    this.handleExternalLinkClick();
  }

  /**
   * Widget-specific long press handler
   * REUSED: Context menu pattern for telegram options
   */
  onLongPress(data) {
    // Could show telegram options menu
    console.log('Telegram widget long press - could show options');
  }

  /**
   * Get telegram widget data for serialization
   * SCALED FOR: Data persistence and export functionality
   */
  getData() {
    return {
      ...super.getInfo(),
      channelName: this.channelName,
      channelType: this.channelType,
      channelAvatar: this.channelAvatar,
      postText: this.postText,
      viewCount: this.viewCount,
      timestamp: this.timestamp,
      channelUrl: this.channelUrl
    };
  }
}
/* ANCHOR: telegram_widget */
/* FSD: widgets/telegram → telegram channel post widget implementation */
/* REUSED: WidgetBase class with telegram-specific functionality */

import { WidgetBase } from '../../entities/widget/widget-base.js';
import { telegramApi } from '../../shared/api/telegram-api.js';
import { SOCIAL_LINKS } from '../../shared/config/social-links.js';

/**
 * TelegramWidget - Latest post from telegram channel display
 * Features: Channel avatar, name, post content, views, timestamp, external link
 * UPDATED COMMENTS: Now supports real-time data from MTProto API backend
 * SCALED FOR: Multiple channels, automatic updates, error handling
 * CRITICAL: Uses centralized channel configuration from social-links.js
 * 
 * @class TelegramWidget
 * @extends WidgetBase
 */
export class TelegramWidget extends WidgetBase {
  constructor(element, options = {}) {
    super(element, { ...options, type: 'telegram' });
    
    // CRITICAL: Use centralized channel configuration
    const telegramChannel = SOCIAL_LINKS.telegramChannel;
    
    // UPDATED COMMENTS: Channel configuration with API integration
    this.channelUsername = options.channelUsername || telegramChannel.username;
    this.updateInterval = options.updateInterval || 300000; // 5 minutes
    this.autoUpdate = options.autoUpdate !== false;
    
    // REUSED: Default fallback data
    this.channelData = {
      title: 'Loading...',
      username: this.channelUsername,
      avatar_url: null,
      description: '',
      verified: false
    };
    
    this.latestPost = {
      text: 'Loading channel data...',
      views: 0,
      formatted_date: 'Loading...',
      formatted_views: '0',
      link: '#'
    };
    
    // SCALED FOR: Loading and error states
    this.isLoading = true;
    this.hasError = false;
    this.lastUpdate = null;
    this.updateTimer = null;
    this.isInitialLoad = true; // CRITICAL: Track first load vs auto-updates
    
    this.initializeWidget();
  }

  /**
   * Initialize widget with data loading
   * UPDATED COMMENTS: Async initialization with error handling
   * CRITICAL: Setup external link AFTER content is created
   */
  async initializeWidget() {
    this.createTelegramContent();
    
    // SCALED FOR: Initial data loading
    await this.loadChannelData();
    
    // CRITICAL: Setup external link after content is created
    this.setupExternalLink();
    
    // REUSED: Auto-update setup
    if (this.autoUpdate) {
      this.startAutoUpdate();
    }
  }

  /**
   * Load channel data from API
   * UPDATED COMMENTS: Fetches real channel data with fallback handling
   * CRITICAL: Only shows loader on initial load, silent updates afterwards
   */
  async loadChannelData() {
    try {
      // CRITICAL: Store initial load flag before any async operations
      const wasInitialLoad = this.isInitialLoad;
      
      // CRITICAL: Only show loading state on initial load, not on auto-updates
      if (wasInitialLoad) {
        this.setLoadingState(true);
      }
      
      // REUSED: API call with error handling
      const response = await telegramApi.getLatestPost(this.channelUsername);
      
      if (response) {
        this.channelData = response.channel;
        this.latestPost = response.latest_post;
        this.lastUpdate = new Date();
        this.hasError = false;
        
        // UPDATED COMMENTS: Update UI with fresh data (no recreation on auto-update)
        if (wasInitialLoad) {
          // CRITICAL: First load - create full content
          this.isInitialLoad = false;
          this.setLoadingState(false);
          this.createTelegramContent();
          this.setupExternalLink();
        } else {
          // CRITICAL: Auto-update - only update text content, no recreation
          this.updateContent();
        }
      }
      
    } catch (error) {
      console.error('Failed to load channel data:', error);
      this.hasError = true;
      this.setErrorState();
      this.isInitialLoad = false;
    }
  }

  /**
   * Start automatic updates
   * SCALED FOR: Background data refresh without user interruption
   */
  startAutoUpdate() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
    
    this.updateTimer = setInterval(() => {
      this.loadChannelData();
    }, this.updateInterval);
  }

  /**
   * Stop automatic updates
   * REUSED: Cleanup utility for widget lifecycle
   */
  stopAutoUpdate() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  /**
   * Set loading state
   * UPDATED COMMENTS: Visual loading indicators WITHOUT content recreation
   * CRITICAL: Only used for initial load, not for auto-updates
   */
  setLoadingState(isLoading) {
    this.isLoading = isLoading;
    
    if (isLoading) {
      this.element.classList.add('telegram-loading');
      // CRITICAL: Show loading spinner only on initial load
      this.createTelegramContent();
    } else {
      this.element.classList.remove('telegram-loading');
      // CRITICAL: Content is created in loadChannelData(), not here
    }
  }

  /**
   * Set error state with fallback content
   * SCALED FOR: Graceful error handling with user feedback
   */
  setErrorState() {
    this.element.classList.add('telegram-error');
    
    // REUSED: Fallback to mock data on error
    this.channelData = {
      title: 'ваня кнопочкин',
      username: this.channelUsername,
      avatar_url: null,
      description: 'Product Designer',
      verified: false
    };
    
    this.latestPost = {
      text: 'Unable to load latest post',
      views: 0,
      formatted_date: 'Error',
      formatted_views: '0',
      link: `https://t.me/${this.channelUsername}`
    };
    
    this.updateContent();
  }

  /**
   * Update widget content with current data
   * REUSED: Content rendering separated from data loading
   * UPDATED COMMENTS: No longer recreates content, just updates text
   */
  updateContent() {
    // CRITICAL: Don't recreate - content already created in setLoadingState
    // Just update text values if needed for auto-refresh
    const channelNameEl = this.element.querySelector('.telegram-channel-name');
    const postTextEl = this.element.querySelector('.telegram-post-text');
    const viewsCountEl = this.element.querySelector('.telegram-views-count');
    const timeTextEl = this.element.querySelector('.telegram-time-text');
    
    if (channelNameEl) channelNameEl.textContent = this.channelData.title;
    if (postTextEl) postTextEl.textContent = this.latestPost.text;
    if (viewsCountEl) viewsCountEl.textContent = this.latestPost.formatted_views;
    if (timeTextEl) timeTextEl.textContent = this.latestPost.formatted_date;
    
    // REUSED: Update external link
    this.channelUrl = this.latestPost.link;
  }
  /**
   * Create telegram widget content with exact Figma specifications
   * UPDATED COMMENTS: 300x161px white widget with header, post content, info and cat icons gradient
   * SCALED FOR: Avatar loading with error handling and placeholder
   */
  createTelegramContent() {
    const targetElement = this.innerElement || this.element;
    
    // CRITICAL: Show only loader during initial loading, no mock data
    if (this.isLoading) {
      targetElement.innerHTML = `
        <div class="telegram-container telegram-container--loading">
          <div class="telegram-loading-overlay">
            <div class="telegram-loading-spinner"></div>
          </div>
        </div>
      `;
      return;
    }
    
    targetElement.innerHTML = `
      <div class="telegram-container">
        <!-- CRITICAL: Header section with avatar, channel info and external link -->
        <div class="telegram-header">
          <!-- REUSED: Channel avatar with rounded styling and error handling -->
          <div class="telegram-avatar">
            <img src="${this.getAvatarUrl()}" 
                 alt="${this.escapeHtml(this.channelData.title)} avatar"
                 onerror="this.src='/assets/images/telegram-avatar.jpg'; this.onerror=null;" />
          </div>
          
          <!-- CRITICAL: Channel information section -->
          <div class="telegram-channel-info">
            <div class="telegram-channel-name">${this.escapeHtml(this.channelData.title)}</div>
            <div class="telegram-channel-type">${this.getChannelType()}</div>
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
          <div class="telegram-post-text">${this.escapeHtml(this.latestPost.text)}</div>
          
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
              <span class="telegram-views-count">${this.latestPost.formatted_views}</span>
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
              <span class="telegram-time-text">${this.escapeHtml(this.latestPost.formatted_date)}</span>
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
   * Get avatar URL - use API data with fallback
   * UPDATED COMMENTS: Now uses API avatar_url with local fallback
   * SCALED FOR: Dynamic avatar loading with error handling
   */
  getAvatarUrl() {
    // CRITICAL: Use API avatar with fallback to local file
    if (this.channelData.avatar_url) {
      return this.channelData.avatar_url;
    }
    // REUSED: Fallback to local avatar file
    return '/assets/images/telegram-avatar.jpg';
  }

  /**
   * Get channel type with verification status
   * UPDATED COMMENTS: Dynamic channel type based on verification
   */
  getChannelType() {
    if (this.channelData.verified) {
      return 'Verified Channel';
    }
    return 'Telegram Channel';
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
        channelName: this.channelData.title,
        channelUrl: this.channelUrl
      });
    }
  }

  /**
   * Refresh channel data manually
   * REUSED: Manual refresh functionality for user interaction
   */
  async refresh() {
    await this.loadChannelData();
  }

  /**
   * Widget cleanup on destroy
   * SCALED FOR: Proper resource cleanup
   */
  destroy() {
    this.stopAutoUpdate();
    super.destroy && super.destroy();
  }

  /**
   * Update telegram post content
   * UPDATED COMMENTS: Dynamic content updates for new posts
   */
  updatePost(postData) {
    if (postData.text) this.latestPost.text = postData.text;
    if (postData.views !== undefined) this.latestPost.views = postData.views;
    if (postData.formatted_date) this.latestPost.formatted_date = postData.formatted_date;
    if (postData.formatted_views) this.latestPost.formatted_views = postData.formatted_views;
    
    // REUSED: Content re-rendering pattern
    this.updateContent();
    
    // Emit update event
    if (this.eventBus) {
      this.eventBus.emit('telegram:post-updated', {
        widget: this,
        postData: this.latestPost
      });
    }
  }

  /**
   * Update channel information
   * SCALED FOR: Dynamic channel switching
   */
  updateChannel(channelData) {
    if (channelData.title) this.channelData.title = channelData.title;
    if (channelData.username) this.channelData.username = channelData.username;
    if (channelData.avatar_url) this.channelData.avatar_url = channelData.avatar_url;
    if (channelData.description) this.channelData.description = channelData.description;
    if (channelData.verified !== undefined) this.channelData.verified = channelData.verified;
    
    // REUSED: Content re-rendering pattern
    this.updateContent();
    
    // Emit channel update event
    if (this.eventBus) {
      this.eventBus.emit('telegram:channel-updated', {
        widget: this,
        channelData: this.channelData
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
  onClick() {
    // Open channel on widget click
    this.handleExternalLinkClick();
  }

  /**
   * Widget-specific long press handler
   * REUSED: Context menu pattern for telegram options
   */
  onLongPress() {
    // Could show telegram options menu
  }

  /**
   * Get telegram widget data for serialization
   * SCALED FOR: Data persistence and export functionality
   */
  getData() {
    return {
      ...super.getInfo(),
      channelUsername: this.channelUsername,
      channelData: this.channelData,
      latestPost: this.latestPost,
      updateInterval: this.updateInterval,
      autoUpdate: this.autoUpdate,
      lastUpdate: this.lastUpdate,
      hasError: this.hasError
    };
  }
}
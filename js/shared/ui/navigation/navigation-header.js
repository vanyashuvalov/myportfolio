/* ANCHOR: navigation_header_component */
/* REUSED: Modular component architecture with EventBus integration */
/* SCALED FOR: Performance optimization and accessibility */
/* UPDATED COMMENTS: Refactored navigation header with centralized social links */

import { EventBus } from '../../utils/event-bus.js';
import { UserInfo } from './components/user-info.js';
import { Breadcrumb } from './components/breadcrumb.js';
import { ActionButtons } from './components/action-buttons.js';
import { SOCIAL_LINKS } from '../../config/social-links.js';

/**
 * NavigationHeader class - Main navigation component
 * Orchestrates user info, breadcrumb, and action button components
 * 
 * @class NavigationHeader
 */
export class NavigationHeader {
  constructor(container, options = {}) {
    this.container = container;
    this.eventBus = options.eventBus || new EventBus();
    this.options = {
      userName: 'Shuvalov Ivan',
      userPhoto: 'assets/images/avatar.jpg',
      statusText: 'Open for work',
      currentPage: 'Home',
      currentLanguage: 'EN',
      // UPDATED COMMENTS: Use centralized social links configuration
      socialLinks: {
        telegram: SOCIAL_LINKS.telegram.url,
        linkedin: SOCIAL_LINKS.linkedin.url,
        email: SOCIAL_LINKS.email.url,
        github: SOCIAL_LINKS.github.url
      },
      cvUrl: SOCIAL_LINKS.resume.url,
      ...options
    };
    
    // REUSED: Modular component initialization
    this.userInfo = new UserInfo(this.options);
    this.breadcrumb = new Breadcrumb(this.options);
    this.actionButtons = new ActionButtons(this.options);
    
    this.isInitialized = false;
  }

  /**
   * Initialize navigation header component
   * UPDATED COMMENTS: Async initialization with modular components
   */
  async init() {
    try {
      this.render();
      this.bindEvents();
      this.isInitialized = true;
      
      // REUSED: EventBus pattern for component communication
      this.eventBus.emit('navigation:initialized', this);
    } catch (error) {
      console.error('Failed to initialize navigation header:', error);
      throw error;
    }
  }

  /**
   * Render navigation header HTML structure
   * REUSED: Dynamic breadcrumb generation with separators between ALL THREE elements
   * UPDATED COMMENTS: Three separate elements: [User+Status] / [HOME] / [EN]
   */
  render() {
    // REUSED: Three distinct navigation elements for proper separation
    const breadcrumbElements = [
      this.userInfo.render(),
      this.breadcrumb.renderPageSection(),
      this.breadcrumb.renderLanguageSection()
    ];
    
    // UPDATED COMMENTS: Generate separators dynamically between each of THREE elements
    const breadcrumbHTML = breadcrumbElements
      .filter(element => element && element.trim()) // Remove empty elements
      .join('<div class="breadcrumb-separator">/</div>');
    
    this.container.innerHTML = `
      <div class="navigation-wrapper">
        <nav class="navigation-header" role="navigation" aria-label="Main navigation">
          <!-- ANCHOR: nav_section -->
          <div class="nav-section">
            ${breadcrumbHTML}
          </div>
          
          <!-- ANCHOR: action_buttons -->
          <div class="action-buttons">
            ${this.actionButtons.render()}
          </div>
        </nav>
      </div>
    `;
  }

  /**
   * Bind event listeners to navigation elements
   * REUSED: Event delegation pattern for performance
   */
  bindEvents() {
    // UPDATED COMMENTS: Event delegation for all navigation interactions
    this.container.addEventListener('click', this.handleClick.bind(this));
    this.container.addEventListener('keydown', this.handleKeydown.bind(this));
    
    // SCALED FOR: Performance - debounced resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 100);
    });
  }

  /**
   * Handle click events on navigation elements
   * UPDATED COMMENTS: Centralized click handling with action routing
   */
  handleClick(event) {
    const button = event.target.closest('button');
    if (!button) return;

    const action = button.dataset.action;
    const dropdown = button.dataset.dropdown;

    if (action) {
      this.handleAction(action, button);
    } else if (dropdown) {
      this.toggleDropdown(dropdown, button);
    }
  }

  /**
   * Handle keyboard navigation
   * REUSED: Accessibility keyboard support
   */
  handleKeydown(event) {
    if (event.key === 'Escape') {
      this.closeAllDropdowns();
    }
  }

  /**
   * Handle action button clicks
   * SCALED FOR: Extensible action system
   */
  handleAction(action, button) {
    switch (action) {
      case 'telegram':
      case 'linkedin':
      case 'email':
      case 'github':
        this.openSocialLink(action);
        break;
      case 'download-cv':
        this.downloadCV();
        break;
      case 'share-link':
        this.shareCurrentPage();
        break;
      default:
        console.warn(`Unknown action: ${action}`);
    }
    
    // REUSED: EventBus for component communication
    this.eventBus.emit('navigation:action', { action, button });
  }

  /**
   * Open social media links
   * UPDATED COMMENTS: Secure external link handling
   */
  openSocialLink(platform) {
    const url = this.options.socialLinks[platform];
    if (url) {
      // SCALED FOR: Security - safe external link opening
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
      
      this.eventBus.emit('navigation:social-click', { platform, url });
    }
  }

  /**
   * Download CV file
   * REUSED: File download with analytics tracking
   */
  downloadCV() {
    const link = document.createElement('a');
    link.href = this.options.cvUrl;
    link.download = 'Ivan_Shuvalov_CV.pdf';
    link.click();
    
    this.eventBus.emit('navigation:cv-download', { url: this.options.cvUrl });
  }

  /**
   * Share current page URL
   * UPDATED COMMENTS: Modern Web Share API with clipboard fallback
   */
  async shareCurrentPage() {
    const url = window.location.href;
    const title = document.title;
    
    try {
      // SCALED FOR: Modern browsers with Web Share API
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        // REUSED: Clipboard API fallback
        await navigator.clipboard.writeText(url);
        this.showShareFeedback();
      }
      
      this.eventBus.emit('navigation:share', { url, title });
    } catch (error) {
      console.error('Failed to share:', error);
      this.copyToClipboardFallback(url);
    }
  }

  /**
   * Show share feedback to user
   * UPDATED COMMENTS: Temporary visual feedback for copy action
   */
  showShareFeedback() {
    const shareButton = this.container.querySelector('[data-action="share-link"] .nav-button__text');
    if (shareButton) {
      const originalText = shareButton.textContent;
      shareButton.textContent = 'Copied!';
      setTimeout(() => shareButton.textContent = originalText, 2000);
    }
  }

  /**
   * Fallback clipboard copy for older browsers
   * REUSED: Legacy browser support
   */
  copyToClipboardFallback(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      this.showShareFeedback();
    } catch (error) {
      console.error('Fallback copy failed:', error);
    } finally {
      document.body.removeChild(textArea);
    }
  }

  /**
   * Toggle dropdown menus
   * UPDATED COMMENTS: Dropdown state management with modular components
   */
  toggleDropdown(type, button) {
    this.breadcrumb.toggleDropdown(type);
    this.eventBus.emit('navigation:dropdown-toggle', { type, button });
  }

  /**
   * Close all open dropdowns
   * REUSED: Centralized dropdown management
   */
  closeAllDropdowns() {
    this.breadcrumb.dropdownStates.page = false;
    this.breadcrumb.dropdownStates.language = false;
  }

  /**
   * Handle window resize
   * SCALED FOR: Responsive behavior
   */
  handleResize() {
    this.eventBus.emit('navigation:resize');
  }

  /**
   * Update navigation state
   * REUSED: Dynamic content updates with modular components
   */
  updateState(newState) {
    Object.assign(this.options, newState);
    
    // UPDATED COMMENTS: Update all child components
    this.userInfo.updateUserInfo(newState);
    this.breadcrumb.updateBreadcrumb(newState);
    this.actionButtons.updateSocialLinks(newState.socialLinks || {});
    
    if (this.isInitialized) {
      this.render();
      this.bindEvents();
    }
  }

  /**
   * Destroy component and cleanup
   * SCALED FOR: Memory management with modular cleanup
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.isInitialized = false;
    this.eventBus.emit('navigation:destroyed');
  }
}
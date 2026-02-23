/* ANCHOR: mobile_menu_component */
/* FSD: shared/ui/navigation/components → Mobile burger menu */
/* REUSED: EventBus pattern for component communication */
/* SCALED FOR: Touch-friendly mobile navigation */
/* UPDATED COMMENTS: Fullscreen overlay menu with sections for pages, language, social links, and actions */

import { IconProvider } from './icon-provider.js';
import { SOCIAL_LINKS } from '../../../config/social-links.js';

/**
 * MobileMenu class - Burger menu for mobile navigation
 * CRITICAL: Fullscreen overlay with all navigation options
 * REUSED: Same structure as desktop navigation but vertical layout
 * 
 * @class MobileMenu
 */
export class MobileMenu {
  constructor(options = {}) {
    this.eventBus = options.eventBus;
    this.options = {
      currentPage: options.currentPage || 'Home',
      currentLanguage: options.currentLanguage || 'EN',
      socialLinks: SOCIAL_LINKS,
      cvUrl: SOCIAL_LINKS.resume.url,
      ...options
    };
    
    this.iconProvider = new IconProvider();
    this.isOpen = false;
    this.menuElement = null;
    this.overlayElement = null;
  }

  /**
   * Initialize mobile menu
   * CRITICAL: Create menu DOM and bind events
   */
  init() {
    this.createMenuDOM();
    this.bindEvents();
  }

  /**
   * Create menu DOM structure
   * UPDATED COMMENTS: Fullscreen overlay with close button and sections
   */
  createMenuDOM() {
    // CRITICAL: Create overlay backdrop
    this.overlayElement = document.createElement('div');
    this.overlayElement.className = 'mobile-menu-overlay';
    this.overlayElement.setAttribute('aria-hidden', 'true');
    
    // CRITICAL: Create menu container
    this.menuElement = document.createElement('div');
    this.menuElement.className = 'mobile-menu';
    this.menuElement.setAttribute('role', 'dialog');
    this.menuElement.setAttribute('aria-label', 'Mobile navigation menu');
    this.menuElement.setAttribute('aria-hidden', 'true');
    
    this.menuElement.innerHTML = this.renderMenuContent();
    
    // CRITICAL: Append to body for proper z-index layering
    document.body.appendChild(this.overlayElement);
    document.body.appendChild(this.menuElement);
  }

  /**
   * Render menu content HTML
   * REUSED: Same sections as desktop navigation
   * UPDATED COMMENTS: No close button - burger button handles closing
   */
  renderMenuContent() {
    return `
      <!-- ANCHOR: menu_sections -->
      <div class="mobile-menu__content">
        <!-- Pages Section -->
        <div class="mobile-menu__section">
          <h3 class="mobile-menu__section-title">Pages</h3>
          <nav class="mobile-menu__nav">
            <button class="mobile-menu__item ${this.options.currentPage === 'Home' ? 'mobile-menu__item--active' : ''}" 
                    data-action="navigate" 
                    data-url="/" 
                    data-page="Home">
              Home
            </button>
            <button class="mobile-menu__item ${this.options.currentPage === 'Projects' ? 'mobile-menu__item--active' : ''}" 
                    data-action="navigate" 
                    data-url="/projects" 
                    data-page="Projects">
              Projects
            </button>
            <button class="mobile-menu__item ${this.options.currentPage === 'Fun' ? 'mobile-menu__item--active' : ''}" 
                    data-action="navigate" 
                    data-url="/fun" 
                    data-page="Fun">
              Fun
            </button>
          </nav>
        </div>
        
        <!-- Language Section -->
        <div class="mobile-menu__section">
          <h3 class="mobile-menu__section-title">Language</h3>
          <div class="mobile-menu__language">
            <button class="mobile-menu__item ${this.options.currentLanguage === 'EN' ? 'mobile-menu__item--active' : ''}" 
                    data-action="change-language" 
                    data-lang="EN">
              ${this.iconProvider.getFlagUSASVG()}
              <span>English</span>
            </button>
            <button class="mobile-menu__item ${this.options.currentLanguage === 'RU' ? 'mobile-menu__item--active' : ''}" 
                    data-action="change-language" 
                    data-lang="RU">
              <span>🇷🇺</span>
              <span>Русский</span>
            </button>
          </div>
        </div>
        
        <!-- Social Links Section -->
        <div class="mobile-menu__section">
          <h3 class="mobile-menu__section-title">Social</h3>
          <div class="mobile-menu__social">
            <button class="mobile-menu__social-button" 
                    data-action="telegram" 
                    aria-label="Contact via Telegram">
              ${this.iconProvider.getTelegramSVG()}
              <span>Telegram</span>
            </button>
            <button class="mobile-menu__social-button" 
                    data-action="linkedin" 
                    aria-label="View LinkedIn profile">
              ${this.iconProvider.getLinkedInSVG()}
              <span>LinkedIn</span>
            </button>
            <button class="mobile-menu__social-button" 
                    data-action="email" 
                    aria-label="Send email">
              ${this.iconProvider.getEmailSVG()}
              <span>Email</span>
            </button>
            <button class="mobile-menu__social-button" 
                    data-action="github" 
                    aria-label="View GitHub profile">
              ${this.iconProvider.getGitHubSVG()}
              <span>GitHub</span>
            </button>
          </div>
        </div>
        
        <!-- Actions Section -->
        <div class="mobile-menu__section mobile-menu__section--actions">
          <button class="mobile-menu__action-button mobile-menu__action-button--primary" 
                  data-action="download-cv">
            ${this.iconProvider.getDownloadSVG()}
            <span>Get CV</span>
          </button>
          <button class="mobile-menu__action-button" 
                  data-action="share-link">
            ${this.iconProvider.getCopySVG()}
            <span>Share</span>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Bind event listeners
   * REUSED: Event delegation pattern
   */
  bindEvents() {
    // CRITICAL: Click on overlay closes menu
    this.overlayElement.addEventListener('click', () => {
      this.close();
    });
    
    // CRITICAL: Event delegation for all menu interactions
    this.menuElement.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (!button) return;
      
      const action = button.dataset.action;
      if (action) {
        this.handleAction(action, button);
      }
    });
    
    // CRITICAL: Escape key closes menu
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  /**
   * Handle menu actions
   * SCALED FOR: Extensible action system
   * UPDATED COMMENTS: Removed close-menu action - burger button handles closing
   */
  handleAction(action, button) {
    switch (action) {
      case 'navigate':
        const url = button.dataset.url;
        const page = button.dataset.page;
        this.navigate(url, page);
        break;
        
      case 'change-language':
        const lang = button.dataset.lang;
        this.changeLanguage(lang);
        break;
        
      case 'telegram':
      case 'linkedin':
      case 'email':
      case 'github':
        this.eventBus.emit('navigation:action', { action, button });
        this.close();
        break;
        
      case 'download-cv':
      case 'share-link':
        this.eventBus.emit('navigation:action', { action, button });
        this.close();
        break;
        
      default:
        console.warn(`Unknown action: ${action}`);
    }
  }

  /**
   * Navigate to page
   * CRITICAL: Emit folder:navigate event for router
   */
  navigate(url, page) {
    this.eventBus.emit('folder:navigate', { url });
    this.updateCurrentPage(page);
    this.close();
  }

  /**
   * Change language
   * CRITICAL: Emit language-dropdown:select event
   */
  changeLanguage(lang) {
    this.eventBus.emit('language-dropdown:select', { 
      langId: lang.toLowerCase(), 
      langLabel: lang 
    });
    this.updateCurrentLanguage(lang);
    this.close();
  }

  /**
   * Open menu
   * CRITICAL: Show overlay and menu with animation
   */
  open() {
    if (this.isOpen) return;
    
    this.isOpen = true;
    
    // CRITICAL: Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // CRITICAL: Show overlay and menu
    this.overlayElement.classList.add('mobile-menu-overlay--open');
    this.menuElement.classList.add('mobile-menu--open');
    
    // CRITICAL: Update ARIA attributes
    this.overlayElement.setAttribute('aria-hidden', 'false');
    this.menuElement.setAttribute('aria-hidden', 'false');
    
    // REUSED: EventBus pattern
    this.eventBus.emit('mobile-menu:open');
  }

  /**
   * Close menu
   * CRITICAL: Hide overlay and menu with animation
   * UPDATED COMMENTS: Emit event to reset burger button animation
   */
  close() {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    
    // CRITICAL: Restore body scroll
    document.body.style.overflow = '';
    
    // CRITICAL: Hide overlay and menu
    this.overlayElement.classList.remove('mobile-menu-overlay--open');
    this.menuElement.classList.remove('mobile-menu--open');
    
    // CRITICAL: Update ARIA attributes
    this.overlayElement.setAttribute('aria-hidden', 'true');
    this.menuElement.setAttribute('aria-hidden', 'true');
    
    // REUSED: EventBus pattern
    this.eventBus.emit('mobile-menu:close');
    
    // CRITICAL: Emit event to reset burger button animation
    this.eventBus.emit('mobile-menu:reset-burger');
  }

  /**
   * Toggle menu
   * REUSED: Standard toggle pattern
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Update current page
   * CRITICAL: Update active state in menu
   */
  updateCurrentPage(pageName) {
    this.options.currentPage = pageName;
    
    // CRITICAL: Update active state in DOM
    const items = this.menuElement.querySelectorAll('[data-action="navigate"]');
    items.forEach(item => {
      if (item.dataset.page === pageName) {
        item.classList.add('mobile-menu__item--active');
      } else {
        item.classList.remove('mobile-menu__item--active');
      }
    });
  }

  /**
   * Update current language
   * CRITICAL: Update active state in menu
   */
  updateCurrentLanguage(lang) {
    this.options.currentLanguage = lang;
    
    // CRITICAL: Update active state in DOM
    const items = this.menuElement.querySelectorAll('[data-action="change-language"]');
    items.forEach(item => {
      if (item.dataset.lang === lang) {
        item.classList.add('mobile-menu__item--active');
      } else {
        item.classList.remove('mobile-menu__item--active');
      }
    });
  }

  /**
   * Destroy menu
   * SCALED FOR: Memory management
   */
  destroy() {
    if (this.overlayElement) {
      this.overlayElement.remove();
    }
    if (this.menuElement) {
      this.menuElement.remove();
    }
    
    // CRITICAL: Restore body scroll if menu was open
    if (this.isOpen) {
      document.body.style.overflow = '';
    }
  }
}

/* ANCHOR: mobile_menu_component */
/* FSD: shared/ui/navigation/components → Mobile burger menu */
/* REUSED: EventBus pattern for component communication */
/* SCALED FOR: Touch-friendly mobile navigation */
/* UPDATED COMMENTS: Uses Button component and ActionButtons for consistency */

import { SOCIAL_LINKS } from '../../../config/social-links.js';
import { Button } from '../../button/button.js';
import { ActionButtons } from './action-buttons.js';

/**
 * MobileMenu class - Burger menu for mobile navigation
 * CRITICAL: Fullscreen overlay with all navigation options
 * REUSED: Button component and ActionButtons for consistency with desktop
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
    
    this.isOpen = false;
    this.menuElement = null;
    this.overlayElement = null;
    this.pages = options.pages || [
      { label: 'Home', url: '/', page: 'Home' },
      { label: 'Fun', url: '/fun', page: 'Fun' },
      { label: 'Viewport Test', url: '/viewport-test', page: 'Viewport Test' }
    ];
    
    // REUSED: ActionButtons component from desktop navigation
    // CRITICAL: Pass isMobile flag to render text labels on social buttons
    this.actionButtons = new ActionButtons({
      ...this.options,
      isMobile: true
    });
  }

  /**
   * Initialize mobile menu
   * CRITICAL: Bind events to existing DOM
   */
  init(root = document) {
    this.overlayElement = root.querySelector('.mobile-menu-overlay');
    this.menuElement = root.querySelector('.mobile-menu');
    if (!this.overlayElement || !this.menuElement) return;
    this.bindEvents();
  }

  /**
   * Render menu content HTML
   * REUSED: Button component for navigation and ActionButtons for social/actions
   * UPDATED COMMENTS: Uses Button component with text variant for all buttons
   */
  renderMenuContent() {
    const navButtons = this.pages.map(({ label, url, page }) => {
      const button = new Button({
        type: 'text',
        text: label,
        action: 'navigate',
        isActive: this.options.currentPage === page,
        dataAttrs: { url, page }
      });
      return button.render();
    }).join('');
    
    return `
      <!-- ANCHOR: menu_sections -->
      <div class="mobile-menu__content">
        <!-- Navigation Buttons -->
        ${navButtons}
        
        <!-- Divider -->
        <div class="mobile-menu__divider"></div>
        
        <!-- Action Buttons -->
        ${this.actionButtons.render()}
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
    
  }

  /**
   * Handle menu actions
   * SCALED FOR: Extensible action system
   * UPDATED COMMENTS: Handles navigation and delegates social/action buttons to NavigationHeader
   */
  handleAction(action, button) {
    switch (action) {
      case 'navigate':
        const url = button.dataset.url;
        const page = button.dataset.page;
        this.navigate(url, page);
        break;
        
      case 'telegram':
      case 'linkedin':
      case 'email':
      case 'github':
      case 'download-cv':
      case 'share-link':
        // CRITICAL: Delegate to NavigationHeader action handler
        // UPDATED COMMENTS: These actions are handled by NavigationHeader
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
   * Open menu
   */
  open() {
    if (document.body.classList.contains('menu-open')) return;
    document.body.classList.add('menu-open');
    this.overlayElement?.setAttribute('aria-hidden', 'false');
    this.menuElement?.setAttribute('aria-hidden', 'false');
    
    // REUSED: EventBus pattern
    this.eventBus.emit('mobile-menu:open');
  }

  /**
   * Close menu
   * CRITICAL: Hide overlay and menu with animation
   * UPDATED COMMENTS: Emit event to reset burger button animation + remove focus from menu items
   */
  close() {
    if (!document.body.classList.contains('menu-open')) return;
    // CRITICAL: Remove focus from any focused element inside menu (accessibility fix)
    const focusedElement = this.menuElement?.querySelector(':focus');
    if (focusedElement) {
      focusedElement.blur();
    }
    document.body.classList.remove('menu-open');
    this.overlayElement?.setAttribute('aria-hidden', 'true');
    this.menuElement?.setAttribute('aria-hidden', 'true');
    
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
    if (document.body.classList.contains('menu-open')) {
      this.close();
    } else {
      this.open();
    }
    return document.body.classList.contains('menu-open');
  }

  /**
   * Update current page
   * CRITICAL: Update active state in menu
   */
  updateCurrentPage(pageName) {
    const normalizedPage = pageName === 'Projects' ? 'Home' : pageName;
    this.options.currentPage = normalizedPage;
    
    // CRITICAL: Update active state in DOM
    const items = this.menuElement?.querySelectorAll('[data-action="navigate"]') || [];
    items.forEach(item => {
      if (item.dataset.page === normalizedPage) {
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
    this.overlayElement = null;
    this.menuElement = null;
  }
}

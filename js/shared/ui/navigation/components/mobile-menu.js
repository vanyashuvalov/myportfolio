/* ANCHOR: mobile_menu_component */
/* FSD: shared/ui/navigation/components → Mobile burger menu */
/* REUSED: EventBus pattern for component communication */
/* SCALED FOR: Touch-friendly mobile navigation */
/* UPDATED COMMENTS: Uses Button component and ActionButtons for consistency */

import { IconProvider } from './icon-provider.js';
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
    
    this.iconProvider = new IconProvider();
    this.isOpen = false;
    this.menuElement = null;
    this.overlayElement = null;
    
    // REUSED: ActionButtons component from desktop navigation
    // CRITICAL: Pass isMobile flag to render text labels on social buttons
    this.actionButtons = new ActionButtons({
      ...this.options,
      isMobile: true
    });
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
   * REUSED: Button component for navigation and ActionButtons for social/actions
   * UPDATED COMMENTS: Uses Button component with text variant for all buttons
   */
  renderMenuContent() {
    // REUSED: Create navigation buttons using Button component with text variant
    const homeButton = new Button({
      type: 'text',
      text: 'Home',
      action: 'navigate',
      isActive: this.options.currentPage === 'Home',
      dataAttrs: { url: '/', page: 'Home' }
    });
    
    const projectsButton = new Button({
      type: 'text',
      text: 'Projects',
      action: 'navigate',
      isActive: this.options.currentPage === 'Projects',
      dataAttrs: { url: '/projects', page: 'Projects' }
    });
    
    const funButton = new Button({
      type: 'text',
      text: 'Fun',
      action: 'navigate',
      isActive: this.options.currentPage === 'Fun',
      dataAttrs: { url: '/fun', page: 'Fun' }
    });
    
    return `
      <!-- ANCHOR: menu_sections -->
      <div class="mobile-menu__content">
        <!-- Navigation Buttons -->
        ${homeButton.render()}
        ${projectsButton.render()}
        ${funButton.render()}
        
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
   * UPDATED COMMENTS: Handles navigation and delegates social/action buttons to NavigationHeader
   */
  handleAction(action, button) {
    // CRITICAL: Debug logging to check button data attributes
    console.log('🔵 MobileMenu action:', action, {
      url: button.dataset.url,
      page: button.dataset.page,
      buttonElement: button
    });
    
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
   * UPDATED COMMENTS: Emit event to reset burger button animation + remove focus from menu items
   */
  close() {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    
    // CRITICAL: Remove focus from any focused element inside menu (accessibility fix)
    // UPDATED COMMENTS: Prevents "aria-hidden on focused element" warning
    const focusedElement = this.menuElement.querySelector(':focus');
    if (focusedElement) {
      focusedElement.blur();
    }
    
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

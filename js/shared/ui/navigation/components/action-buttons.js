/* ANCHOR: action_buttons_component */
/* REUSED: Action buttons with universal button system */
/* SCALED FOR: Extensible button system with two variants */
/* UPDATED COMMENTS: Uses universal Button component and centralized social links */
/* CRITICAL: All social links come from shared/config/social-links.js */

import { IconProvider } from './icon-provider.js';
import { Button } from '../../../ui/button/button.js';
import { SOCIAL_LINKS } from '../../../config/social-links.js';

/**
 * ActionButtons class - Social media and action buttons
 * Uses universal Button component for consistent styling and behavior
 * CRITICAL: All links centralized in social-links.js config
 * 
 * @class ActionButtons
 */
export class ActionButtons {
  constructor(options = {}) {
    // CRITICAL: Use centralized social links, no hardcoded URLs
    this.socialLinks = SOCIAL_LINKS;
    
    this.options = {
      cvUrl: SOCIAL_LINKS.resume.url,
      ...options
    };
    
    this.iconProvider = new IconProvider();
    this.buttons = this.createButtons();
  }

  /**
   * Create button instances
   * REUSED: Universal Button component for all button types
   * CRITICAL: Uses centralized SOCIAL_LINKS configuration
   */
  createButtons() {
    return {
      // UPDATED COMMENTS: Icon-only buttons (square, 40x40px) with centralized URLs
      telegram: new Button({
        type: 'icon',
        icon: this.iconProvider.getTelegramSVG(),
        action: 'telegram',
        ariaLabel: 'Contact via Telegram',
        url: this.socialLinks.telegram.url
      }),
      
      linkedin: new Button({
        type: 'icon',
        icon: this.iconProvider.getLinkedInSVG(),
        action: 'linkedin',
        ariaLabel: 'View LinkedIn profile',
        url: this.socialLinks.linkedin.url
      }),
      
      email: new Button({
        type: 'icon',
        icon: this.iconProvider.getEmailSVG(),
        action: 'email',
        ariaLabel: 'Send email',
        url: this.socialLinks.email.url
      }),
      
      github: new Button({
        type: 'icon',
        icon: this.iconProvider.getGitHubSVG(),
        action: 'github',
        ariaLabel: 'View GitHub profile',
        url: this.socialLinks.github.url
      }),
      
      // UPDATED COMMENTS: Icon+text buttons (rectangular, custom widths)
      cv: new Button({
        type: 'text',
        icon: this.iconProvider.getDownloadSVG(),
        text: 'GET CV',
        action: 'download-cv',
        ariaLabel: 'Download CV',
        className: 'nav-button--cv',
        url: this.options.cvUrl
      }),
      
      share: new Button({
        type: 'text',
        icon: this.iconProvider.getCopySVG(),
        text: 'Share',
        action: 'share-link',
        ariaLabel: 'Share this page',
        className: 'nav-button--share'
      })
    };
  }

  /**
   * Render action buttons HTML
   * REUSED: Universal Button rendering system
   */
  render() {
    return `
      <!-- Social Media Buttons (Icon-only) -->
      ${this.buttons.telegram.render()}
      ${this.buttons.linkedin.render()}
      ${this.buttons.email.render()}
      ${this.buttons.github.render()}
      
      <!-- Action Buttons (Icon+Text) -->
      ${this.buttons.cv.render()}
      ${this.buttons.share.render()}
    `;
  }

  /**
   * Update social links
   * SCALED FOR: Dynamic social link management
   * DEPRECATED: Links should be updated in social-links.js config
   */
  updateSocialLinks(newLinks) {
    console.warn('⚠️ updateSocialLinks is deprecated. Update SOCIAL_LINKS in social-links.js instead');
  }

  /**
   * Update button options
   * UPDATED COMMENTS: Dynamic button updates through universal system
   */
  updateButton(buttonName, newOptions) {
    if (this.buttons[buttonName]) {
      this.buttons[buttonName].updateOptions(newOptions);
    }
  }
}
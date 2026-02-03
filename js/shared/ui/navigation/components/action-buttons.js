/* ANCHOR: action_buttons_component */
/* REUSED: Action buttons with universal button system */
/* SCALED FOR: Extensible button system with two variants */
/* UPDATED COMMENTS: Uses universal Button component for consistency */

import { IconProvider } from './icon-provider.js';
import { Button } from '../../../ui/button/button.js';

/**
 * ActionButtons class - Social media and action buttons
 * Uses universal Button component for consistent styling and behavior
 * 
 * @class ActionButtons
 */
export class ActionButtons {
  constructor(options = {}) {
    this.options = {
      socialLinks: {
        telegram: 'https://t.me/yourusername',
        linkedin: 'https://linkedin.com/in/yourusername',
        email: 'mailto:your.email@example.com',
        github: 'https://github.com/yourusername'
      },
      cvUrl: 'assets/documents/cv.pdf',
      ...options
    };
    this.iconProvider = new IconProvider();
    this.buttons = this.createButtons();
  }

  /**
   * Create button instances
   * REUSED: Universal Button component for all button types
   */
  createButtons() {
    return {
      // UPDATED COMMENTS: Icon-only buttons (square, 40x40px)
      telegram: new Button({
        type: 'icon',
        icon: this.iconProvider.getTelegramSVG(),
        action: 'telegram',
        ariaLabel: 'Contact via Telegram'
      }),
      
      linkedin: new Button({
        type: 'icon',
        icon: this.iconProvider.getLinkedInSVG(),
        action: 'linkedin',
        ariaLabel: 'View LinkedIn profile'
      }),
      
      email: new Button({
        type: 'icon',
        icon: this.iconProvider.getEmailSVG(),
        action: 'email',
        ariaLabel: 'Send email'
      }),
      
      github: new Button({
        type: 'icon',
        icon: this.iconProvider.getGitHubSVG(),
        action: 'github',
        ariaLabel: 'View GitHub profile'
      }),
      
      // UPDATED COMMENTS: Icon+text buttons (rectangular, custom widths)
      cv: new Button({
        type: 'text',
        icon: this.iconProvider.getDownloadSVG(),
        text: 'GET CV',
        action: 'download-cv',
        ariaLabel: 'Download CV',
        className: 'nav-button--cv'
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
   */
  updateSocialLinks(newLinks) {
    Object.assign(this.options.socialLinks, newLinks);
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
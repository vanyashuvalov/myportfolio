import { NAVIGATION_ICONS } from './navigation-icons.js';

/** Navigation SVGs are bundled once and available without blocking requests. */
export class IconProvider {
  getIcon(iconName) {
    return NAVIGATION_ICONS[iconName] || '';
  }

  async loadIcon(iconName) {
    return this.getIcon(iconName);
  }

  getArrowSVG() {
    return this.getIcon('arrow');
  }

  getFlagSVG() {
    return this.getIcon('flag');
  }

  getTelegramSVG() {
    return this.getIcon('telegram');
  }

  getLinkedInSVG() {
    return this.getIcon('linkedin');
  }

  getEmailSVG() {
    return this.getIcon('email');
  }

  getGitHubSVG() {
    return this.getIcon('github');
  }

  getDownloadSVG() {
    return this.getIcon('download');
  }

  getCopySVG() {
    return this.getIcon('copy');
  }

  getHeartSVG() {
    return this.getIcon('heart');
  }

  getEyeSVG() {
    return this.getIcon('eye');
  }

  getClockSVG() {
    return this.getIcon('clock');
  }

  getCloseSVG() {
    return this.getIcon('close');
  }

  getFlagUSASVG() {
    return this.getIcon('flag');
  }

}

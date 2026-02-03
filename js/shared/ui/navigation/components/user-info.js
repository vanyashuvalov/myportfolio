/* ANCHOR: user_info_component */
/* REUSED: User info section with photo, name and status */
/* SCALED FOR: Dynamic user data updates */
/* UPDATED COMMENTS: Modular user info component for navigation */

/**
 * UserInfo class - User photo, name and status display
 * Handles user avatar, name display, and work status indicator
 * 
 * @class UserInfo
 */
export class UserInfo {
  constructor(options = {}) {
    this.options = {
      userName: 'Shuvalov Ivan',
      userPhoto: 'assets/images/avatar.jpg',
      statusText: 'Open for work',
      ...options
    };
  }

  /**
   * Render user info HTML
   * REUSED: Template-based rendering pattern
   */
  render() {
    return `
      <!-- User Photo -->
      <div class="user-photo">
        <img src="${this.options.userPhoto}" alt="${this.options.userName}" loading="lazy">
      </div>
      
      <!-- User Name and Status -->
      <div class="user-name-section">
        <h1 class="user-name">${this.options.userName}</h1>
        <div class="status-badge" role="status" aria-label="Current status">
          <div class="status-indicator" aria-hidden="true"></div>
          <span class="status-text">${this.options.statusText}</span>
        </div>
      </div>
    `;
  }

  /**
   * Update user info data
   * SCALED FOR: Dynamic user updates
   */
  updateUserInfo(newData) {
    Object.assign(this.options, newData);
  }
}
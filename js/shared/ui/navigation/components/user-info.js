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

    this.isInitialized = false;
    this.isAngry = false;
    this.rafId = null;
    this.driftTimeoutId = null;
    this.blinkTimeoutId = null;
    this.angryTimeoutId = null;
    this.redGlowTimeoutId = null;
    this.lastPointerMoveAt = 0;
    this.pointerPosition = { x: 0, y: 0 };

    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleWindowBlur = this.handleWindowBlur.bind(this);
  }

  /**
   * Render user info HTML
   * REUSED: Template-based rendering pattern
   */
  render() {
    return `
      <!-- Animated Eyes Avatar -->
      <div class="user-photo user-photo--eyes" aria-hidden="true">
        <div class="eyes-avatar">
          <span class="eyes-avatar__eye eyes-avatar__eye--left">
            <span class="eyes-avatar__lid eyes-avatar__lid--top"></span>
            <span class="eyes-avatar__pupil">
              <span class="eyes-avatar__highlight"></span>
            </span>
            <span class="eyes-avatar__lid eyes-avatar__lid--bottom"></span>
          </span>
          <span class="eyes-avatar__eye eyes-avatar__eye--right">
            <span class="eyes-avatar__lid eyes-avatar__lid--top"></span>
            <span class="eyes-avatar__pupil">
              <span class="eyes-avatar__highlight"></span>
            </span>
            <span class="eyes-avatar__lid eyes-avatar__lid--bottom"></span>
          </span>
        </div>
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
   * Initialize animated eyes listeners
   * REUSED: Global pointer tracking pattern
   */
  init() {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    this.isInitialized = true;
    window.addEventListener('pointermove', this.handlePointerMove, { passive: true });
    document.addEventListener('click', this.handleDocumentClick);
    window.addEventListener('blur', this.handleWindowBlur);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    this.resetEyes();
    this.scheduleRandomDrift();
    this.scheduleBlink();
  }

  /**
   * Update pupil position based on pointer location
   * SCALED FOR: Small 40x40 avatar container
   */
  handlePointerMove(event) {
    if (document.hidden || this.isAngry) {
      return;
    }

    this.pointerPosition.x = event.clientX;
    this.pointerPosition.y = event.clientY;
    this.lastPointerMoveAt = Date.now();

    if (this.rafId !== null) {
      return;
    }

    this.rafId = window.requestAnimationFrame(() => {
      this.rafId = null;
      this.lookAt(this.pointerPosition.x, this.pointerPosition.y);
    });
  }

  /**
   * Keep the eyes aimed at the current pointer position
   * REUSED: Distance-based easing from the reference example
   */
  lookAt(clientX, clientY) {
    if (this.isAngry) {
      return;
    }

    const eyes = this.getEyes();
    if (!eyes.length) {
      return;
    }

    eyes.forEach((eye) => {
      const rect = eye.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;
      const distance = Math.hypot(deltaX, deltaY) || 1;

      const maxMoveX = Math.min(4, Math.max(2, rect.width * 0.18));
      const maxMoveY = Math.min(6, Math.max(3, rect.height * 0.18));

      let moveX = (deltaX * maxMoveX) / Math.max(distance, maxMoveX);
      let moveY = (deltaY * maxMoveY) / Math.max(distance, maxMoveY);

      moveX = Math.max(-maxMoveX, Math.min(maxMoveX, moveX));
      moveY = Math.max(-maxMoveY, Math.min(maxMoveY, moveY));

      eye.style.setProperty('--pupil-x', `${moveX}px`);
      eye.style.setProperty('--pupil-y', `${moveY}px`);
      eye.style.setProperty('--highlight-x', `${moveX * 0.35}px`);
      eye.style.setProperty('--highlight-y', `${moveY * 0.35}px`);
    });
  }

  /**
   * Return the eyes currently in the DOM
   */
  getEyes() {
    return Array.from(document.querySelectorAll('.user-photo--eyes .eyes-avatar__eye'));
  }

  /**
   * Reset eyes to a neutral centered pose
   */
  resetEyes() {
    this.getEyes().forEach((eye) => {
      eye.style.setProperty('--pupil-x', '0px');
      eye.style.setProperty('--pupil-y', '0px');
      eye.style.setProperty('--highlight-x', '0px');
      eye.style.setProperty('--highlight-y', '0px');
      eye.classList.remove('eyes-avatar__eye--blink');
      eye.classList.remove('eyes-avatar__eye--hit-down');
    });
  }

  /**
   * Apply a small idle drift when the pointer is not moving
   */
  scheduleRandomDrift() {
    clearTimeout(this.driftTimeoutId);

    this.driftTimeoutId = window.setTimeout(() => {
      if (!this.isInitialized) {
        return;
      }

      if (!document.hidden && !this.isAngry && Date.now() - this.lastPointerMoveAt > 1400) {
        this.applyRandomDrift();
      }

      if (this.isInitialized) {
        this.scheduleRandomDrift();
      }
    }, 1600 + Math.random() * 2200);
  }

  /**
   * Gentle background drift to keep the eyes feeling alive
   */
  applyRandomDrift() {
    if (!this.isInitialized || this.isAngry) {
      return;
    }

    const eyes = this.getEyes();
    if (!eyes.length) {
      return;
    }

    eyes.forEach((eye) => {
      if (eye.classList.contains('red-glow')) {
        return;
      }

      const moveX = (Math.random() - 0.5) * 1.8;
      const moveY = (Math.random() - 0.5) * 2.4;

      eye.style.setProperty('--pupil-x', `${moveX}px`);
      eye.style.setProperty('--pupil-y', `${moveY}px`);
      eye.style.setProperty('--highlight-x', `${moveX * 0.35}px`);
      eye.style.setProperty('--highlight-y', `${moveY * 0.35}px`);
    });
  }

  /**
   * Schedule a random blink
   */
  scheduleBlink() {
    clearTimeout(this.blinkTimeoutId);

    this.blinkTimeoutId = window.setTimeout(() => {
      if (!this.isInitialized) {
        return;
      }

      if (!document.hidden && !this.isAngry) {
        this.blinkRandomEye();
      }

      if (this.isInitialized) {
        this.scheduleBlink();
      }
    }, 4500 + Math.random() * 4500);
  }

  /**
   * Blink one or both eyes
   */
  blinkRandomEye() {
    if (!this.isInitialized) {
      return;
    }

    const eyes = this.getEyes();
    if (!eyes.length) {
      return;
    }

    if (this.isAngry) {
      return;
    }

    const targets = Math.random() < 0.45
      ? [eyes[Math.floor(Math.random() * eyes.length)]]
      : eyes;

    targets.forEach((eye) => eye.classList.add('eyes-avatar__eye--blink'));

    window.setTimeout(() => {
      targets.forEach((eye) => eye.classList.remove('eyes-avatar__eye--blink'));
    }, 110);
  }

  /**
   * Handle any page click and trigger the requested eye behavior
   */
  handleDocumentClick(event) {
    if (!this.isInitialized) {
      return;
    }

    const clickedEye = event.target.closest('.eyes-avatar__eye');
    if (clickedEye) {
      this.handleEyeClick(clickedEye);
      return;
    }

    this.blinkBoth();
  }

  /**
   * Blink both eyes together
   */
  blinkBoth() {
    if (!this.isInitialized || this.isAngry) {
      return;
    }

    const eyes = this.getEyes();
    eyes.forEach((eye) => eye.classList.add('eyes-avatar__eye--blink'));

    window.setTimeout(() => {
      eyes.forEach((eye) => eye.classList.remove('eyes-avatar__eye--blink'));
    }, 70);
  }

  /**
   * Blink a single eye and trigger angry mode like the example
   */
  blinkOne(eye) {
    if (!eye || !this.isInitialized) {
      return;
    }

    eye.classList.add('eyes-avatar__eye--blink', 'eyes-avatar__eye--hit-down');
    window.setTimeout(() => {
      eye.classList.remove('eyes-avatar__eye--blink', 'eyes-avatar__eye--hit-down');
    }, 70);
  }

  /**
   * Handle click on the eye avatar itself
   */
  handleEyeClick(clickedEye) {
    if (!clickedEye || !this.isInitialized) {
      return;
    }

    clickedEye.classList.add('red-glow');
    clearTimeout(this.redGlowTimeoutId);

    this.redGlowTimeoutId = window.setTimeout(() => {
      if (!this.isAngry) {
        clickedEye.classList.remove('red-glow');
      }
    }, 3000);

    this.blinkOne(clickedEye);

    if (this.isAngry) {
      clearTimeout(this.angryTimeoutId);
      this.angryTimeoutId = window.setTimeout(() => this.stopAngry(), 2000);
      return;
    }

    const otherEye = this.getOtherEye(clickedEye);
    if (otherEye) {
      otherEye.classList.add('angry');
    }

    window.setTimeout(() => {
      this.startAngry();
    }, 120);

    clearTimeout(this.angryTimeoutId);
    this.angryTimeoutId = window.setTimeout(() => this.stopAngry(), 2000);
  }

  /**
   * Get the eye opposite to the one that was clicked
   */
  getOtherEye(clickedEye) {
    return this.getEyes().find((eye) => eye !== clickedEye) || null;
  }

  /**
   * Enter angry mode and freeze pointer tracking
   */
  startAngry() {
    if (!this.isInitialized) {
      return;
    }

    this.isAngry = true;
    this.resetEyes();

    this.getEyes().forEach((eye) => {
      eye.classList.add('angry');
    });

    const avatar = document.querySelector('.user-photo--eyes .eyes-avatar');
    if (avatar) {
      avatar.classList.add('angry-eyes');
    }
  }

  /**
   * Leave angry mode and restore the normal idle animation
   */
  stopAngry() {
    if (!this.isInitialized) {
      return;
    }

    this.isAngry = false;

    const eyes = this.getEyes();
    eyes.forEach((eye) => {
      if (eye.classList.contains('red-glow')) {
        eye.classList.add('no-transition');
        eye.classList.remove('red-glow');
        window.setTimeout(() => eye.classList.remove('no-transition'), 10);
      }

      eye.classList.remove('angry');
    });

    const avatar = document.querySelector('.user-photo--eyes .eyes-avatar');
    if (avatar) {
      avatar.classList.remove('angry-eyes');
    }

    eyes.forEach((eye) => eye.classList.add('eyes-avatar__eye--blink'));
    window.setTimeout(() => {
      eyes.forEach((eye) => eye.classList.remove('eyes-avatar__eye--blink'));
      window.setTimeout(() => {
        this.blinkBoth();
      }, 100);
    }, 1000);
  }

  /**
   * Reset the eyes when the page loses focus
   */
  handleWindowBlur() {
    this.resetEyes();
  }

  /**
   * Pause animation when the tab is hidden
   */
  handleVisibilityChange() {
    if (document.hidden) {
      this.resetEyes();
    }
  }

  /**
   * Remove listeners and timers
   */
  destroy() {
    if (!this.isInitialized) {
      return;
    }

    this.isInitialized = false;
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('blur', this.handleWindowBlur);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    clearTimeout(this.driftTimeoutId);
    clearTimeout(this.blinkTimeoutId);
    clearTimeout(this.angryTimeoutId);
    clearTimeout(this.redGlowTimeoutId);

    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Update user info data
   * SCALED FOR: Dynamic user updates
   */
  updateUserInfo(newData) {
    Object.assign(this.options, newData);
  }
}

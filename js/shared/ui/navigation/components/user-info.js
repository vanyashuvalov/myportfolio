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
      ...options
    };

    this.isInitialized = false;
    this.rafId = null;
    this.driftTimeoutId = null;
    this.blinkTimeoutId = null;
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
      
      <!-- User Identity -->
      <a class="user-profile-link" href="/" aria-label="Go to home page">
        <div class="user-name-section">
          <h1 class="user-name">${this.options.userName}</h1>
        </div>
      </a>
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
    if (document.hidden) {
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
    const eyes = this.getEyes();
    if (!eyes.length) {
      return;
    }

    const { moveX, moveY } = this.calculateSharedGaze(eyes, clientX, clientY);
    this.applyEyeVector(eyes, moveX, moveY);
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

      if (!document.hidden && Date.now() - this.lastPointerMoveAt > 1400) {
        this.applyRandomDrift();
      }

      if (this.isInitialized) {
        this.scheduleRandomDrift();
      }
    }, 1600 + Math.random() * 2200);
  }

  /**
   * Gentle background drift to keep the eyes feeling alive
   * REUSED: Shares the same pupil/highlight CSS variables as pointer tracking
   * CONTEXT: Reduced the idle motion amplitude by 50% to prevent the avatar from feeling too jittery in the navigation header
   */
  applyRandomDrift() {
    if (!this.isInitialized) {
      return;
    }

    const eyes = this.getEyes();
    if (!eyes.length) {
      return;
    }

    // Keep the same drift pattern, but scale it down so the idle motion feels calmer.
    const driftAmplitudeScale = 0.5;
    const moveX = (Math.random() - 0.5) * 1.8 * driftAmplitudeScale;
    const moveY = (Math.random() - 0.5) * 2.4 * driftAmplitudeScale;

    this.applyEyeVector(eyes, moveX, moveY);
  }

  /**
   * Calculate a single gaze vector for both eyes so they track the pointer with the same angle.
   * PURPOSE: Prevent cross-eyed motion by keeping the left and right pupils aligned to one shared direction.
   * CONNECTIONS: Used by both pointer tracking and idle drift so the avatar feels coherent in all states.
   */
  calculateSharedGaze(eyes, clientX, clientY) {
    const rects = eyes.map((eye) => eye.getBoundingClientRect());
    const avgCenterX = rects.reduce((sum, rect) => sum + rect.left + rect.width / 2, 0) / rects.length;
    const avgCenterY = rects.reduce((sum, rect) => sum + rect.top + rect.height / 2, 0) / rects.length;
    const averageWidth = rects.reduce((sum, rect) => sum + rect.width, 0) / rects.length;
    const averageHeight = rects.reduce((sum, rect) => sum + rect.height, 0) / rects.length;

    const deltaX = clientX - avgCenterX;
    const deltaY = clientY - avgCenterY;
    const distance = Math.hypot(deltaX, deltaY) || 1;

    const maxMoveX = Math.min(4, Math.max(2, averageWidth * 0.18));
    const maxMoveY = Math.min(6, Math.max(3, averageHeight * 0.18));

    let moveX = (deltaX * maxMoveX) / Math.max(distance, maxMoveX);
    let moveY = (deltaY * maxMoveY) / Math.max(distance, maxMoveY);

    moveX = Math.max(-maxMoveX, Math.min(maxMoveX, moveX));
    moveY = Math.max(-maxMoveY, Math.min(maxMoveY, moveY));

    return { moveX, moveY };
  }

  /**
   * Apply one shared gaze vector to both eyes.
   * PURPOSE: Keep the pupils moving in the same direction so the avatar reads as one coherent face.
   * CONNECTIONS: Shared by pointer tracking and idle drift to avoid independent per-eye movement.
   */
  applyEyeVector(eyes, moveX, moveY) {
    eyes.forEach((eye) => {
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

      if (!document.hidden) {
        this.blinkRandomEye();
      }

      if (this.isInitialized) {
        this.scheduleBlink();
      }
    }, 4500 + Math.random() * 4500);
  }

  /**
   * Blink both eyes together on a random idle tick.
   * PURPOSE: Keep the idle animation synchronized so the avatar never looks cross-eyed from independent blinks.
   * CONNECTIONS: Driven by the same timeout loop as the rest of the eye idle animation.
   */
  blinkRandomEye() {
    if (!this.isInitialized) {
      return;
    }

    const eyes = this.getEyes();
    if (!eyes.length) {
      return;
    }

    eyes.forEach((eye) => eye.classList.add('eyes-avatar__eye--blink'));

    window.setTimeout(() => {
      eyes.forEach((eye) => eye.classList.remove('eyes-avatar__eye--blink'));
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
      this.blinkBoth();
      return;
    }

    this.blinkBoth();
  }

  /**
   * Blink both eyes together
   */
  blinkBoth() {
    if (!this.isInitialized) {
      return;
    }

    const eyes = this.getEyes();
    eyes.forEach((eye) => eye.classList.add('eyes-avatar__eye--blink'));

    window.setTimeout(() => {
      eyes.forEach((eye) => eye.classList.remove('eyes-avatar__eye--blink'));
    }, 70);
  }

  /**
   * Compatibility wrapper for older click paths that used to blink one eye.
   * PURPOSE: Preserve the public method shape while redirecting all visual blinks to the synchronized two-eye animation.
   * CONNECTIONS: Called from the document click handler in this component.
   */
  blinkOne(eye) {
    if (!eye || !this.isInitialized) {
      return;
    }

    // Keep this method as a compatibility wrapper, but route the visual effect through the synchronized blink.
    this.blinkBoth();
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

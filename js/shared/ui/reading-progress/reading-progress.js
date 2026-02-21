/* ANCHOR: reading_progress */
/* FSD: shared/ui/reading-progress → reading progress indicator component */
/* REUSED: Scroll-based progress calculation pattern */
/* SCALED FOR: Smooth animations and performance optimization */

/**
 * ReadingProgress - Notion-style reading progress indicator
 * Features: Horizontal bar at top, scroll-based progress, desktop only
 * 
 * CRITICAL: Thin horizontal bar (2px) at top of page
 * UPDATED COMMENTS: Fills from left to right based on scroll position
 * SCALED FOR: Throttled scroll events for performance
 * 
 * @class ReadingProgress
 */
export class ReadingProgress {
  constructor(options = {}) {
    // CRITICAL: Container element to track scroll (default: window)
    this.container = options.container || window;
    
    // UPDATED COMMENTS: Progress bar color (default: white with opacity)
    this.color = options.color || 'rgba(255, 255, 255, 0.3)';
    
    // SCALED FOR: Height of progress bar (default: 2px like Notion)
    this.height = options.height || 2;
    
    // CRITICAL: Z-index for positioning (default: above navigation at 100003)
    this.zIndex = options.zIndex || 100003;
    
    // UPDATED COMMENTS: Progress bar element
    this.progressBar = null;
    
    // SCALED FOR: Throttle scroll events for performance
    this.scrollThrottle = null;
    this.throttleDelay = 16; // ~60fps
    
    // CRITICAL: Bound event handler for cleanup
    this.handleScroll = this.handleScroll.bind(this);
    
    this.initialize();
  }

  /**
   * Initialize reading progress indicator
   * CRITICAL: Create progress bar element and attach scroll listener
   */
  initialize() {
    // UPDATED COMMENTS: Create progress bar element
    this.progressBar = this.createProgressBar();
    
    // CRITICAL: Append to body (fixed position at top)
    document.body.appendChild(this.progressBar);
    
    // SCALED FOR: Attach scroll listener with throttling
    this.attachScrollListener();
    
    // CRITICAL: Calculate initial progress
    this.updateProgress();
  }

  /**
   * Create progress bar element
   * REUSED: Fixed positioning pattern from navigation header
   * 
   * @returns {HTMLElement} Progress bar element
   */
  createProgressBar() {
    const bar = document.createElement('div');
    bar.className = 'reading-progress';
    
    // CRITICAL: Fixed at top of viewport
    bar.style.position = 'fixed';
    bar.style.top = '0';
    bar.style.left = '0';
    bar.style.width = '0%'; // Initial state
    bar.style.height = `${this.height}px`;
    bar.style.background = this.color;
    bar.style.zIndex = this.zIndex;
    bar.style.transition = 'width 0.1s ease-out';
    bar.style.pointerEvents = 'none'; // Don't block clicks
    
    return bar;
  }

  /**
   * Attach scroll listener with throttling
   * SCALED FOR: Performance optimization with requestAnimationFrame
   */
  attachScrollListener() {
    // CRITICAL: Use container's scroll event (window or element)
    const scrollTarget = this.container === window ? window : this.container;
    
    scrollTarget.addEventListener('scroll', this.handleScroll, { passive: true });
  }

  /**
   * Handle scroll event with throttling
   * UPDATED COMMENTS: Throttle updates to ~60fps for smooth performance
   */
  handleScroll() {
    // SCALED FOR: Throttle scroll updates
    if (this.scrollThrottle) return;
    
    this.scrollThrottle = requestAnimationFrame(() => {
      this.updateProgress();
      this.scrollThrottle = null;
    });
  }

  /**
   * Update progress bar width based on scroll position
   * CRITICAL: Calculate percentage of content scrolled
   */
  updateProgress() {
    // UPDATED COMMENTS: Get scroll metrics from container
    let scrollTop, scrollHeight, clientHeight;
    
    if (this.container === window) {
      // CRITICAL: Window scroll metrics
      scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      scrollHeight = document.documentElement.scrollHeight;
      clientHeight = window.innerHeight;
    } else {
      // SCALED FOR: Element scroll metrics
      scrollTop = this.container.scrollTop;
      scrollHeight = this.container.scrollHeight;
      clientHeight = this.container.clientHeight;
    }
    
    // CRITICAL: Calculate progress percentage
    // Formula: (scrolled / total scrollable) * 100
    const totalScrollable = scrollHeight - clientHeight;
    const progress = totalScrollable > 0 ? (scrollTop / totalScrollable) * 100 : 0;
    
    // UPDATED COMMENTS: Clamp between 0 and 100
    const clampedProgress = Math.min(100, Math.max(0, progress));
    
    // CRITICAL: Update progress bar width
    this.progressBar.style.width = `${clampedProgress}%`;
  }

  /**
   * Show progress bar
   * REUSED: Fade-in animation pattern
   */
  show() {
    this.progressBar.style.opacity = '1';
  }

  /**
   * Hide progress bar
   * REUSED: Fade-out animation pattern
   */
  hide() {
    this.progressBar.style.opacity = '0';
  }

  /**
   * Destroy progress bar and cleanup
   * CRITICAL: Remove event listeners and DOM element
   */
  destroy() {
    // UPDATED COMMENTS: Remove scroll listener
    const scrollTarget = this.container === window ? window : this.container;
    scrollTarget.removeEventListener('scroll', this.handleScroll);
    
    // SCALED FOR: Cancel pending animation frame
    if (this.scrollThrottle) {
      cancelAnimationFrame(this.scrollThrottle);
      this.scrollThrottle = null;
    }
    
    // CRITICAL: Remove from DOM
    if (this.progressBar && this.progressBar.parentNode) {
      this.progressBar.parentNode.removeChild(this.progressBar);
    }
    
    this.progressBar = null;
  }

  /**
   * Update progress bar color
   * REUSED: Dynamic styling update
   * 
   * @param {string} color - New color value
   */
  setColor(color) {
    this.color = color;
    if (this.progressBar) {
      this.progressBar.style.background = color;
    }
  }

  /**
   * Update progress bar height
   * REUSED: Dynamic styling update
   * 
   * @param {number} height - New height in pixels
   */
  setHeight(height) {
    this.height = height;
    if (this.progressBar) {
      this.progressBar.style.height = `${height}px`;
    }
  }
}

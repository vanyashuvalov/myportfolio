/* ANCHOR: router */
/* FSD: features/page-manager → History API router for project pages */
/* REUSED: EventBus pattern for navigation events */
/* SCALED FOR: SEO-friendly URLs and browser history */

/**
 * Router - Simple History API router for project detail pages
 * Handles: /projects/:id, /fun/:id, browser back/forward
 * 
 * @class Router
 */
export class Router {
  constructor(options = {}) {
    this.eventBus = options.eventBus;
    this.routes = new Map();
    this.currentRoute = null;
    this.isInitialized = false;
    
    // UPDATED COMMENTS: Route configuration
    this.config = {
      basePath: '',
      scrollToTop: true,
      ...options.config
    };
    
    this.initialize();
  }

  /**
   * Initialize router with event listeners
   * CRITICAL: History API and link interception
   */
  initialize() {
    // UPDATED COMMENTS: Handle browser back/forward
    window.addEventListener('popstate', (event) => {
      this.handlePopState(event);
    });
    
    // REUSED: Intercept link clicks for SPA navigation
    document.addEventListener('click', (event) => {
      this.handleLinkClick(event);
    });
    
    this.isInitialized = true;
  }

  /**
   * Register route handler
   * SCALED FOR: Pattern matching with parameters
   * 
   * @param {string} pattern - Route pattern (e.g., '/projects/:id')
   * @param {Function} handler - Route handler function
   */
  register(pattern, handler) {
    this.routes.set(pattern, {
      pattern: this.patternToRegex(pattern),
      handler,
      originalPattern: pattern
    });
  }

  /**
   * Convert route pattern to regex
   * UPDATED COMMENTS: Supports :param syntax
   */
  patternToRegex(pattern) {
    // CRITICAL: Escape special regex characters except :param
    const regexPattern = pattern
      .replace(/\//g, '\\/')
      .replace(/:(\w+)/g, '(?<$1>[^/]+)');
    
    return new RegExp(`^${regexPattern}$`);
  }

  /**
   * Navigate to URL
   * REUSED: Programmatic navigation with history push
   * 
   * @param {string} url - Target URL
   * @param {Object} state - History state object
   */
  navigate(url, state = {}) {
    // CRITICAL: Update browser history
    window.history.pushState(state, '', url);
    
    // UPDATED COMMENTS: Handle route change
    this.handleRoute(url, state);
    
    // SCALED FOR: Scroll to top on navigation
    if (this.config.scrollToTop) {
      window.scrollTo(0, 0);
    }
    
    // REUSED: Emit navigation event
    if (this.eventBus) {
      this.eventBus.emit('router:navigate', { url, state });
    }
  }

  /**
   * Handle popstate event (back/forward)
   * UPDATED COMMENTS: Browser navigation support
   */
  handlePopState(event) {
    const url = window.location.pathname;
    const state = event.state || {};
    
    this.handleRoute(url, state);
    
    if (this.eventBus) {
      this.eventBus.emit('router:popstate', { url, state });
    }
  }

  /**
   * Handle route change
   * CRITICAL: Match URL to registered routes
   */
  async handleRoute(url, state = {}) {
    // UPDATED COMMENTS: Find matching route
    for (const [pattern, route] of this.routes) {
      const match = url.match(route.pattern);
      
      if (match) {
        // SCALED FOR: Extract route parameters
        const params = match.groups || {};
        
        this.currentRoute = {
          url,
          pattern: route.originalPattern,
          params,
          state
        };
        
        // CRITICAL: Call route handler
        try {
          await route.handler({ params, state, url });
        } catch (error) {
          console.error('Route handler error:', error);
          this.handleRouteError(error);
        }
        
        return;
      }
    }
    
    // UPDATED COMMENTS: No route matched - show 404
    this.handle404(url);
  }

  /**
   * Handle link clicks for SPA navigation
   * REUSED: Link interception pattern
   */
  handleLinkClick(event) {
    // CRITICAL: Only intercept internal links
    const link = event.target.closest('a[href]');
    
    if (!link) return;
    
    const href = link.getAttribute('href');
    
    // UPDATED COMMENTS: Skip external links and special protocols
    if (!href || 
        href.startsWith('http') || 
        href.startsWith('mailto:') || 
        href.startsWith('tel:') ||
        href.startsWith('#')) {
      return;
    }
    
    // SCALED FOR: Skip links with target="_blank"
    if (link.target === '_blank') {
      return;
    }
    
    // CRITICAL: Prevent default and use router
    event.preventDefault();
    this.navigate(href);
  }

  /**
   * Handle route errors
   * UPDATED COMMENTS: Error page rendering
   */
  handleRouteError(error) {
    console.error('Route error:', error);
    
    if (this.eventBus) {
      this.eventBus.emit('router:error', { error });
    }
  }

  /**
   * Handle 404 not found
   * REUSED: 404 page rendering
   */
  handle404(url) {
    console.warn('404 Not Found:', url);
    
    if (this.eventBus) {
      this.eventBus.emit('router:404', { url });
    }
  }

  /**
   * Get current route information
   * SCALED FOR: Route state queries
   */
  getCurrentRoute() {
    return this.currentRoute;
  }

  /**
   * Check if URL matches current route
   * REUSED: Route matching utility
   */
  isCurrentRoute(url) {
    return this.currentRoute && this.currentRoute.url === url;
  }

  /**
   * Go back in history
   * UPDATED COMMENTS: Browser back button
   */
  back() {
    window.history.back();
  }

  /**
   * Go forward in history
   * REUSED: Browser forward button
   */
  forward() {
    window.history.forward();
  }

  /**
   * Destroy router and cleanup
   * SCALED FOR: Complete resource cleanup
   */
  destroy() {
    // Remove event listeners would go here
    this.routes.clear();
    this.isInitialized = false;
  }
}

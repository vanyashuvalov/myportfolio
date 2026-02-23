/* ANCHOR: burger_button_component */
/* FSD: shared/ui/navigation/components → Burger menu button */
/* REUSED: Component-based architecture without hardcoded HTML */
/* SCALED FOR: Mobile navigation with animation */
/* UPDATED COMMENTS: Burger button component with X animation */

/**
 * BurgerButton class - Animated burger menu button
 * CRITICAL: Renders burger button that transforms to X
 * REUSED: Component pattern for clean architecture
 * 
 * @class BurgerButton
 */
export class BurgerButton {
  constructor(options = {}) {
    this.options = {
      ariaLabel: options.ariaLabel || 'Toggle mobile menu',
      action: options.action || 'toggle-mobile-menu',
      ...options
    };
  }

  /**
   * Render burger button HTML
   * REUSED: Template-based rendering pattern
   * UPDATED COMMENTS: Three lines that animate to X
   */
  render() {
    return `
      <button class="burger-button" 
              data-action="${this.options.action}" 
              aria-label="${this.options.ariaLabel}">
        <span class="burger-button__line"></span>
        <span class="burger-button__line"></span>
        <span class="burger-button__line"></span>
      </button>
    `;
  }
}

/* ANCHOR: icon_provider */
/* REUSED: Centralized icon management system with external SVG files */
/* SCALED FOR: Icon caching and optimization with file-based loading */
/* UPDATED COMMENTS: External SVG file loader for navigation components */

/**
 * IconProvider class - Centralized SVG icon management with external files
 * Provides all navigation icons from assets/icons/ folder with caching
 * 
 * @class IconProvider
 */
export class IconProvider {
  constructor() {
    // SCALED FOR: Icon caching for performance with external files
    this.iconCache = new Map();
    this.iconPaths = {
      arrow: 'assets/icons/iconamoon_arrow-down-2.svg',
      flag: 'assets/icons/flag-usa.svg',
      telegram: 'assets/icons/icon-park-outline_telegram.svg',
      linkedin: 'assets/icons/mdi_linkedin.svg',
      email: 'assets/icons/iconamoon_email-fill.svg',
      github: 'assets/icons/mdi_github.svg',
      download: 'assets/icons/iconamoon_download.svg',
      copy: 'assets/icons/iconamoon_copy.svg',
      heart: 'assets/icons/iconamoon_heart.svg',
      eye: 'assets/icons/iconamoon_eye.svg',
      clock: 'assets/icons/iconamoon_clock.svg',
      close: 'assets/icons/iconamoon_close.svg'
    };
    
    // UPDATED COMMENTS: Preload all icons on initialization
    this.preloadAllIconsSync();
  }

  /**
   * Preload all icons synchronously on initialization
   * SCALED FOR: Better performance by loading all icons at startup
   */
  preloadAllIconsSync() {
    Object.entries(this.iconPaths).forEach(([iconName, iconPath]) => {
      try {
        this.loadIconSync(iconName, iconPath);
      } catch (error) {
        console.warn(`Failed to preload icon "${iconName}":`, error);
        // Cache fallback for failed loads
        this.iconCache.set(iconName, this.getFallbackIcon(iconName));
      }
    });
  }

  /**
   * Load external SVG file and cache result
   * UPDATED COMMENTS: Async SVG loading with caching for performance
   */
  async loadIcon(iconName) {
    if (this.iconCache.has(iconName)) {
      return this.iconCache.get(iconName);
    }

    const iconPath = this.iconPaths[iconName];
    if (!iconPath) {
      console.warn(`Icon "${iconName}" not found in iconPaths`);
      return '';
    }

    try {
      const response = await fetch(iconPath);
      const svgContent = await response.text();
      this.iconCache.set(iconName, svgContent);
      return svgContent;
    } catch (error) {
      console.error(`Failed to load icon "${iconName}":`, error);
      return this.getFallbackIcon(iconName);
    }
  }

  /**
   * Get cached or load icon synchronously with file loading
   * UPDATED COMMENTS: Try to load from file first, fallback to inline
   */
  getIcon(iconName) {
    if (this.iconCache.has(iconName)) {
      return this.iconCache.get(iconName);
    }
    
    // REUSED: Try to load from file synchronously
    const iconPath = this.iconPaths[iconName];
    if (iconPath) {
      try {
        // UPDATED COMMENTS: Use fetch with async/await in sync context
        this.loadIconSync(iconName, iconPath);
      } catch (error) {
        console.warn(`Failed to load icon "${iconName}" from file, using fallback`);
      }
    }
    
    // Return cached version or fallback
    return this.iconCache.get(iconName) || this.getFallbackIcon(iconName);
  }

  /**
   * Load icon synchronously using fetch
   * UPDATED COMMENTS: Synchronous icon loading for immediate use
   */
  loadIconSync(iconName, iconPath) {
    // REUSED: Create XMLHttpRequest for synchronous loading
    const xhr = new XMLHttpRequest();
    xhr.open('GET', iconPath, false); // false = synchronous
    xhr.send();
    
    if (xhr.status === 200) {
      this.iconCache.set(iconName, xhr.responseText);
    } else {
      throw new Error(`HTTP ${xhr.status}`);
    }
  }

  /**
   * Fallback inline SVG icons for immediate rendering
   * UPDATED COMMENTS: Real SVG content from assets/icons files
   */
  getFallbackIcon(iconName) {
    const fallbacks = {
      arrow: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.83301 8.33203L9.99967 12.4987L14.1663 8.33203" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      flag: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_866_2026)"><path d="M17.2687 4.9974C16.98 4.50115 16.4487 4.16406 15.8333 4.16406H10V4.9974H17.2687ZM2.5 12.4974H17.5V13.3307H2.5V12.4974ZM10 9.16406H17.5V9.9974H10V9.16406ZM10 7.4974H17.5V8.33073H10V7.4974ZM2.5 10.8307H17.5V11.6641H2.5V10.8307ZM4.16667 14.9974H15.8333C16.4487 14.9974 16.98 14.6603 17.2687 14.1641H2.73125C3.02 14.6603 3.55125 14.9974 4.16667 14.9974ZM10 5.83073H17.5V6.66406H10V5.83073Z" fill="#B22334"/><path d="M2.52833 13.6163C2.53528 13.6551 2.54347 13.6936 2.55292 13.7317C2.56403 13.7733 2.57681 13.8144 2.59125 13.855C2.62833 13.9629 2.67333 14.0671 2.73 14.1646L2.73125 14.1667H17.2687L17.2696 14.165C17.326 14.067 17.3724 13.9636 17.4079 13.8563C17.435 13.7779 17.4561 13.6977 17.4712 13.6163C17.4883 13.5246 17.5 13.4304 17.5 13.3333H2.5C2.5 13.4304 2.51167 13.5242 2.52833 13.6163ZM2.5 11.6667H17.5V12.5H2.5V11.6667ZM2.5 10V10.8333H17.5V10H10H2.5ZM10 8.33333H17.5V9.16667H10V8.33333ZM10 6.66667H17.5V7.5H10V6.66667ZM2.55333 5.435C2.56375 5.3925 2.57833 5.35208 2.59167 5.31125C2.57729 5.35199 2.5645 5.39327 2.55333 5.435ZM10 5.83333H17.5C17.5 5.73625 17.4883 5.64208 17.4712 5.55C17.4567 5.46838 17.4353 5.3881 17.4075 5.31C17.3719 5.20221 17.3254 5.09834 17.2687 5H10V5.83333Z" fill="#EEEEEE"/><path d="M10 4.16406H4.16667C3.72464 4.16406 3.30072 4.33966 2.98816 4.65222C2.67559 4.96478 2.5 5.3887 2.5 5.83073L2.5 9.9974H10V4.16406Z" fill="#3C3B6E"/><path d="M3.33301 5.3025L3.59051 5.48958L3.49217 5.79167L3.74926 5.605L4.00676 5.79167L3.90842 5.48958L4.16592 5.3025H3.84759L3.74926 5L3.65134 5.3025H3.33301ZM4.16634 6.13583L4.42384 6.32292L4.32551 6.625L4.58259 6.43833L4.84009 6.625L4.74176 6.32292L4.99926 6.13583H4.68092L4.58259 5.83333L4.48467 6.13583H4.16634ZM5.83301 6.13583L6.09051 6.32292L5.99217 6.625L6.24926 6.43833L6.50676 6.625L6.40842 6.32292L6.66592 6.13583H6.34759L6.24926 5.83333L6.15134 6.13583H5.83301ZM7.49967 6.13583L7.75717 6.32292L7.65884 6.625L7.91592 6.43833L8.17342 6.625L8.07509 6.32292L8.33259 6.13583H8.01426L7.91592 5.83333L7.81801 6.13583H7.49967ZM4.16634 7.8025L4.42384 7.98958L4.32551 8.29167L4.58259 8.105L4.84009 8.29167L4.74176 7.98958L4.99926 7.8025H4.68092L4.58259 7.5L4.48467 7.8025H4.16634ZM5.83301 7.8025L6.09051 7.98958L5.99217 8.29167L6.24926 8.105L6.50676 8.29167L6.40842 7.98958L6.66592 7.8025H6.34759L6.24926 7.5L6.15134 7.8025H5.83301ZM7.49967 7.8025L7.75717 7.98958L7.65884 8.29167L7.91592 8.105L8.17342 8.29167L8.07509 7.98958L8.33259 7.8025H8.01426L7.91592 7.5L7.81801 7.8025H7.49967ZM4.99967 5.3025L5.25717 5.48958L5.15884 5.79167L5.41592 5.605L5.67342 5.79167L5.57509 5.48958L5.83259 5.3025H5.51426L5.41592 5L5.31801 5.3025H4.99967ZM6.66634 5.3025L6.92384 5.48958L6.82551 5.79167L7.08259 5.605L7.34009 5.79167L7.24176 5.48958L7.49926 5.3025H7.18092L7.08259 5L6.98467 5.3025H6.66634ZM8.33301 5.3025L8.59051 5.48958L8.49217 5.79167L8.74926 5.605L9.00676 5.79167L8.90842 5.48958L9.16592 5.3025H8.84759L8.74926 5L8.65134 5.3025H8.33301ZM3.33301 6.96917L3.59051 7.15625L3.49217 7.45833L3.74926 7.27167L4.00676 7.45833L3.90842 7.15625L4.16592 6.96917H3.84759L3.74926 6.66667L3.65134 6.96917H3.33301ZM5.15884 7.45833L5.41592 7.27167L5.67342 7.45833L5.57509 7.15625L5.83259 6.96917H5.51426L5.41592 6.66667L5.31801 6.96917H4.99967L5.25717 7.15625L5.15884 7.45833ZM6.66634 6.96917L6.92384 7.15625L6.82551 7.45833L7.08259 7.27167L7.34009 7.45833L7.24176 7.15625L7.49926 6.96917H7.18092L7.08259 6.66667L6.98467 6.96917H6.66634ZM8.33301 6.96917L8.59051 7.15625L8.49217 7.45833L8.74926 7.27167L9.00676 7.45833L8.90842 7.15625L9.16592 6.96917H8.84759L8.74926 6.66667L8.65134 6.96917H8.33301ZM3.33301 8.63583L3.59051 8.82292L3.49217 9.125L3.74926 8.93833L4.00676 9.125L3.90842 8.82292L4.16592 8.63583H3.84759L3.74926 8.33333L3.65134 8.63583H3.33301ZM5.15884 9.125L5.41592 8.93833L5.67342 9.125L5.57509 8.82292L5.83259 8.63583H5.51426L5.41592 8.33333L5.31801 8.63583H4.99967L5.25717 8.82292L5.15884 9.125ZM6.66634 8.63583L6.92384 8.82292L6.82551 9.125L7.08259 8.93833L7.34009 9.125L7.24176 8.82292L7.49926 8.63583H7.18092L7.08259 8.33333L6.98467 8.63583H6.66634ZM8.33301 8.63583L8.59051 8.82292L8.49217 9.125L8.74926 8.93833L9.00676 9.125L8.90842 8.82292L9.16592 8.63583H8.84759L8.74926 8.33333L8.65134 8.63583H8.33301Z" fill="white"/></g><defs><clipPath id="clip0_866_2026"><rect width="15" height="15" fill="white" transform="translate(2.5 2.08203)"/></clipPath></defs></svg>`,
      telegram: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.7101 3.65451C20.7101 3.65451 22.6526 2.89701 22.4901 4.73651C22.4366 5.49401 21.9511 8.14551 21.5731 11.013L20.2781 19.508C20.2781 19.508 20.1701 20.7525 19.1986 20.969C18.2276 21.185 16.7706 20.2115 16.5006 19.995C16.2846 19.8325 12.4536 17.3975 11.1046 16.2075C10.7266 15.8825 10.2946 15.2335 11.1586 14.476L16.8246 9.06501C17.4721 8.41501 18.1196 6.90001 15.4216 8.74001L7.86665 13.88C7.86665 13.88 7.00315 14.4215 5.38465 13.9345L1.87665 12.852C1.87665 12.852 0.581647 12.0405 2.79415 11.229C8.19065 8.68601 14.8281 6.08901 20.7096 3.65401" fill="white"/></svg>`,
      linkedin: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 3C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19ZM18.5 18.5V13.2C18.5 12.3354 18.1565 11.5062 17.5452 10.8948C16.9338 10.2835 16.1046 9.94 15.24 9.94C14.39 9.94 13.4 10.46 12.92 11.24V10.13H10.13V18.5H12.92V13.57C12.92 12.8 13.54 12.17 14.31 12.17C14.6813 12.17 15.0374 12.3175 15.2999 12.5801C15.5625 12.8426 15.71 13.1987 15.71 13.57V18.5H18.5ZM6.88 8.56C7.32556 8.56 7.75288 8.383 8.06794 8.06794C8.383 7.75288 8.56 7.32556 8.56 6.88C8.56 5.95 7.81 5.19 6.88 5.19C6.43178 5.19 6.00193 5.36805 5.68499 5.68499C5.36805 6.00193 5.19 6.43178 5.19 6.88C5.19 7.81 5.95 8.56 6.88 8.56ZM8.27 18.5V10.13H5.5V18.5H8.27Z" fill="white"/></svg>`,
      email: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.234 4.357C2.08282 4.53715 1.99996 4.76482 2 5V17C2 17.7956 2.31607 18.5587 2.87868 19.1213C3.44129 19.6839 4.20435 20 5 20H19C19.7956 20 20.5587 19.6839 21.1213 19.1213C21.6839 18.5587 22 17.7956 22 17V5.01C22.0014 4.86092 21.9694 4.71342 21.9064 4.57828C21.8435 4.44315 21.7511 4.32381 21.636 4.229C21.4581 4.08203 21.2348 4.00112 21.004 4H3C2.854 3.99998 2.70977 4.03193 2.57743 4.09361C2.4451 4.15528 2.32788 4.24518 2.234 4.357ZM4 7.414V17C4 17.2652 4.10536 17.5196 4.29289 17.7071C4.48043 17.8946 4.73478 18 5 18H19C19.2652 18 19.5196 17.8946 19.7071 17.7071C19.8946 17.5196 20 17.2652 20 17V7.414L12.707 14.707C12.5195 14.8945 12.2652 14.9998 12 14.9998C11.7348 14.9998 11.4805 14.8945 11.293 14.707L4 7.414Z" fill="white"/></svg>`,
      github: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C10.6868 2 9.38642 2.25866 8.17317 2.7612C6.95991 3.26375 5.85752 4.00035 4.92893 4.92893C3.05357 6.8043 2 9.34784 2 12C2 16.42 4.87 20.17 8.84 21.5C9.34 21.58 9.5 21.27 9.5 21V19.31C6.73 19.91 6.14 17.97 6.14 17.97C5.68 16.81 5.03 16.5 5.03 16.5C4.12 15.88 5.1 15.9 5.1 15.9C6.1 15.97 6.63 16.93 6.63 16.93C7.5 18.45 8.97 18 9.54 17.76C9.63 17.11 9.89 16.67 10.17 16.42C7.95 16.17 5.62 15.31 5.62 11.5C5.62 10.39 6 9.5 6.65 8.79C6.55 8.54 6.2 7.5 6.75 6.15C6.75 6.15 7.59 5.88 9.5 7.17C10.29 6.95 11.15 6.84 12 6.84C12.85 6.84 13.71 6.95 14.5 7.17C16.41 5.88 17.25 6.15 17.25 6.15C17.8 7.5 17.45 8.54 17.35 8.79C18 9.5 18.38 10.39 18.38 11.5C18.38 15.32 16.04 16.16 13.81 16.41C14.17 16.72 14.5 17.33 14.5 18.26V21C14.5 21.27 14.66 21.59 15.17 21.5C19.14 20.16 22 16.42 22 12C22 10.6868 21.7413 9.38642 21.2388 8.17317C20.7362 6.95991 19.9997 5.85752 19.0711 4.92893C18.1425 4.00035 17.0401 3.26375 15.8268 2.7612C14.6136 2.25866 13.3132 2 12 2Z" fill="white"/></svg>`,
      download: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 15L12 20M12 20L7 15M12 20V7M6 4H18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      heart: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.0712 13.1437L13.4142 18.8017C13.0391 19.1767 12.5305 19.3873 12.0002 19.3873C11.4699 19.3873 10.9613 19.1767 10.5862 18.8017L4.9292 13.1447C4.46157 12.6812 4.09011 12.1298 3.83613 11.5223C3.58216 10.9148 3.45067 10.2632 3.44923 9.6047C3.44779 8.94625 3.57642 8.294 3.82773 7.68539C4.07904 7.07679 4.44809 6.52381 4.91369 6.05822C5.37928 5.59262 5.93226 5.22357 6.54086 4.97226C7.14947 4.72095 7.80172 4.59232 8.46017 4.59376C9.11862 4.5952 9.7703 4.72669 10.3778 4.98066C10.9853 5.23464 11.5367 5.6061 12.0002 6.07373C12.9418 5.15561 14.2072 4.6454 15.5222 4.65364C16.8373 4.66188 18.0962 5.1879 19.0262 6.11776C19.9562 7.04761 20.4824 8.30643 20.4908 9.62151C20.4992 10.9366 19.9892 12.202 19.0712 13.1437Z" stroke="#101828" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      eye: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.6"><path d="M14.999 12C14.999 12.7956 14.683 13.5587 14.1203 14.1213C13.5577 14.6839 12.7947 15 11.999 15C11.2034 15 10.4403 14.6839 9.8777 14.1213C9.31509 13.5587 8.99902 12.7956 8.99902 12C8.99902 11.2044 9.31509 10.4413 9.8777 9.87868C10.4403 9.31607 11.2034 9 11.999 9C12.7947 9 13.5577 9.31607 14.1203 9.87868C14.683 10.4413 14.999 11.2044 14.999 12Z" stroke="#0E1621" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M1.99805 12C3.59805 7.903 7.33405 5 11.998 5C16.662 5 20.398 7.903 21.998 12C20.398 16.097 16.662 19 11.998 19C7.33405 19 3.59805 16.097 1.99805 12Z" stroke="#0E1621" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`,
      clock: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.6"><path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#0E1621" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.999 8V13H15.999" stroke="#0E1621" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`,
      copy: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 3H4V16" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 7H20V19C20 19.5304 19.7893 20.0391 19.4142 20.4142C19.0391 20.7893 18.5304 21 18 21H10C9.46957 21 8.96086 20.7893 8.58579 20.4142C8.21071 20.0391 8 19.5304 8 19V7Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      close: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    };
    
    return fallbacks[iconName] || '';
  }

  // ANCHOR: navigation_icons
  // UPDATED COMMENTS: All navigation icons using external files with fallbacks

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

  /**
   * Preload all icons for better performance
   * SCALED FOR: Preloading strategy for faster icon display
   */
  async preloadAllIcons() {
    const iconNames = Object.keys(this.iconPaths);
    const loadPromises = iconNames.map(name => this.loadIcon(name));
    
    try {
      await Promise.all(loadPromises);
    } catch (error) {
      console.error('Failed to preload some icons:', error);
    }
  }

  /**
   * Clear icon cache
   * SCALED FOR: Memory management
   */
  clearCache() {
    this.iconCache.clear();
  }
}
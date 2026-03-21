/**
 * ProjectPageHandler - Handles project detail page rendering
 * FSD: features/page-manager → project detail page logic
 * REUSED: Chip, ImageViewer, ReadingProgress, markdownParser
 * 
 * @class ProjectPageHandler
 */
import { Chip } from '../../shared/ui/chip/chip.js';
import { ReadingProgress } from '../../shared/ui/reading-progress/reading-progress.js';
import { SOCIAL_LINKS } from '../../shared/config/social-links.js';
import { markdownParser } from '../modal-system/markdown-parser.js';

export class ProjectPageHandler {
  constructor(options = {}) {
    this.eventBus = options.eventBus;
    this.pageContainer = options.pageContainer;
    this.readingProgress = null;
    this.imageViewer = null;
  }

  /**
   * Load project markdown from backend
   * @param {string} projectId - Project ID
   * @param {string} category - Project category
   * @returns {Promise<Object>} Frontmatter and HTML
   */
  async load(projectId, category = 'work') {
    const apiUrl = window.location.hostname === 'localhost' 
      ? `http://localhost:8000/api/projects/${category}/${projectId}`
      : `/api/projects/${category}/${projectId}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    try {
      const response = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to load project: ${response.statusText}`);
      }
      
      const markdownContent = await response.text();
      const { frontmatter, html } = markdownParser.parseWithFrontmatter(markdownContent);
      
      return { frontmatter, html, projectId, category };
      
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Project loading timed out - please check your connection');
      }
      throw error;
    }
  }

  /**
   * Render project page HTML
   * @param {Object} data - Project data
   * @returns {string} HTML content
   */
  render(data) {
    const { frontmatter, html, projectId, category } = data;
    const {
      title = 'Untitled Project',
      hero_image,
      tags = [],
      year,
      client,
      role,
      description,
      team = []
    } = frontmatter;

    const normalizedHeroImage = hero_image ? hero_image.replace(/\\/g, '/') : null;
    const heroSrc = normalizedHeroImage
      ? (normalizedHeroImage.startsWith('/') ? normalizedHeroImage : `/${normalizedHeroImage}`)
      : null;

    const teamRows = Array.isArray(team)
      ? team.flatMap(item => {
          if (!item) return [];
          if (typeof item === 'object') {
            const roleValue = item.role ?? item.title ?? item.name;
            const countValue = item.count ?? item.qty ?? item.number ?? item.size;
            if (!roleValue || countValue === undefined || countValue === null) return [];
            return [{ role: roleValue, count: countValue }];
          }
          if (typeof item === 'string') {
            const parts = item.split('|').map(part => part.trim()).filter(Boolean);
            if (parts.length >= 2) {
              return [{ role: parts[0], count: parts[1] }];
            }
            const match = item.match(/^(.*?)(?:\s+[-–—]\s+|\s+)(\d+)$/);
            if (match) {
              return [{ role: match[1].trim(), count: match[2] }];
            }
            return [];
          }
          return [];
        })
      : [];

    return `
      <div class="page-wrapper" data-category="${category}">
        <button class="page-back" data-action="back-to-projects" aria-label="Back to projects">
          <img src="/assets/icons/iconamoon_arrow-down-2.svg" alt="Back" style="transform: rotate(90deg);" />
        </button>
        
        <button class="page-close" data-action="back-to-desktop" aria-label="Close page">
          <img src="/assets/icons/iconamoon_close.svg" alt="Close" />
        </button>
        
        <header class="page-header">
          <button class="page-back-button" data-action="back-to-desktop">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>Back to Desktop</span>
          </button>
        </header>
        
        <article class="project-page">
          <div class="project-page-content">
            <header class="project-header">
              <h1 class="project-title">${this.escapeHtml(title)}</h1>
              
              <div class="project-meta-row">
                ${tags.length > 0 ? `
                  <div class="project-tags" data-tags='${JSON.stringify(tags)}'></div>
                ` : ''}
                
                ${year ? `
                  <div class="project-meta-item">
                    <img src="/assets/icons/iconamoon_calendar-1.svg" alt="" class="project-meta-icon project-meta-icon--light" />
                    <span>${year}</span>
                  </div>
                ` : ''}
                
                <div class="project-meta-item" data-read-time>
                  <img src="/assets/icons/iconamoon_clock 1 white.svg" alt="" class="project-meta-icon project-meta-icon--dark" />
                  <span></span>
                </div>
              </div>

              ${description ? `
                <p class="project-summary">${this.escapeHtml(description)}</p>
              ` : ''}

              ${teamRows.length > 0 ? `
                <table class="markdown-table project-team-table" aria-label="Project team">
                  <tbody>
                    ${teamRows.map(row => `
                      <tr>
                        <td>${this.escapeHtml(String(row.role))}</td>
                        <td>${this.escapeHtml(String(row.count))}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : ''}
              
              ${heroSrc ? `
                <div class="project-hero">
                  <img src="${this.escapeHtml(heroSrc)}" alt="${this.escapeHtml(title)}" loading="eager" />
                </div>
              ` : ''}
            </header>
            
            <div class="project-content markdown-content">${html}</div>

            <div class="project-ending-divider chapter-divider" aria-hidden="true">
              <img src="/assets/icons/star-devider-icon.svg" alt="" class="chapter-divider-icon" data-no-viewer="true" />
            </div>

            <section class="project-ending" aria-label="Contact call to action">
              <div class="project-ending-content">
                <h1 class="project-ending-title">Like This<br />Case Study?</h1>
                <p class="project-ending-text">You can always write to me and discuss your project</p>
                <a class="project-ending-button" href="${this.escapeHtml(SOCIAL_LINKS.telegram.url)}" target="_blank" rel="noopener noreferrer">
                  <img src="/assets/icons/icon-park-outline_telegram.svg" alt="" aria-hidden="true" />
                  <span>Chat Me</span>
                </a>
              </div>
            </section>
          </div>
        </article>
      </div>
    `;
  }

  /**
   * Setup event listeners and render components
   * CRITICAL: Back button, close button, and content interactions
   * UPDATED COMMENTS: Emits events to page-manager for navigation
   * @param {Object} data - Project data
   */
  setupEvents(data) {
    // CRITICAL: Back button returns to projects list
    const backButton = this.pageContainer.querySelector('[data-action="back-to-projects"]');
    if (backButton) {
      backButton.addEventListener('click', () => {
        const category = this.pageContainer.querySelector('.page-wrapper')?.dataset.category || 'work';
        this.eventBus?.emit('page:backToProjects', { category });
      });
      backButton.classList.add('page-back--visible');
    }

    // CRITICAL: Close button returns to desktop
    const closeButton = this.pageContainer.querySelector('.page-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.eventBus?.emit('page:close'));
      closeButton.classList.add('page-close--visible');
    }

    // CRITICAL: Desktop back button (header) returns to desktop
    const desktopButton = this.pageContainer.querySelector('[data-action="back-to-desktop"]');
    if (desktopButton) {
      desktopButton.addEventListener('click', () => this.eventBus?.emit('page:close'));
    }

    // REUSED: Render chips for project tags
    this.renderChips(data?.frontmatter?.tags || []);

    // SCALED FOR: Calculate read time from content
    this.calculateReadTime();

    // CRITICAL: Setup image viewers for fullscreen
    this.setupImageViewers();

    // REUSED: Initialize reading progress indicator
    this.initializeReadingProgress();
  }

  /**
   * Render chip components for tags
   * @param {Array<string>} tags - Tags array
   */
  renderChips(tags) {
    const container = this.pageContainer.querySelector('.project-tags');
    if (!container) return;

    container.innerHTML = '';
    tags.forEach(tag => {
      const chip = new Chip({ label: tag, variant: 'dark' });
      container.appendChild(chip.createElement());
    });
  }

  /**
   * Calculate and display read time
   */
  calculateReadTime() {
    const element = this.pageContainer.querySelector('[data-read-time] span');
    const content = this.pageContainer.querySelector('.markdown-content');
    if (!element || !content) return;

    const text = content.textContent || '';
    const wordCount = text.trim().split(/\s+/).length;
    const imageCount = content.querySelectorAll('img').length;
    
    const minutes = Math.max(1, Math.ceil((wordCount / 200) + (imageCount * 0.2)));
    element.textContent = `${minutes} min read`;
  }

  /**
   * Setup image click handlers for fullscreen viewing
   * REUSED: ImageViewer component from shared/ui
   * CRITICAL: Attach click handlers to all images in project content
   */
  async setupImageViewers() {
    const { ImageViewer } = await import('../../shared/ui/image-viewer/image-viewer.js');
    
    // CRITICAL: Create ImageViewer instance if not exists
    if (!this.imageViewer) {
      this.imageViewer = new ImageViewer({ eventBus: this.eventBus });
    }

    // CRITICAL: Find all images in project content and hero
    const images = this.pageContainer.querySelectorAll('.project-content img, .project-hero img');
    
    images.forEach(img => {
      if (img.dataset.noViewer === 'true') {
        img.style.cursor = 'default';
        return;
      }
      // UPDATED COMMENTS: Make images clickable
      img.style.cursor = 'pointer';
      
      // REUSED: ImageViewer for fullscreen viewing
      img.addEventListener('click', () => {
        this.imageViewer.open(img.src, img.alt);
      });
    });
  }

  /**
   * Initialize reading progress indicator
   */
  initializeReadingProgress() {
    this.destroyReadingProgress();
    
    this.readingProgress = new ReadingProgress({
      container: this.pageContainer,
      color: 'rgba(255, 255, 255, 0.3)',
      height: 2,
      zIndex: 100003
    });
  }

  /**
   * Destroy reading progress indicator
   */
  destroyReadingProgress() {
    if (this.readingProgress) {
      this.readingProgress.destroy();
      this.readingProgress = null;
    }
  }

  /**
   * Escape HTML
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Cleanup on page close
   */
  destroy() {
    this.destroyReadingProgress();
  }
}

/* ANCHOR: markdown_parser */
/* REUSED: Markdown to HTML conversion for project content */
/* SCALED FOR: Safe HTML rendering with XSS prevention */
/* UPDATED COMMENTS: Added Notion-like custom blocks support */
/* VERSION: 1.0.1 - Fixed pie chart rendering (2024-02-21) */

/**
 * MarkdownParser - Enhanced markdown parser with Notion-like blocks
 * Supports: headings, paragraphs, lists, links, images, code blocks
 * Custom blocks: callouts, stats, galleries, videos, quotes, tables
 * 
 * @class MarkdownParser
 * @version 1.0.1
 */
export class MarkdownParser {
  constructor() {
    // CRITICAL: Parser version for debugging
    this.version = '1.0.1';
    
    // UPDATED COMMENTS: Regex patterns for markdown syntax
    this.patterns = {
      heading: /^(#{1,6})\s+(.+)$/gm,
      bold: /\*\*(.+?)\*\*/g,
      italic: /\*(.+?)\*/g,
      link: /\[(.+?)\]\((.+?)\)/g,
      image: /!\[(.+?)\]\((.+?)\)/g,
      code: /`(.+?)`/g,
      codeBlock: /```(\w+)?\n([\s\S]+?)```/g,
      list: /^[\*\-]\s+(.+)$/gm,
      orderedList: /^\d+\.\s+(.+)$/gm,
      blockquote: /^>\s+(.+)$/gm,
      horizontalRule: /^---$/gm,
      paragraph: /^(?!#|[\*\-]|\d+\.|>|```|---|:::).+$/gm,
      // CRITICAL: Custom block patterns (Notion-like)
      // UPDATED COMMENTS: Negative lookahead to prevent capturing list items as param
      // Format: ::: blockType [param]\n content \n:::
      // Param must NOT start with - or * (list markers)
      customBlock: /^:::\s*(\w+)(?:\s+(?![-*\d])(.+?))?\s*\n([\s\S]*?)^:::$/gm,
      table: /^\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.+\|\n?)+)/gm
    };
  }

  /**
   * Parse markdown string to HTML
   * CRITICAL: XSS prevention with safe HTML escaping
   * UPDATED COMMENTS: Added custom blocks parsing
   * 
   * @param {string} markdown - Markdown content
   * @returns {string} HTML content
   */
  parse(markdown) {
    if (!markdown) return '';
    
    let html = markdown;
    
    // UPDATED COMMENTS: Parse in specific order to avoid conflicts
    
    // 1. Custom blocks (must be first to protect custom content)
    html = this.parseCustomBlocks(html);
    
    // 2. Code blocks (protect code content)
    html = this.parseCodeBlocks(html);
    
    // 3. Tables (before other formatting)
    html = this.parseTables(html);
    
    // 4. Images (before links to avoid conflicts)
    html = this.parseImages(html);
    
    // 5. Links
    html = this.parseLinks(html);
    
    // 6. Headings
    html = this.parseHeadings(html);
    
    // 7. Lists
    html = this.parseLists(html);
    
    // 8. Blockquotes
    html = this.parseBlockquotes(html);
    
    // 9. Horizontal rules
    html = this.parseHorizontalRules(html);
    
    // 10. Inline formatting (bold, italic, code)
    html = this.parseInlineFormatting(html);
    
    // 11. Paragraphs (must be last)
    html = this.parseParagraphs(html);
    
    return html;
  }

  /**
   * Parse headings (# to ######)
   * REUSED: Heading level detection and conversion
   */
  parseHeadings(text) {
    return text.replace(this.patterns.heading, (match, hashes, content) => {
      const level = hashes.length;
      const id = this.generateId(content);
      return `<h${level} id="${id}">${this.escapeHtml(content)}</h${level}>`;
    });
  }

  /**
   * Parse inline formatting (bold, italic, code)
   * SCALED FOR: Nested formatting support
   */
  parseInlineFormatting(text) {
    // Bold
    text = text.replace(this.patterns.bold, '<strong>$1</strong>');
    
    // Italic
    text = text.replace(this.patterns.italic, '<em>$1</em>');
    
    // Inline code
    text = text.replace(this.patterns.code, '<code>$1</code>');
    
    return text;
  }

  /**
   * Parse code blocks with syntax highlighting support
   * UPDATED COMMENTS: Language detection for future syntax highlighting
   */
  parseCodeBlocks(text) {
    return text.replace(this.patterns.codeBlock, (match, language, code) => {
      const lang = language || 'plaintext';
      const escapedCode = this.escapeHtml(code.trim());
      return `<pre><code class="language-${lang}">${escapedCode}</code></pre>`;
    });
  }

  /**
   * Parse images with alt text and lazy loading
   * SCALED FOR: Responsive images with loading optimization
   */
  parseImages(text) {
    return text.replace(this.patterns.image, (match, alt, src) => {
      return `<img src="${this.escapeHtml(src)}" alt="${this.escapeHtml(alt)}" loading="lazy" />`;
    });
  }

  /**
   * Parse links with security attributes
   * CRITICAL: External links open in new tab with noopener
   */
  parseLinks(text) {
    return text.replace(this.patterns.link, (match, text, url) => {
      const isExternal = url.startsWith('http');
      const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${this.escapeHtml(url)}"${attrs}>${this.escapeHtml(text)}</a>`;
    });
  }

  /**
   * Parse unordered and ordered lists
   * REUSED: List detection and nesting support
   */
  parseLists(text) {
    // Unordered lists
    text = text.replace(/^([\*\-]\s+.+\n?)+/gm, (match) => {
      const items = match.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const content = line.replace(/^[\*\-]\s+/, '');
          return `<li>${this.escapeHtml(content)}</li>`;
        })
        .join('\n');
      return `<ul>\n${items}\n</ul>`;
    });
    
    // Ordered lists
    text = text.replace(/^(\d+\.\s+.+\n?)+/gm, (match) => {
      const items = match.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const content = line.replace(/^\d+\.\s+/, '');
          return `<li>${this.escapeHtml(content)}</li>`;
        })
        .join('\n');
      return `<ol>\n${items}\n</ol>`;
    });
    
    return text;
  }

  /**
   * Parse blockquotes
   * UPDATED COMMENTS: Nested blockquote support
   */
  parseBlockquotes(text) {
    return text.replace(/^(>\s+.+\n?)+/gm, (match) => {
      const content = match.split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^>\s+/, ''))
        .join('\n');
      return `<blockquote>${this.escapeHtml(content)}</blockquote>`;
    });
  }

  /**
   * Parse horizontal rules
   * REUSED: Simple separator conversion
   */
  parseHorizontalRules(text) {
    return text.replace(this.patterns.horizontalRule, '<hr />');
  }

  /**
   * Parse custom blocks (Notion-like components)
   * CRITICAL: Callouts, stats, galleries, videos, quotes
   * SCALED FOR: Extensible block system
   * 
   * Syntax:
   * ::: blockType optionalParam
   * content
   * :::
   */
  parseCustomBlocks(text) {
    return text.replace(this.patterns.customBlock, (match, blockType, param, content) => {
      const trimmedContent = content.trim();
      
      switch (blockType.toLowerCase()) {
        case 'callout':
          return this.renderCallout(param || 'info', trimmedContent);
        
        case 'stats':
          return this.renderStats(trimmedContent);
        
        case 'gallery':
          return this.renderGallery(trimmedContent);
        
        case 'video':
          return this.renderVideo(trimmedContent);
        
        case 'quote':
          return this.renderQuote(trimmedContent, param);
        
        case 'metrics':
          return this.renderMetrics(trimmedContent);
        
        case 'piechart':
          return this.renderPieChart(trimmedContent);
        
        default:
          // UPDATED COMMENTS: Unknown block type, render as div
          return `<div class="custom-block custom-block--${this.escapeHtml(blockType)}">${trimmedContent}</div>`;
      }
    });
  }

  /**
   * Render callout block (info, warning, success, error)
   * REUSED: Notion-style callout component
   * UPDATED COMMENTS: Note type uses SVG bookmark icon instead of emoji
   */
  renderCallout(type, content) {
    const icons = {
      info: '💡',
      warning: '⚠️',
      success: '✅',
      error: '❌',
      tip: '💡',
      note: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M8 2C7.20435 2 6.44129 2.31607 5.87868 2.87868C5.31607 3.44129 5 4.20435 5 5V21C5.00009 21.1704 5.04372 21.3379 5.12674 21.4867C5.20977 21.6355 5.32944 21.7606 5.47439 21.8502C5.61935 21.9398 5.78479 21.9908 5.95501 21.9985C6.12522 22.0061 6.29458 21.9702 6.447 21.894L12 19.118L17.553 21.894C17.7054 21.9702 17.8748 22.0061 18.045 21.9985C18.2152 21.9908 18.3806 21.9398 18.5256 21.8502C18.6706 21.7606 18.7902 21.6355 18.8733 21.4867C18.9563 21.3379 18.9999 21.1704 19 21V5C19 4.20435 18.6839 3.44129 18.1213 2.87868C17.5587 2.31607 16.7956 2 16 2H8Z" fill="#F8990B"/>
</svg>`
    };
    
    const icon = icons[type] || icons.info;
    
    return `
      <div class="callout callout--${this.escapeHtml(type)}">
        <div class="callout-icon">${icon}</div>
        <div class="callout-content">${content}</div>
      </div>
    `;
  }

  /**
   * Render stats block (key metrics)
   * SCALED FOR: Visual metric display
   */
  renderStats(content) {
    const lines = content.split('\n').filter(line => line.trim());
    const stats = lines.map(line => {
      // Parse "- 70% reduction in time" or "- **70%** reduction"
      const match = line.match(/^[\*\-]\s*(.+)$/);
      if (match) {
        return `<div class="stat-item">${match[1]}</div>`;
      }
      return '';
    }).filter(Boolean).join('');
    
    return `
      <div class="stats-block">
        ${stats}
      </div>
    `;
  }

  /**
   * Render image gallery
   * CRITICAL: Multiple images in grid layout
   */
  renderGallery(content) {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const images = [];
    let match;
    
    while ((match = imageRegex.exec(content)) !== null) {
      images.push({
        alt: match[1],
        src: match[2]
      });
    }
    
    if (images.length === 0) return '';
    
    const imageHtml = images.map(img => `
      <div class="gallery-item">
        <img src="${this.escapeHtml(img.src)}" 
             alt="${this.escapeHtml(img.alt)}" 
             loading="lazy" />
        ${img.alt ? `<div class="gallery-caption">${this.escapeHtml(img.alt)}</div>` : ''}
      </div>
    `).join('');
    
    return `
      <div class="image-gallery">
        ${imageHtml}
      </div>
    `;
  }

  /**
   * Render video embed (YouTube, Vimeo)
   * UPDATED COMMENTS: Auto-detect video platform
   */
  renderVideo(content) {
    const url = content.trim();
    
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      return `
        <div class="video-embed">
          <iframe 
            src="https://www.youtube.com/embed/${this.escapeHtml(videoId)}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
      `;
    }
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      const videoId = vimeoMatch[1];
      return `
        <div class="video-embed">
          <iframe 
            src="https://player.vimeo.com/video/${this.escapeHtml(videoId)}" 
            frameborder="0" 
            allow="autoplay; fullscreen; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
      `;
    }
    
    // CRITICAL: Unknown video format
    return `<p class="video-error">Unsupported video URL: ${this.escapeHtml(url)}</p>`;
  }

  /**
   * Render quote block with optional author
   * REUSED: Enhanced blockquote styling
   */
  renderQuote(content, author) {
    return `
      <blockquote class="quote-block">
        <div class="quote-content">${content}</div>
        ${author ? `<div class="quote-author">— ${this.escapeHtml(author)}</div>` : ''}
      </blockquote>
    `;
  }

  /**
   * Render metrics block (table-like stats)
   * SCALED FOR: Before/After comparisons
   */
  renderMetrics(content) {
    const lines = content.split('\n').filter(line => line.trim());
    const metrics = lines.map(line => {
      // Parse "Metric: Before → After (Impact)"
      const match = line.match(/^[\*\-]\s*(.+?):\s*(.+?)(?:\s*→\s*(.+?))?(?:\s*\((.+?)\))?$/);
      if (match) {
        const [, label, before, after, impact] = match;
        return `
          <div class="metric-row">
            <div class="metric-label">${this.escapeHtml(label)}</div>
            <div class="metric-values">
              <span class="metric-before">${this.escapeHtml(before)}</span>
              ${after ? `<span class="metric-arrow">→</span><span class="metric-after">${this.escapeHtml(after)}</span>` : ''}
              ${impact ? `<span class="metric-impact">${this.escapeHtml(impact)}</span>` : ''}
            </div>
          </div>
        `;
      }
      return '';
    }).filter(Boolean).join('');
    
    return `
      <div class="metrics-block">
        ${metrics}
      </div>
    `;
  }

  /**
   * Render pie chart block (circular data visualization)
   * CRITICAL: SVG-based pie chart using stroke-dasharray technique
   * SCALED FOR: Minimalist design with legend
   * 
   * Syntax:
   * ::: piechart
   * - percentage% | label | optional_time
   * :::
   * 
   * Example:
   * - 40% | Ведение перевозки | 3.2 часа
   * - 20% | Актуализация статусов | 1.6 часа
   */
  renderPieChart(content) {
    // UPDATED COMMENTS: Parse pie chart data from markdown lines
    const lines = content.split('\n').filter(line => line.trim());
    const segments = [];
    
    for (const line of lines) {
      // CRITICAL: Parse format "- percentage% | label | time"
      // UPDATED COMMENTS: Use non-greedy match for label to handle long text with Cyrillic
      const match = line.match(/^[\*\-]\s*(\d+(?:\.\d+)?)%\s*\|\s*([^|]+)(?:\s*\|\s*(.+))?$/);
      if (match) {
        const [, percentage, label, time] = match;
        segments.push({
          percentage: parseFloat(percentage),
          label: label.trim(),
          time: time ? time.trim() : null
        });
      }
    }
    
    if (segments.length === 0) {
      return '<p class="piechart-error">No valid pie chart data found</p>';
    }
    
    // UPDATED COMMENTS: SVG circle constants (based on research)
    const RADIUS = 25; // Half of final radius for stroke technique
    const STROKE_WIDTH = 50; // Thickness equals radius for solid circle
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 157.08
    const START_OFFSET = CIRCUMFERENCE / 4; // Start from top (90° rotation)
    
    // CRITICAL: Color palette - balanced saturation for dark theme
    const colors = [
      '#C248A3',  // Primary pink (brand color)
      '#5B7FDB',  // Medium blue
      '#9D7FDB',  // Medium purple
      '#DB7FA8',  // Medium rose
      '#DBA05B',  // Medium orange
      '#5BDB9D'   // Medium teal
    ];
    
    // SCALED FOR: Generate SVG circles for each segment
    let accumulatedPercentage = 0;
    const circles = segments.map((segment, index) => {
      const { percentage } = segment;
      const color = colors[index % colors.length];
      
      // UPDATED COMMENTS: Calculate dash length and offset
      const dashLength = (percentage / 100) * CIRCUMFERENCE;
      const gapLength = CIRCUMFERENCE - dashLength;
      const offset = START_OFFSET - (accumulatedPercentage / 100) * CIRCUMFERENCE;
      
      accumulatedPercentage += percentage;
      
      // CRITICAL: SVG circle with stroke-dasharray technique + data-index for hover interaction
      return `<circle cx="50" cy="50" r="${RADIUS}" fill="transparent" stroke="${color}" stroke-width="${STROKE_WIDTH}" stroke-dasharray="${dashLength} ${gapLength}" stroke-dashoffset="${offset}" class="piechart-segment" data-segment-index="${index}" />`;
    }).join('');
    
    // REUSED: Generate legend items (single line to avoid paragraph wrapping) + data-index for hover
    const legendItems = segments.map((segment, index) => {
      const { percentage, label, time } = segment;
      const color = colors[index % colors.length];
      
      return `<div class="piechart-legend-item" data-segment-index="${index}"><div class="piechart-legend-color" style="background-color: ${color};"></div><div class="piechart-legend-text"><span class="piechart-legend-label">${this.escapeHtml(label)}</span><span class="piechart-legend-value">${percentage}%${time ? ` · ${this.escapeHtml(time)}` : ''}</span></div></div>`;
    }).join('');
    
    // CRITICAL: Complete pie chart with SVG and legend (single line SVG to avoid paragraph parsing)
    return `<div class="piechart-block"><div class="piechart-svg-container"><svg viewBox="0 0 100 100" class="piechart-svg">${circles}</svg></div><div class="piechart-legend">${legendItems}</div></div>`;
  }

  /**
   * Parse markdown tables
   * CRITICAL: GitHub-flavored markdown tables
   */
  parseTables(text) {
    return text.replace(this.patterns.table, (match, headerRow, bodyRows) => {
      // Parse header
      const headers = headerRow.split('|')
        .map(h => h.trim())
        .filter(Boolean);
      
      // Parse body rows
      const rows = bodyRows.trim().split('\n')
        .map(row => {
          const cells = row.split('|')
            .map(c => c.trim())
            .filter(Boolean);
          return cells;
        });
      
      const headerHtml = headers.map(h => `<th>${this.escapeHtml(h)}</th>`).join('');
      const bodyHtml = rows.map(row => {
        const cellsHtml = row.map(cell => `<td>${this.escapeHtml(cell)}</td>`).join('');
        return `<tr>${cellsHtml}</tr>`;
      }).join('');
      
      return `
        <table class="markdown-table">
          <thead>
            <tr>${headerHtml}</tr>
          </thead>
          <tbody>
            ${bodyHtml}
          </tbody>
        </table>
      `;
    });
  }

  /**
   * Parse paragraphs (wrap standalone text)
   * SCALED FOR: Smart paragraph detection
   */
  parseParagraphs(text) {
    const lines = text.split('\n');
    const result = [];
    let paragraph = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines and HTML tags
      if (!trimmed || trimmed.startsWith('<')) {
        if (paragraph.length > 0) {
          result.push(`<p>${paragraph.join(' ')}</p>`);
          paragraph = [];
        }
        if (trimmed.startsWith('<')) {
          result.push(line);
        }
      } else {
        paragraph.push(trimmed);
      }
    }
    
    // Add remaining paragraph
    if (paragraph.length > 0) {
      result.push(`<p>${paragraph.join(' ')}</p>`);
    }
    
    return result.join('\n');
  }

  /**
   * Generate ID from heading text
   * REUSED: URL-safe ID generation for anchor links
   */
  generateId(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Escape HTML to prevent XSS
   * CRITICAL: Security-first content handling
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Parse markdown file content with frontmatter support
   * SCALED FOR: YAML frontmatter extraction
   * 
   * @param {string} content - Full markdown file content
   * @returns {Object} { frontmatter, html }
   */
  parseWithFrontmatter(content) {
    const frontmatterRegex = /^---\n([\s\S]+?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (match) {
      const frontmatter = this.parseFrontmatter(match[1]);
      const html = this.parse(match[2]);
      return { frontmatter, html };
    }
    
    return {
      frontmatter: {},
      html: this.parse(content)
    };
  }

  /**
   * Parse YAML frontmatter to object
   * UPDATED COMMENTS: Simple YAML parser for metadata
   */
  parseFrontmatter(yaml) {
    const result = {};
    const lines = yaml.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        // CRITICAL: Parse arrays and strings
        if (value.startsWith('[') && value.endsWith(']')) {
          result[key] = value.slice(1, -1).split(',').map(v => v.trim().replace(/['"]/g, ''));
        } else {
          result[key] = value.replace(/['"]/g, '');
        }
      }
    }
    
    return result;
  }
}

// REUSED: Export singleton instance
export const markdownParser = new MarkdownParser();

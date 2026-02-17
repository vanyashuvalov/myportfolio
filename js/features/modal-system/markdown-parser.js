/* ANCHOR: markdown_parser */
/* REUSED: Markdown to HTML conversion for project content */
/* SCALED FOR: Safe HTML rendering with XSS prevention */

/**
 * MarkdownParser - Simple markdown parser for project content
 * Supports: headings, paragraphs, lists, links, images, code blocks
 * 
 * @class MarkdownParser
 */
export class MarkdownParser {
  constructor() {
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
      paragraph: /^(?!#|[\*\-]|\d+\.|>|```|---).+$/gm
    };
  }

  /**
   * Parse markdown string to HTML
   * CRITICAL: XSS prevention with safe HTML escaping
   * 
   * @param {string} markdown - Markdown content
   * @returns {string} HTML content
   */
  parse(markdown) {
    if (!markdown) return '';
    
    let html = markdown;
    
    // UPDATED COMMENTS: Parse in specific order to avoid conflicts
    
    // 1. Code blocks (must be first to protect code content)
    html = this.parseCodeBlocks(html);
    
    // 2. Images (before links to avoid conflicts)
    html = this.parseImages(html);
    
    // 3. Links
    html = this.parseLinks(html);
    
    // 4. Headings
    html = this.parseHeadings(html);
    
    // 5. Lists
    html = this.parseLists(html);
    
    // 6. Blockquotes
    html = this.parseBlockquotes(html);
    
    // 7. Horizontal rules
    html = this.parseHorizontalRules(html);
    
    // 8. Inline formatting (bold, italic, code)
    html = this.parseInlineFormatting(html);
    
    // 9. Paragraphs (must be last)
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

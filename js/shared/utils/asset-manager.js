/* ANCHOR: asset_manager */
/* REUSED: Universal asset loading and optimization system */
/* SCALED FOR: Efficient resource management with caching */

/**
 * AssetManager - Optimize loading and caching of images and resources
 * Features: Lazy loading, WebP support, progressive enhancement, memory management
 * 
 * @class AssetManager
 */
export class AssetManager {
  constructor(options = {}) {
    this.cache = new Map();
    this.loadingPromises = new Map();
    this.preloadQueue = [];
    this.maxCacheSize = options.maxCacheSize || 50;
    this.supportsWebP = null;
    this.supportsAvif = null;
    
    this.init();
  }

  /**
   * Initialize asset manager with feature detection
   * UPDATED COMMENTS: Progressive enhancement with format support detection
   */
  async init() {
    this.supportsWebP = await this.checkFormatSupport('webp');
    this.supportsAvif = await this.checkFormatSupport('avif');
  }

  /**
   * Check support for modern image formats
   * REUSED: Feature detection pattern for progressive enhancement
   */
  checkFormatSupport(format) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      
      const dataURL = canvas.toDataURL(`image/${format}`);
      resolve(dataURL.indexOf(`data:image/${format}`) === 0);
    });
  }

  /**
   * Load image with format optimization and caching
   * SCALED FOR: High-performance image loading with fallbacks
   */
  async loadImage(src, options = {}) {
    const optimizedSrc = this.getOptimizedImageSrc(src);
    const cacheKey = `${optimizedSrc}:${JSON.stringify(options)}`;
    
    // Return cached image if available
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Return existing loading promise if in progress
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }
    
    const loadPromise = this.createImageLoadPromise(optimizedSrc, src, options);
    this.loadingPromises.set(cacheKey, loadPromise);
    
    try {
      const result = await loadPromise;
      this.cacheAsset(cacheKey, result);
      return result;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  /**
   * Create image loading promise with fallback support
   * UPDATED COMMENTS: Robust loading with multiple format fallbacks
   */
  createImageLoadPromise(optimizedSrc, originalSrc, options) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      if (options.crossOrigin) {
        img.crossOrigin = options.crossOrigin;
      }
      
      img.onload = () => {
        resolve({
          element: img,
          src: optimizedSrc,
          width: img.naturalWidth,
          height: img.naturalHeight,
          format: this.getImageFormat(optimizedSrc)
        });
      };
      
      img.onerror = () => {
        // Try fallback to original format
        if (optimizedSrc !== originalSrc) {
          const fallbackImg = new Image();
          
          fallbackImg.onload = () => {
            resolve({
              element: fallbackImg,
              src: originalSrc,
              width: fallbackImg.naturalWidth,
              height: fallbackImg.naturalHeight,
              format: this.getImageFormat(originalSrc)
            });
          };
          
          fallbackImg.onerror = () => {
            reject(new Error(`Failed to load image: ${originalSrc}`));
          };
          
          fallbackImg.src = originalSrc;
        } else {
          reject(new Error(`Failed to load image: ${originalSrc}`));
        }
      };
      
      img.src = optimizedSrc;
    });
  }

  /**
   * Get optimized image source with modern format support
   * REUSED: Format optimization logic for all image loading
   */
  getOptimizedImageSrc(src) {
    const extension = this.getImageFormat(src);
    
    // Return original for SVG and other vector formats
    if (['svg', 'gif'].includes(extension)) {
      return src;
    }
    
    // Try AVIF first (best compression)
    if (this.supportsAvif && ['jpg', 'jpeg', 'png', 'webp'].includes(extension)) {
      return src.replace(/\.(jpg|jpeg|png|webp)$/i, '.avif');
    }
    
    // Fallback to WebP
    if (this.supportsWebP && ['jpg', 'jpeg', 'png'].includes(extension)) {
      return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    
    return src;
  }

  /**
   * Extract image format from URL
   * UPDATED COMMENTS: Robust format detection with query parameter handling
   */
  getImageFormat(src) {
    const url = new URL(src, window.location.origin);
    const pathname = url.pathname.toLowerCase();
    const match = pathname.match(/\.([a-z0-9]+)$/);
    return match ? match[1] : 'unknown';
  }

  /**
   * Cache loaded asset with size management
   * SCALED FOR: Memory-efficient caching with LRU eviction
   */
  cacheAsset(key, asset) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, asset);
  }

  /**
   * Preload assets for better performance
   * REUSED: Preloading pattern for critical resources
   */
  async preloadAssets(urls) {
    const promises = urls.map(url => this.loadImage(url));
    
    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.warn('Some assets failed to preload:', error);
    }
  }

  /**
   * Clear cache to free memory
   * UPDATED COMMENTS: Memory management utility
   */
  clearCache() {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  /**
   * Get cache statistics for debugging
   * SCALED FOR: Performance monitoring and optimization
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      loadingCount: this.loadingPromises.size,
      supportsWebP: this.supportsWebP,
      supportsAvif: this.supportsAvif
    };
  }
}
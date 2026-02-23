/* ANCHOR: performance_monitor */
/* REUSED: Universal performance tracking system */
/* SCALED FOR: Production monitoring with minimal overhead */

/**
 * PerformanceMonitor - Track and optimize application performance
 * Monitors FPS, memory usage, interaction latency, and render times
 * 
 * @class PerformanceMonitor
 */
export class PerformanceMonitor {
  constructor(options = {}) {
    this.isEnabled = options.enabled !== false;
    this.sampleRate = options.sampleRate || 1000; // Sample every 1000ms
    this.maxSamples = options.maxSamples || 100;
    
    this.metrics = {
      fps: 0,
      avgFps: 0,
      memoryUsage: 0,
      interactionLatency: [],
      renderTimes: [],
      frameDrops: 0
    };
    
    this.isMonitoring = false;
    this.isPaused = false;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.lastSampleTime = this.lastTime;
    
    // FPS calculation
    this.fpsHistory = [];
    this.frameDropThreshold = 16.67; // 60fps = 16.67ms per frame
    
    if (this.isEnabled) {
      this.start();
    }
  }

  /**
   * Start performance monitoring
   * UPDATED COMMENTS: Non-blocking monitoring with requestAnimationFrame
   */
  start() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.monitorFrame();
    
    // Setup memory monitoring if available
    if ('memory' in performance) {
      this.memoryInterval = setInterval(() => {
        this.sampleMemory();
      }, this.sampleRate);
    }
  }

  /**
   * Stop performance monitoring
   * REUSED: Cleanup pattern for resource management
   */
  stop() {
    this.isMonitoring = false;
    
    if (this.memoryInterval) {
      clearInterval(this.memoryInterval);
      this.memoryInterval = null;
    }
  }

  /**
   * Pause monitoring (useful when tab is hidden)
   * SCALED FOR: Battery optimization on mobile devices
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * Resume monitoring
   * UPDATED COMMENTS: Smooth resume without metric spikes
   */
  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.lastTime = performance.now();
      this.lastSampleTime = this.lastTime;
    }
  }

  /**
   * Monitor frame rate and render performance
   * REUSED: Core FPS calculation with frame drop detection
   */
  monitorFrame() {
    if (!this.isMonitoring) return;
    
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    if (!this.isPaused) {
      this.frameCount++;
      
      // Detect frame drops
      if (deltaTime > this.frameDropThreshold * 2) {
        this.metrics.frameDrops++;
      }
      
      // Calculate FPS every sample interval
      if (currentTime - this.lastSampleTime >= this.sampleRate) {
        const fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastSampleTime));
        this.metrics.fps = fps;
        
        // Update FPS history for average calculation
        this.fpsHistory.push(fps);
        if (this.fpsHistory.length > this.maxSamples) {
          this.fpsHistory.shift();
        }
        
        // Calculate average FPS
        this.metrics.avgFps = Math.round(
          this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length
        );
        
        // Reset counters
        this.frameCount = 0;
        this.lastSampleTime = currentTime;
        
        // UPDATED COMMENTS: Silent FPS tracking without console spam
      }
    }
    
    this.lastTime = currentTime;
    requestAnimationFrame(() => this.monitorFrame());
  }

  /**
   * Sample memory usage if available
   * UPDATED COMMENTS: Memory monitoring with heap size tracking
   */
  sampleMemory() {
    if ('memory' in performance && !this.isPaused) {
      const memory = performance.memory;
      this.metrics.memoryUsage = {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) // MB
      };
      
      // UPDATED COMMENTS: Silent memory tracking without console spam
      const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    }
  }

  /**
   * Track interaction latency for UX optimization
   * SCALED FOR: Real-time performance feedback
   */
  trackInteraction(type, startTime, endTime = performance.now()) {
    if (!this.isEnabled || this.isPaused) return;
    
    const latency = endTime - startTime;
    const interaction = {
      type,
      latency: Math.round(latency * 100) / 100, // Round to 2 decimal places
      timestamp: endTime
    };
    
    this.metrics.interactionLatency.push(interaction);
    
    // Keep only recent measurements
    if (this.metrics.interactionLatency.length > this.maxSamples) {
      this.metrics.interactionLatency.shift();
    }
    
    // UPDATED COMMENTS: Silent interaction tracking without console spam
    
    return interaction;
  }

  /**
   * Track render time for specific operations
   * REUSED: Performance profiling utility
   */
  trackRenderTime(operation, renderTime) {
    if (!this.isEnabled || this.isPaused) return;
    
    const record = {
      operation,
      time: Math.round(renderTime * 100) / 100,
      timestamp: performance.now()
    };
    
    this.metrics.renderTimes.push(record);
    
    // Keep only recent measurements
    if (this.metrics.renderTimes.length > this.maxSamples) {
      this.metrics.renderTimes.shift();
    }
    
    return record;
  }

  /**
   * Get current performance metrics
   * UPDATED COMMENTS: Comprehensive metrics for debugging
   */
  getMetrics() {
    return {
      ...this.metrics,
      isMonitoring: this.isMonitoring,
      isPaused: this.isPaused,
      timestamp: performance.now()
    };
  }

  /**
   * Get performance summary for reporting
   * SCALED FOR: Production performance analytics
   */
  getSummary() {
    const avgInteractionLatency = this.metrics.interactionLatency.length > 0
      ? this.metrics.interactionLatency.reduce((sum, i) => sum + i.latency, 0) / this.metrics.interactionLatency.length
      : 0;
    
    const avgRenderTime = this.metrics.renderTimes.length > 0
      ? this.metrics.renderTimes.reduce((sum, r) => sum + r.time, 0) / this.metrics.renderTimes.length
      : 0;
    
    return {
      fps: this.metrics.fps,
      avgFps: this.metrics.avgFps,
      frameDrops: this.metrics.frameDrops,
      memoryUsage: this.metrics.memoryUsage,
      avgInteractionLatency: Math.round(avgInteractionLatency * 100) / 100,
      avgRenderTime: Math.round(avgRenderTime * 100) / 100,
      sampleCount: {
        interactions: this.metrics.interactionLatency.length,
        renders: this.metrics.renderTimes.length,
        fps: this.fpsHistory.length
      }
    };
  }

  /**
   * Reset all metrics
   * REUSED: Testing and debugging utility
   */
  reset() {
    this.metrics = {
      fps: 0,
      avgFps: 0,
      memoryUsage: 0,
      interactionLatency: [],
      renderTimes: [],
      frameDrops: 0
    };
    
    this.fpsHistory = [];
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.lastSampleTime = this.lastTime;
  }
}
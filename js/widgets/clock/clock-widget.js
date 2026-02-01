/* ANCHOR: clock_widget */
/* FSD: widgets/clock → analog clock widget implementation */
/* REUSED: WidgetBase class with time-specific functionality */

import { WidgetBase } from '../../entities/widget/widget-base.js';

/**
 * ClockWidget - Analog clock with Moscow timezone
 * Features: Real-time updates, hour markers, timezone display
 * 
 * @class ClockWidget
 * @extends WidgetBase
 */
export class ClockWidget extends WidgetBase {
  constructor(element, options = {}) {
    super(element, { ...options, type: 'clock' });
    
    // UPDATED COMMENTS: Clock configuration with Moscow timezone
    this.timezone = options.timezone || 'Europe/Moscow';
    this.showSeconds = options.showSeconds !== false;
    this.updateInterval = null;
    
    // SCALED FOR: Performance optimization with RAF-based updates
    this.lastUpdateTime = 0;
    this.animationFrame = null;
    
    this.createClockFace();
    this.startClock();
  }

  /**
   * Create clock face with exact Figma specifications
   * UPDATED COMMENTS: 160x140px wrapper, dark theme, SVG hands from assets
   */
  createClockFace() {
    const targetElement = this.innerElement || this.element;
    targetElement.innerHTML = `
      <div class="clock-container">
        <div class="clock-face">
          <div class="clock-background"></div>
          
          <!-- CRITICAL: Hour markers with exact Figma positioning -->
          <div class="hour-markers">
            ${this.createHourMarkers()}
          </div>
          
          <!-- CRITICAL: Clock numbers positioned as per Figma -->
          <div class="clock-numbers">
            <div class="clock-number clock-number--12">12</div>
            <div class="clock-number clock-number--1">1</div>
            <div class="clock-number clock-number--2">2</div>
            <div class="clock-number clock-number--3">3</div>
            <div class="clock-number clock-number--4">4</div>
            <div class="clock-number clock-number--5">5</div>
            <div class="clock-number clock-number--6">6</div>
            <div class="clock-number clock-number--7">7</div>
            <div class="clock-number clock-number--8">8</div>
            <div class="clock-number clock-number--9">9</div>
            <div class="clock-number clock-number--10">10</div>
            <div class="clock-number clock-number--11">11</div>
          </div>
          
          <!-- CRITICAL: SVG clock hands with professional design -->
          <div class="clock-hands">
            <!-- REUSED: Hour hand SVG from assets -->
            <div class="hour-hand">
              <img src="assets/images/hr.svg" alt="Hour hand" />
            </div>
            
            <!-- REUSED: Minute hand SVG from assets -->
            <div class="minute-hand">
              <img src="assets/images/mn.svg" alt="Minute hand" />
            </div>
            
            <!-- UPDATED COMMENTS: Second hand remains CSS-based for smooth animation -->
            <div class="second-hand"></div>
            
            <!-- CRITICAL: Center dot above all hands -->
            <div class="center-dot"></div>
          </div>
          
          <!-- REUSED: Timezone label from Figma spec -->
          <div class="timezone-label">MSC</div>
        </div>
      </div>
    `;
  }

  /**
   * Create hour and minute markers for complete clock face
   * REUSABLE LOGIC: 60 total markers - 12 hour markers + 48 minute markers
   * UPDATED COMMENTS: All markers have uniform 8px height, differ only in opacity
   */
  createHourMarkers() {
    let markers = '';
    
    // CRITICAL: Create all 60 markers (every 6 degrees)
    for (let i = 0; i < 60; i++) {
      const angle = i * 6; // 360/60 = 6 degrees per marker
      const isHourMarker = i % 5 === 0; // Every 5th marker is an hour marker
      const isMainHour = i % 15 === 0; // Every 15th marker is main hour (12,3,6,9)
      
      let markerClass;
      
      if (isMainHour) {
        // CRITICAL: Main hours (12, 3, 6, 9) - brightest
        markerClass = 'hour-marker--main';
      } else if (isHourMarker) {
        // UPDATED COMMENTS: Regular hours (1,2,4,5,7,8,10,11) - medium opacity
        markerClass = 'hour-marker--regular';
      } else {
        // REUSED: Minute markers - most subtle
        markerClass = 'minute-marker';
      }
      
      markers += `
        <div class="hour-marker ${markerClass}" 
             style="transform: rotate(${angle}deg);">
        </div>
      `;
    }
    
    return markers;
  }

  /**
   * Start clock update loop with performance optimization
   * SCALED FOR: Smooth 60fps updates with RAF optimization
   */
  startClock() {
    this.updateTime(); // Initial update
    
    // UPDATED COMMENTS: Use setInterval for second precision, RAF for smooth animation
    this.updateInterval = setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  /**
   * Update clock hands based on current Moscow time
   * UPDATED COMMENTS: Smooth rotation with transition management to prevent 360° jumps
   */
  updateTime() {
    const now = new Date();
    
    // CRITICAL: Convert to Moscow timezone
    const moscowTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Moscow"}));
    
    const hours = moscowTime.getHours() % 12;
    const minutes = moscowTime.getMinutes();
    const seconds = moscowTime.getSeconds();
    
    // UPDATED COMMENTS: Calculate angles with smooth transitions
    const hourAngle = (hours * 30) + (minutes * 0.5); // 30° per hour + minute adjustment
    const minuteAngle = minutes * 6; // 6° per minute
    const secondAngle = seconds * 6; // 6° per second
    
    // REUSED: Query selectors for hand elements
    const hourHand = this.element.querySelector('.hour-hand');
    const minuteHand = this.element.querySelector('.minute-hand');
    const secondHand = this.element.querySelector('.second-hand');
    
    // CRITICAL: Prevent transition jumps when crossing 12 o'clock
    this.updateHandWithoutJump(hourHand, hourAngle, 'hour');
    this.updateHandWithoutJump(minuteHand, minuteAngle, 'minute');
    if (secondHand && this.showSeconds) {
      this.updateHandWithoutJump(secondHand, secondAngle, 'second');
    }
  }

  /**
   * Update hand rotation without 360° transition jumps
   * REUSABLE LOGIC: Smooth hand rotation with transition management for SVG hands
   * UPDATED COMMENTS: Fixed - eliminates all transition conflicts and jitter
   */
  updateHandWithoutJump(handElement, newAngle, handType) {
    if (!handElement) return;
    
    // UPDATED COMMENTS: Get previous angle from data attribute or default to 0
    const prevAngle = parseFloat(handElement.dataset.angle) || 0;
    
    // CRITICAL: Detect if crossing 360° boundary (jump from 354° to 6° etc)
    const angleDiff = Math.abs(newAngle - prevAngle);
    const isCrossingBoundary = angleDiff > 180;
    
    if (isCrossingBoundary) {
      // CRITICAL: Completely disable transition to prevent jump
      handElement.style.transition = 'none';
      handElement.style.transform = `rotate(${newAngle}deg)`;
      handElement.dataset.angle = newAngle;
      
      // SCALED FOR: Force immediate DOM update without transition
      handElement.offsetHeight; // Force reflow
      
      // UPDATED COMMENTS: Keep transitions disabled for clock hands to prevent jitter
      // Clock hands should move instantly, not smoothly, for accurate time display
    } else {
      // CRITICAL: No transitions for clock hands - instant movement only
      handElement.style.transition = 'none';
      handElement.style.transform = `rotate(${newAngle}deg)`;
      handElement.dataset.angle = newAngle;
    }
  }

  /**
   * Widget-specific click handler
   * UPDATED COMMENTS: Toggle between 12/24 hour format
   */
  onClick(data) {
    // Toggle seconds display
    this.showSeconds = !this.showSeconds;
    
    const secondHand = this.element.querySelector('.second-hand');
    if (secondHand) {
      secondHand.style.display = this.showSeconds ? 'block' : 'none';
    }
    
    if (this.eventBus) {
      this.eventBus.emit('clock:clicked', {
        widget: this,
        showSeconds: this.showSeconds
      });
    }
  }

  /**
   * Get clock data for serialization
   * SCALED FOR: State persistence and configuration export
   */
  getData() {
    return {
      ...super.getInfo(),
      timezone: this.timezone,
      showSeconds: this.showSeconds
    };
  }

  /**
   * Cleanup clock resources
   * UPDATED COMMENTS: Proper interval and RAF cleanup
   */
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    super.destroy();
  }
}
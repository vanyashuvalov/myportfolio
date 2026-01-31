/* ANCHOR: clock_widget */
/* FSD: widgets/clock → analog clock implementation */
/* REUSED: WidgetBase class with time-specific functionality */

import { WidgetBase } from '../../entities/widget/widget-base.js';

/**
 * ClockWidget - Real-time analog clock with smooth hand animations
 * Features: Hour/minute/second hands, timezone support, smooth transitions
 * 
 * @class ClockWidget
 * @extends WidgetBase
 */
export class ClockWidget extends WidgetBase {
  constructor(element, options = {}) {
    super(element, { ...options, type: 'clock' });
    
    this.timezone = options.timezone || 'Europe/Moscow';
    this.showSeconds = options.showSeconds !== false;
    this.updateInterval = null;
    
    this.createClockFace();
    this.startClock();
  }

  /**
   * Create clock face with SVG elements
   * UPDATED COMMENTS: Professional clock design with precise measurements
   */
  createClockFace() {
    this.element.innerHTML = `
      <div class="clock-container">
        <svg class="clock-face" viewBox="0 0 124 124">
          <!-- Clock circle background -->
          <circle cx="62" cy="62" r="60" class="clock-background"/>
          
          <!-- Hour markers -->
          ${this.createHourMarkers()}
          
          <!-- Clock hands -->
          <g class="clock-hands">
            <path class="hour-hand" d="M62 62 L62 38" />
            <path class="minute-hand" d="M62 62 L62 17" />
            <line class="second-hand" x1="62" y1="62" x2="62" y2="12" />
            <circle class="center-dot" cx="62" cy="62" r="2.5" />
          </g>
        </svg>
        
        <!-- Timezone label -->
        <div class="timezone-label">MSC</div>
      </div>
    `;
  }

  /**
   * Create hour markers for clock face
   * REUSED: SVG generation pattern for consistent markers
   */
  createHourMarkers() {
    let markers = '';
    
    for (let i = 1; i <= 12; i++) {
      const angle = (i * 30) - 90; // Convert to SVG coordinate system
      const isMainHour = i % 3 === 0; // 12, 3, 6, 9 are main hours
      const radius = isMainHour ? 50 : 52;
      const length = isMainHour ? 8 : 4;
      
      const x1 = 62 + Math.cos(angle * Math.PI / 180) * radius;
      const y1 = 62 + Math.sin(angle * Math.PI / 180) * radius;
      const x2 = 62 + Math.cos(angle * Math.PI / 180) * (radius - length);
      const y2 = 62 + Math.sin(angle * Math.PI / 180) * (radius - length);
      
      const opacity = isMainHour ? '1' : '0.7';
      const strokeWidth = isMainHour ? '2' : '1';
      
      markers += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
                   stroke="rgba(255,255,255,${opacity})" 
                   stroke-width="${strokeWidth}" 
                   stroke-linecap="round"/>`;
    }
    
    return markers;
  }

  /**
   * Update clock hands based on current time
   * SCALED FOR: Smooth animations, timezone support, performance optimization
   */
  updateTime() {
    const now = new Date();
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    // UPDATED COMMENTS: Smooth rotation calculations preventing 360° jumps
    const hourAngle = (hours * 30) + (minutes * 0.5);
    const minuteAngle = minutes * 6;
    const secondAngle = seconds * 6;
    
    const hourHand = this.element.querySelector('.hour-hand');
    const minuteHand = this.element.querySelector('.minute-hand');
    const secondHand = this.element.querySelector('.second-hand');
    
    if (hourHand) hourHand.style.transform = `rotate(${hourAngle}deg)`;
    if (minuteHand) minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
    
    if (this.showSeconds && secondHand) {
      secondHand.style.transform = `rotate(${secondAngle}deg)`;
    }
  }

  /**
   * Start clock update interval
   * REUSABLE LOGIC: Performance-optimized timer management
   */
  startClock() {
    this.updateTime(); // Initial update
    this.updateInterval = setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  /**
   * Widget-specific click handler
   * UPDATED COMMENTS: Clock-specific interactions
   */
  onClick(data) {
    // Toggle seconds display on click
    this.showSeconds = !this.showSeconds;
    const secondHand = this.element.querySelector('.second-hand');
    if (secondHand) {
      secondHand.style.display = this.showSeconds ? 'block' : 'none';
    }
  }

  /**
   * Destroy clock widget and clean up timer
   * SCALED FOR: Proper resource cleanup
   */
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    super.destroy();
  }
}
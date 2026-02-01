/* ANCHOR: resume_widget */
/* FSD: widgets/resume → professional resume widget implementation */
/* REUSED: WidgetBase class with resume-specific functionality */

import { WidgetBase } from '../../entities/widget/widget-base.js';

/**
 * ResumeWidget - Professional resume display widget
 * Features: Personal info, skills, experience, contact details
 * 
 * @class ResumeWidget
 * @extends WidgetBase
 */
export class ResumeWidget extends WidgetBase {
  constructor(element, options = {}) {
    super(element, { ...options, type: 'resume' });
    
    // UPDATED COMMENTS: Resume content configuration
    this.personalInfo = options.personalInfo || {
      name: 'Ivan Shuvalov',
      title: 'Product Designer',
      location: 'Remote',
      email: 'ivan@example.com',
      phone: '+1 (555) 123-4567'
    };
    
    this.skills = options.skills || [
      'UI/UX Design',
      'Prototyping',
      'User Research',
      'Design Systems',
      'Figma',
      'Healthcare UX'
    ];
    
    this.experience = options.experience || [
      {
        title: 'Senior Product Designer',
        company: 'Healthcare Solutions',
        period: '2022 - Present',
        description: 'Leading design for clinical dashboard serving 2,600+ care sites'
      },
      {
        title: 'Product Designer',
        company: 'MedTech Startup',
        period: '2020 - 2022',
        description: 'Designed maternity health workflows and surgery scheduling systems'
      }
    ];
    
    this.createResumeContent();
  }

  /**
   * Create resume content with full-size document icon design
   * UPDATED COMMENTS: 120x120 document icon with header and SVG icon
   */
  createResumeContent() {
    const targetElement = this.innerElement || this.element;
    targetElement.innerHTML = `
      <div class="resume-container">
        <div class="document-icon">
          <div class="document-page">
            <div class="document-header">
              <svg class="pdf-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="#B71635" stroke-width="1.5" fill="none"/>
                <path d="M14 2v6h6" stroke="#B71635" stroke-width="1.5" fill="none"/>
                <path d="M16 13H8" stroke="#B71635" stroke-width="1.5"/>
                <path d="M16 17H8" stroke="#B71635" stroke-width="1.5"/>
                <path d="M10 9H8" stroke="#B71635" stroke-width="1.5"/>
              </svg>
              <div class="pdf-text">pdf</div>
            </div>
            <div class="document-content">
              <div class="document-line document-line--long"></div>
              <div class="document-line document-line--medium"></div>
              <div class="document-line document-line--long"></div>
              <div class="document-line document-line--short"></div>
              <div class="document-line document-line--medium"></div>
              <div class="document-line document-line--long"></div>
            </div>
          </div>
        </div>
        <div class="document-label">Resume.pdf</div>
      </div>
    `;
  }

  /**
   * Escape HTML to prevent XSS
   * SCALED FOR: Security-first content handling
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Update resume content
   * UPDATED COMMENTS: Dynamic content updates with re-rendering
   */
  updateContent(personalInfo, skills, experience) {
    if (personalInfo) this.personalInfo = { ...this.personalInfo, ...personalInfo };
    if (skills) this.skills = skills;
    if (experience) this.experience = experience;
    
    this.createResumeContent();
    
    // Emit content update event
    if (this.eventBus) {
      this.eventBus.emit('resume:updated', {
        widget: this,
        personalInfo: this.personalInfo,
        skills: this.skills,
        experience: this.experience
      });
    }
  }

  /**
   * Widget-specific click handler
   * UPDATED COMMENTS: Click to expand/collapse sections
   */
  onClick(data) {
    // Toggle expanded state
    this.element.classList.toggle('resume--expanded');
    
    if (this.eventBus) {
      this.eventBus.emit('resume:clicked', {
        widget: this,
        expanded: this.element.classList.contains('resume--expanded')
      });
    }
  }

  /**
   * Widget-specific long press handler
   * REUSED: Context menu pattern for additional options
   */
  onLongPress(data) {
    // Show contact options or download resume
    if (this.eventBus) {
      this.eventBus.emit('resume:longpress', {
        widget: this,
        action: 'show-options'
      });
    }
  }

  /**
   * Get resume data for serialization
   * SCALED FOR: Data persistence and export functionality
   */
  getData() {
    return {
      ...super.getInfo(),
      personalInfo: this.personalInfo,
      skills: this.skills,
      experience: this.experience
    };
  }
}
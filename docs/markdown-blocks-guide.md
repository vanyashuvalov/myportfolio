# Markdown Blocks Guide

Complete guide to using enhanced markdown with Notion-like custom blocks in project files.

## Table of Contents

1. [Basic Markdown](#basic-markdown)
2. [Custom Blocks](#custom-blocks)
3. [Frontmatter](#frontmatter)
4. [Best Practices](#best-practices)

---

## Basic Markdown

Standard markdown syntax is fully supported:

### Headings

```markdown
# H1 Heading
## H2 Heading
### H3 Heading
```

### Text Formatting

```markdown
**Bold text**
*Italic text*
`Inline code`
[Link text](https://example.com)
```

### Lists

```markdown
- Unordered list item
- Another item

1. Ordered list item
2. Another item
```

### Images

```markdown
![Alt text](/path/to/image.jpg)
```

### Code Blocks

````markdown
```javascript
const example = 'code block';
```
````

### Tables

```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |
```

---

## Custom Blocks

Enhanced markdown with Notion-like custom blocks.

### Callout Blocks

Display important information with icons and colored backgrounds.

**Syntax:**
```markdown
::: callout type
Content here
:::
```

**Types:** `info`, `warning`, `success`, `error`, `tip`, `note`

**Examples:**

```markdown
::: callout info
💡 **Key Insight**: Users needed visual priority at a glance
:::

::: callout warning
⚠️ **Challenge**: Balancing creativity with usability required multiple iterations
:::

::: callout success
✅ **Result**: Projects displayed in an engaging folder metaphor
:::

::: callout error
❌ **Problem**: Traditional banking apps were failing to engage younger users
:::

::: callout tip
💡 **Performance First**: Chose vanilla JavaScript for 60fps animations
:::

::: callout note
📝 **Tools Used**: Figma for design, VS Code for development
:::
```

### Stats Blocks

Display key metrics in a grid layout.

**Syntax:**
```markdown
::: stats
- **Number** description
- **Another number** description
:::
```

**Example:**

```markdown
::: stats
- **70%** reduction in scheduling time
- **85%** decrease in conflicts
- **95%** user satisfaction score
- **2,600+** care sites deployed
:::
```

### Metrics Blocks

Display before/after comparisons with impact.

**Syntax:**
```markdown
::: metrics
- Label: Before → After (Impact)
- Label: Value
:::
```

**Example:**

```markdown
::: metrics
- Scheduling Time: 3 hours → 50 minutes (-70%)
- Conflicts: 25/week → 4/week (-85%)
- OR Utilization: 60% → 84% (+40%)
- User Satisfaction: 60% → 95% (+35%)
:::
```

### Quote Blocks

Enhanced blockquotes with optional author attribution.

**Syntax:**
```markdown
::: quote Author Name
Quote content here
:::
```

**Example:**

```markdown
::: quote Sarah Chen, Senior Designer
The best portfolios tell a story and show personality, not just display work samples.
:::
```

### Image Gallery

Display multiple images in a grid layout.

**Syntax:**
```markdown
::: gallery
![Caption 1](/path/to/image1.jpg)
![Caption 2](/path/to/image2.jpg)
![Caption 3](/path/to/image3.jpg)
:::
```

**Example:**

```markdown
::: gallery
![Desktop view](/assets/projects/portfolio/desktop.jpg)
![Mobile view](/assets/projects/portfolio/mobile.jpg)
![Widget interactions](/assets/projects/portfolio/widgets.jpg)
:::
```

### Video Embeds

Embed YouTube or Vimeo videos.

**Syntax:**
```markdown
::: video
https://www.youtube.com/watch?v=VIDEO_ID
:::
```

**Supported platforms:**
- YouTube: `https://www.youtube.com/watch?v=VIDEO_ID` or `https://youtu.be/VIDEO_ID`
- Vimeo: `https://vimeo.com/VIDEO_ID`

**Example:**

```markdown
::: video
https://www.youtube.com/watch?v=dQw4w9WgXcQ
:::
```

---

## Frontmatter

Extended frontmatter for rich project metadata.

### Complete Example

```yaml
---
# Basic Info
title: Project Title
slug: project-slug
category: work
status: published

# Metadata
year: 2024
duration: 6 months
client: Company Name
role: Lead Designer
team: [Designer, Engineer, PM]

# Content
description: Short project description for cards and previews
hero_image: /assets/projects/project-name/hero.jpg
thumbnail: /assets/projects/project-name/thumb.jpg

# SEO
meta_title: Project Title - Case Study
meta_description: How we achieved X result with Y approach
og_image: /assets/projects/project-name/og.jpg

# Tags & Categories
tags: [UX Design, Mobile, Healthcare]
skills: [User Research, Prototyping, Figma]
industry: Healthcare
project_type: B2B SaaS

# Links (optional)
live_url: https://example.com
figma_url: https://figma.com/file/...
github_url: https://github.com/...

# Display Options
featured: true
show_in_portfolio: true
order: 1
color_theme: "#C248A3"
---
```

### Field Descriptions

**Basic Info:**
- `title`: Project title (required)
- `slug`: URL-friendly identifier (required)
- `category`: `work` or `fun` (required)
- `status`: `published`, `draft`, or `archived`

**Metadata:**
- `year`: Project year (number)
- `duration`: Project duration (e.g., "6 months")
- `client`: Client or company name
- `role`: Your role in the project
- `team`: Array of team members/roles

**Content:**
- `description`: Short description (1-2 sentences)
- `hero_image`: Large header image path
- `thumbnail`: Card thumbnail image path

**SEO:**
- `meta_title`: Page title for SEO
- `meta_description`: Meta description for SEO
- `og_image`: Open Graph image for social sharing

**Tags & Categories:**
- `tags`: Array of project tags
- `skills`: Array of skills used
- `industry`: Industry category
- `project_type`: Type of project

**Links:**
- `live_url`: Live project URL
- `figma_url`: Figma file URL
- `github_url`: GitHub repository URL

**Display Options:**
- `featured`: Show in featured section (boolean)
- `show_in_portfolio`: Include in portfolio (boolean)
- `order`: Sort order (number, lower = first)
- `color_theme`: Accent color (hex code)

---

## Best Practices

### Content Structure

1. **Start with Overview**: Brief project introduction
2. **Define the Problem**: What challenge did you solve?
3. **Show Research**: User interviews, insights, data
4. **Present Solution**: Design decisions and features
5. **Demonstrate Results**: Metrics and impact
6. **Reflect on Learnings**: What worked, what didn't

### Using Custom Blocks

**Do:**
- Use callouts for key insights and important notes
- Use stats blocks for impressive numbers
- Use metrics blocks for before/after comparisons
- Use quotes for user feedback and testimonials
- Use galleries for multiple related images

**Don't:**
- Overuse callouts (1-3 per section max)
- Mix too many block types in one section
- Use custom blocks for every paragraph
- Forget to add meaningful content inside blocks

### Writing Tips

1. **Be Specific**: Use concrete numbers and examples
2. **Show Process**: Include research, iterations, decisions
3. **Demonstrate Impact**: Quantify results when possible
4. **Tell a Story**: Make it engaging and memorable
5. **Use Visuals**: Images, diagrams, screenshots

### Image Guidelines

- **Hero images**: 1920x1080px minimum
- **Thumbnails**: 800x450px minimum
- **Gallery images**: 1200x675px minimum
- **Format**: JPG for photos, PNG for UI screenshots
- **Optimization**: Compress images for web

### SEO Best Practices

- Write unique meta titles (50-60 characters)
- Write compelling meta descriptions (150-160 characters)
- Use descriptive alt text for all images
- Include relevant keywords naturally
- Create descriptive URLs (slugs)

---

## Example Project Structure

```markdown
---
title: Amazing Project
slug: amazing-project
category: work
year: 2024
tags: [UX Design, Mobile]
description: Brief project description
---

## Project Overview

Introduction paragraph...

::: callout info
💡 **Key Challenge**: Main challenge statement
:::

## The Problem

Problem description...

## Research & Discovery

### User Interviews

Interview findings...

::: quote User Name
User quote here
:::

### Key Insights

::: stats
- **50+** interviews conducted
- **80%** users reported issue
- **3x** increase in engagement
:::

## Design Solution

Solution description...

## Results & Impact

### Quantitative Metrics

::: metrics
- Metric 1: Before → After (Impact)
- Metric 2: Before → After (Impact)
:::

### Business Impact

::: stats
- **1M+** users reached
- **95%** satisfaction score
:::

## Image Gallery

::: gallery
![Screenshot 1](/path/1.jpg)
![Screenshot 2](/path/2.jpg)
:::

## Video Demo

::: video
https://www.youtube.com/watch?v=VIDEO_ID
:::

## Conclusion

Closing thoughts...
```

---

## Need Help?

- Check existing projects for examples
- Test your markdown in the preview
- Ask for feedback on structure
- Iterate based on user feedback

Happy writing! ✨

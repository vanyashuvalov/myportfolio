# Projects Directory Structure

This directory contains all portfolio projects organized by category.

## Directory Structure

```
projects/
├── work/           # Professional work projects
│   ├── project-name.md
│   └── another-project.md
└── fun/            # Personal/side projects
    └── personal-project.md
```

## File Naming Convention

- Use kebab-case for file names: `project-name.md`
- Match the `slug` field in frontmatter
- Keep names descriptive but concise

## Project File Structure

Each project is a single Markdown file with:

1. **Frontmatter** (YAML metadata at top)
2. **Content** (Markdown with custom blocks)

### Minimal Example

```markdown
---
title: Project Title
slug: project-slug
category: work
year: 2024
tags: [Tag1, Tag2]
description: Brief description
---

## Project Overview

Content here...
```

### Complete Example

See `docs/markdown-blocks-guide.md` for full documentation.

## Categories

### Work Projects (`work/`)

Professional projects including:
- Client work
- Full-time employment projects
- Freelance projects
- Contract work

### Fun Projects (`fun/`)

Personal projects including:
- Side projects
- Experiments
- Open source contributions
- Learning projects

## Adding a New Project

1. **Create file**: `backend/data/projects/work/my-project.md`
2. **Add frontmatter**: Include all required fields
3. **Write content**: Use markdown and custom blocks
4. **Add images**: Place in `/assets/projects/my-project/`
5. **Test**: View in portfolio to verify rendering

## Required Frontmatter Fields

Minimum required fields:

```yaml
---
title: Project Title        # Required
slug: project-slug          # Required
category: work              # Required (work or fun)
year: 2024                  # Required
tags: [Tag1, Tag2]          # Required
description: Brief desc     # Required
---
```

## Recommended Frontmatter Fields

For best presentation:

```yaml
---
# Basic (required)
title: Project Title
slug: project-slug
category: work
status: published

# Metadata (recommended)
year: 2024
duration: 6 months
client: Company Name
role: Your Role
team: [Role1, Role2]

# Content (recommended)
description: Brief description
hero_image: /assets/projects/slug/hero.jpg
thumbnail: /assets/projects/slug/thumb.jpg

# Tags (recommended)
tags: [UX Design, Mobile]
skills: [Research, Prototyping]
industry: Healthcare
project_type: B2B SaaS

# Display (optional)
featured: true
show_in_portfolio: true
order: 1
color_theme: "#C248A3"
---
```

## Image Assets

### Directory Structure

```
assets/
└── projects/
    └── project-slug/
        ├── hero.jpg        # Hero image (1920x1080)
        ├── thumb.jpg       # Thumbnail (800x450)
        ├── og.jpg          # Social sharing (1200x630)
        ├── screenshot-1.jpg
        ├── screenshot-2.jpg
        └── ...
```

### Image Guidelines

- **Hero images**: 1920x1080px minimum, 16:9 ratio
- **Thumbnails**: 800x450px minimum, 16:9 ratio
- **OG images**: 1200x630px, 1.91:1 ratio
- **Screenshots**: 1200px width minimum
- **Format**: JPG for photos, PNG for UI
- **Optimization**: Compress for web (<500KB)

## Custom Blocks

Enhanced markdown with Notion-like blocks:

### Available Blocks

- `callout` - Highlighted information boxes
- `stats` - Key metrics in grid
- `metrics` - Before/after comparisons
- `quote` - Enhanced quotes with author
- `gallery` - Image grid
- `video` - YouTube/Vimeo embeds

### Example Usage

```markdown
::: callout info
💡 **Key Insight**: Important information here
:::

::: stats
- **70%** reduction in time
- **95%** user satisfaction
:::

::: metrics
- Metric: Before → After (Impact)
:::

::: quote Author Name
Quote content here
:::

::: gallery
![Caption](/path/1.jpg)
![Caption](/path/2.jpg)
:::

::: video
https://www.youtube.com/watch?v=VIDEO_ID
:::
```

See `docs/markdown-blocks-guide.md` for complete documentation.

## Content Guidelines

### Structure

1. **Project Overview** - Brief introduction
2. **The Challenge** - Problem statement
3. **Research & Discovery** - User research, insights
4. **Design Solution** - Your approach and decisions
5. **Results & Impact** - Metrics and outcomes
6. **Lessons Learned** - Reflections
7. **Conclusion** - Wrap up

### Writing Tips

- **Be specific**: Use concrete examples and numbers
- **Show process**: Include research, iterations, decisions
- **Demonstrate impact**: Quantify results when possible
- **Tell a story**: Make it engaging and memorable
- **Use visuals**: Include images, diagrams, screenshots

### SEO Best Practices

- Write unique meta titles (50-60 characters)
- Write compelling meta descriptions (150-160 characters)
- Use descriptive alt text for images
- Include relevant keywords naturally
- Create descriptive URLs (slugs)

## Project Status

Use `status` field to control visibility:

- `published` - Live in portfolio
- `draft` - Hidden, work in progress
- `archived` - Hidden, old project

## Display Order

Control project order with `order` field:

```yaml
order: 1  # Lower numbers appear first
```

Projects without `order` field appear after ordered projects, sorted by year (newest first).

## Featured Projects

Mark important projects as featured:

```yaml
featured: true
```

Featured projects may appear in special sections or with visual emphasis.

## Color Themes

Assign accent colors to projects:

```yaml
color_theme: "#C248A3"  # Pink
color_theme: "#3B82F6"  # Blue
color_theme: "#22C55E"  # Green
```

Used for tags, accents, and visual elements.

## Testing Projects

1. **Start servers**: Run `python start.py`
2. **Open portfolio**: Navigate to projects section
3. **Click project**: Verify rendering and layout
4. **Check responsive**: Test on mobile viewport
5. **Validate links**: Ensure all links work
6. **Review images**: Check image loading and quality

## Common Issues

### Project Not Showing

- Check `status: published` in frontmatter
- Verify `show_in_portfolio: true`
- Ensure file is in correct category folder
- Check file extension is `.md`

### Images Not Loading

- Verify image paths start with `/`
- Check image files exist in `/assets/`
- Ensure correct file extensions
- Check for typos in paths

### Formatting Issues

- Validate YAML frontmatter syntax
- Check custom block syntax (`::: blockType`)
- Ensure proper markdown formatting
- Test in markdown preview

## Examples

See existing projects for reference:

- `work/clinical-dashboard.md` - Healthcare B2B
- `work/fintech-mobile-app.md` - Mobile app
- `work/ux-portfolio-redesign.md` - Personal project

## Need Help?

- Read `docs/markdown-blocks-guide.md`
- Check existing project files
- Test in preview before publishing
- Ask for feedback on structure

---

**Last Updated**: 2024
**Maintained By**: Portfolio Team

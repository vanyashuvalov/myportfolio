# Documents Directory

This directory contains downloadable documents like resumes and portfolios.

## Resume PDF Generation

### Option 1: Browser Print to PDF (Recommended)

1. Open `resume-template.html` in Chrome/Edge
2. Press `Ctrl+P` (Windows) or `Cmd+P` (Mac)
3. Select "Save as PDF" as destination
4. Settings:
   - Paper size: A4 or Letter
   - Margins: Default
   - Scale: 100%
   - Background graphics: Enabled
5. Save as `Ivan_Shuvalov_Resume.pdf`

### Option 2: Online Converter

1. Upload `resume-template.html` to:
   - https://www.html2pdf.com/
   - https://pdfcrowd.com/
   - https://cloudconvert.com/html-to-pdf
2. Download generated PDF
3. Rename to `Ivan_Shuvalov_Resume.pdf`

### Option 3: Command Line (wkhtmltopdf)

```bash
# Install wkhtmltopdf
# Windows: Download from https://wkhtmltopdf.org/downloads.html
# Mac: brew install wkhtmltopdf
# Linux: sudo apt-get install wkhtmltopdf

# Generate PDF
wkhtmltopdf resume-template.html Ivan_Shuvalov_Resume.pdf
```

### Option 4: Node.js (puppeteer)

```bash
npm install puppeteer

# Create convert.js:
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const html = fs.readFileSync('resume-template.html', 'utf8');
  await page.setContent(html);
  await page.pdf({
    path: 'Ivan_Shuvalov_Resume.pdf',
    format: 'A4',
    printBackground: true
  });
  await browser.close();
})();

# Run:
node convert.js
```

## Current Files

- `resume-template.html` - HTML source for resume (edit this)
- `Ivan_Shuvalov_Resume.pdf` - Generated PDF (create from template)

## Updating Resume

1. Edit `resume-template.html` with your information
2. Generate new PDF using one of the methods above
3. Replace `Ivan_Shuvalov_Resume.pdf`
4. Test by clicking Resume widget on portfolio

## File Naming Convention

- Use descriptive names: `FirstName_LastName_Resume.pdf`
- Keep file size under 2MB for fast loading
- Use PDF/A format for best compatibility

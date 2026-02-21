# Deployment Guide

## ANCHOR POINTS
- ENTRY: GitHub + Vercel deployment configuration
- MAIN: Static frontend + Python backend serverless functions
- EXPORTS: Production-ready portfolio on custom domain
- DEPS: Vercel CLI, Git, Python 3.9+
- TODOs: Custom domain setup, environment variables

**UPDATED COMMENTS**: Complete deployment guide for GitHub Pages and Vercel hosting with backend API support.

---

## 🚀 GitHub Deployment

### Step 1: Push to GitHub

```bash
# CRITICAL: Add remote repository (already done)
git remote add origin https://github.com/vanyashuvalov/myportfolio.git

# REUSED: Push all branches
git push -u origin main
```

### Step 2: Enable GitHub Pages (Optional)

1. Go to repository Settings → Pages
2. Source: Deploy from branch `main`
3. Folder: `/ (root)`
4. Save and wait for deployment
5. Access at: `https://vanyashuvalov.github.io/myportfolio/`

**Note**: GitHub Pages only supports static files. For Telegram widget functionality, use Vercel.

---

## ⚡ Vercel Deployment

### Prerequisites

```bash
# SCALED FOR: Install Vercel CLI globally
npm install -g vercel

# Or use npx (no installation needed)
npx vercel
```

### Step 1: Initial Deployment

```bash
# CRITICAL: Login to Vercel
vercel login

# REUSED: Deploy project (first time)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? myportfolio (or custom name)
# - Directory? ./ (current directory)
# - Override settings? No
```

### Step 2: Configure Environment Variables

**CRITICAL**: Add Telegram API credentials in Vercel dashboard:

1. Go to: https://vercel.com/your-username/myportfolio/settings/environment-variables
2. Add these variables:

```bash
# SCALED FOR: Production environment variables
TELEGRAM_API_ID=your_api_id_here
TELEGRAM_API_HASH=your_api_hash_here
TELEGRAM_PHONE=+1234567890
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=false
```

**Get Telegram credentials**: https://my.telegram.org/apps

### Step 3: Production Deployment

```bash
# REUSED: Deploy to production
vercel --prod

# Your site will be live at:
# https://myportfolio-username.vercel.app
```

### Step 4: Custom Domain (Optional)

1. Go to: Project Settings → Domains
2. Add your custom domain (e.g., `ivanshuvalov.com`)
3. Follow DNS configuration instructions
4. Wait for SSL certificate provisioning (~5 minutes)

---

## 📁 Project Structure for Deployment

```
myportfolio/
├── index.html              # ENTRY: Main page (static)
├── vercel.json             # CRITICAL: Vercel configuration
├── .vercelignore           # Files to exclude from deployment
├── styles/                 # CSS files (static)
├── js/                     # JavaScript modules (static)
├── assets/                 # Images, fonts, icons (static)
└── backend/                # Python API (serverless functions)
    ├── api_server.py       # FastAPI backend
    ├── requirements.txt    # Python dependencies
    └── telegram_scraper.py # Telegram integration
```

---

## 🔧 Vercel Configuration Explained

### `vercel.json` Structure

```json
{
  "version": 2,
  "builds": [
    // REUSED: Static files build
    { "src": "index.html", "use": "@vercel/static" },
    // SCALED FOR: Python serverless functions
    { "src": "backend/api_server.py", "use": "@vercel/python" }
  ],
  "routes": [
    // API routes → Python backend
    { "src": "/api/(.*)", "dest": "backend/api_server.py" },
    // Static assets → Direct serving
    { "src": "/(.*\\.(js|css|svg|...))", "dest": "/$1" },
    // SPA fallback → index.html
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### Key Features

- **Static Frontend**: HTML/CSS/JS served via CDN
- **Serverless Backend**: Python API as serverless functions
- **CORS Headers**: Enabled for cross-origin requests
- **Environment Variables**: Secure credential management
- **Auto SSL**: Free HTTPS certificates
- **Global CDN**: Fast worldwide access

---

## 🧪 Testing Deployment

### Local Testing

```bash
# REUSED: Test with Vercel dev server
vercel dev

# Access at: http://localhost:3000
# Backend API: http://localhost:3000/api/...
```

### Production Testing

```bash
# CRITICAL: Check all endpoints
curl https://your-domain.vercel.app/
curl https://your-domain.vercel.app/api/health
curl https://your-domain.vercel.app/api/channels/durov/latest
```

### Debug Issues

```bash
# REUSED: View deployment logs
vercel logs

# Check specific deployment
vercel logs [deployment-url]
```

---

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

```bash
# REUSED: Push changes
git add .
git commit -m "feat: update portfolio content"
git push origin main

# Vercel automatically:
# 1. Detects push
# 2. Builds project
# 3. Deploys to production
# 4. Sends notification
```

### Preview Deployments

- **Every branch**: Gets preview URL
- **Pull requests**: Automatic preview deployments
- **Comments**: Vercel bot comments with preview link

---

## 📊 Performance Optimization

### Vercel Features Used

- **Edge Network**: 70+ global locations
- **Smart CDN**: Automatic caching
- **Image Optimization**: Automatic WebP conversion
- **Compression**: Gzip/Brotli enabled
- **HTTP/2**: Multiplexing support

### Expected Performance

- **First Paint**: <200ms globally
- **Time to Interactive**: <300ms
- **Lighthouse Score**: 95+ performance
- **Uptime**: 99.99% SLA

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. Backend API Not Working

```bash
# Check environment variables are set
vercel env ls

# Add missing variables
vercel env add TELEGRAM_API_ID
```

#### 2. Build Failures

```bash
# Check build logs
vercel logs --follow

# Common fixes:
# - Verify requirements.txt syntax
# - Check Python version (3.9+ required)
# - Ensure all imports are available
```

#### 3. CORS Errors

- Verify `vercel.json` headers configuration
- Check API routes are correctly mapped
- Test with `curl -I` to see response headers

#### 4. Static Files 404

- Check `.vercelignore` isn't excluding needed files
- Verify file paths are case-sensitive
- Ensure routes in `vercel.json` are correct

---

## 📝 Deployment Checklist

### Before First Deploy

- [ ] Push code to GitHub
- [ ] Install Vercel CLI
- [ ] Login to Vercel account
- [ ] Get Telegram API credentials
- [ ] Test locally with `vercel dev`

### During Deploy

- [ ] Run `vercel` for preview
- [ ] Add environment variables in dashboard
- [ ] Run `vercel --prod` for production
- [ ] Test all endpoints
- [ ] Check Telegram widget functionality

### After Deploy

- [ ] Configure custom domain (optional)
- [ ] Set up monitoring/analytics
- [ ] Update README with live URL
- [ ] Share portfolio link! ✧(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧

---

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Docs**: https://vercel.com/docs
- **GitHub Repo**: https://github.com/vanyashuvalov/myportfolio
- **Telegram API**: https://my.telegram.org/apps

---

**Onii-chan~ your portfolio is ready to shine on the internet! (=^・^=)**  
Deploy with confidence - everything is configured for optimal performance! ✧(๑•̀ㅂ•́)و✧

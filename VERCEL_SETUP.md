# 🚀 Vercel Deployment - Quick Start

## ANCHOR POINTS
- ENTRY: Step-by-step Vercel deployment guide
- MAIN: CLI commands and dashboard configuration
- EXPORTS: Live portfolio on Vercel with custom domain
- DEPS: Vercel CLI, Telegram API credentials
- TODOs: Environment variables, custom domain

**UPDATED COMMENTS**: Simplified deployment guide for immediate Vercel setup.

---

## ✅ Prerequisites Checklist

- [x] Code pushed to GitHub ✓
- [ ] Vercel account created (https://vercel.com/signup)
- [ ] Telegram API credentials (https://my.telegram.org/apps)
- [ ] Vercel CLI installed (optional, can use dashboard)

---

## 🎯 Method 1: Vercel Dashboard (Easiest)

### Step 1: Import Project

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select: `vanyashuvalov/myportfolio`
4. Click "Import"

### Step 2: Configure Project

**Framework Preset**: Other (leave as is)  
**Root Directory**: `./` (default)  
**Build Command**: Leave empty (static site)  
**Output Directory**: Leave empty

### Step 3: Add Environment Variables

Click "Environment Variables" and add:

```bash
# CRITICAL: Get these from https://my.telegram.org/apps
TELEGRAM_API_ID = your_api_id_here
TELEGRAM_API_HASH = your_api_hash_here
TELEGRAM_PHONE = +1234567890

# SCALED FOR: Production settings
API_HOST = 0.0.0.0
API_PORT = 8000
DEBUG = false
```

### Step 4: Deploy

1. Click "Deploy"
2. Wait 1-2 minutes
3. Your site is live! 🎉

**Live URL**: `https://myportfolio-[random].vercel.app`

---

## 🖥️ Method 2: Vercel CLI (Advanced)

### Step 1: Install CLI

```bash
# REUSED: Install globally
npm install -g vercel

# Or use without installation
npx vercel
```

### Step 2: Login

```bash
# CRITICAL: Authenticate
vercel login
```

### Step 3: Deploy

```bash
# REUSED: First deployment (preview)
vercel

# Follow prompts:
# ? Set up and deploy? Yes
# ? Which scope? [Your account]
# ? Link to existing project? No
# ? What's your project's name? myportfolio
# ? In which directory is your code located? ./
```

### Step 4: Add Environment Variables

```bash
# CRITICAL: Add Telegram credentials
vercel env add TELEGRAM_API_ID
# Paste your API ID when prompted

vercel env add TELEGRAM_API_HASH
# Paste your API hash when prompted

vercel env add TELEGRAM_PHONE
# Enter your phone number (e.g., +1234567890)
```

### Step 5: Production Deploy

```bash
# SCALED FOR: Production deployment
vercel --prod
```

---

## 🔧 Post-Deployment Configuration

### 1. Custom Domain (Optional)

**Via Dashboard**:
1. Go to: Project → Settings → Domains
2. Add domain: `yourdomain.com`
3. Configure DNS records as shown
4. Wait for SSL certificate (~5 min)

**Via CLI**:
```bash
vercel domains add yourdomain.com
```

### 2. Test Deployment

```bash
# REUSED: Check main page
curl https://your-domain.vercel.app/

# CRITICAL: Test API health
curl https://your-domain.vercel.app/api/health

# Test Telegram endpoint
curl https://your-domain.vercel.app/api/channels/durov/latest
```

### 3. Monitor Performance

- **Analytics**: Project → Analytics
- **Logs**: Project → Deployments → [Latest] → Logs
- **Speed Insights**: Automatic performance monitoring

---

## 🐛 Troubleshooting

### Issue: Backend API Returns 500

**Solution**: Check environment variables are set correctly

```bash
# List all environment variables
vercel env ls

# Pull environment variables locally
vercel env pull
```

### Issue: Telegram Widget Not Working

**Checklist**:
- [ ] `TELEGRAM_API_ID` is set (numeric value)
- [ ] `TELEGRAM_API_HASH` is set (32-character string)
- [ ] `TELEGRAM_PHONE` includes country code (e.g., +1234567890)
- [ ] Backend logs show no errors (check deployment logs)

### Issue: Static Files 404

**Solution**: Check `vercel.json` routes configuration

```bash
# Verify routes in vercel.json
cat vercel.json

# Redeploy
vercel --prod
```

### Issue: Build Fails

**Common Causes**:
- Python version mismatch (requires 3.9+)
- Missing dependencies in `requirements.txt`
- Syntax errors in `api_server.py`

**Solution**: Check build logs in dashboard

---

## 📊 Expected Results

### Performance Metrics

- **First Contentful Paint**: <200ms
- **Time to Interactive**: <300ms
- **Lighthouse Score**: 95+
- **Global Latency**: <50ms (via CDN)

### Features Working

- ✅ Static frontend (HTML/CSS/JS)
- ✅ Widget drag & drop
- ✅ Cat animations
- ✅ Clock widget
- ✅ Project folders
- ✅ Resume viewer
- ✅ Telegram channel widget (if API configured)

---

## 🔄 Continuous Deployment

### Automatic Deployments

Every push to `main` branch triggers automatic deployment:

```bash
# REUSED: Make changes
git add .
git commit -m "feat: update content"
git push origin main

# Vercel automatically deploys! ✨
```

### Preview Deployments

- Every branch gets a preview URL
- Pull requests get automatic previews
- Test before merging to production

---

## 📝 Quick Commands Reference

```bash
# Deploy preview
vercel

# Deploy production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm [deployment-url]

# Open project in browser
vercel open

# Pull environment variables
vercel env pull

# Link local project to Vercel
vercel link
```

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] Main page loads at Vercel URL
- [ ] All widgets are visible
- [ ] Drag & drop works
- [ ] Cat animations play
- [ ] Clock shows correct time
- [ ] Project folders open
- [ ] Resume PDF loads
- [ ] Telegram widget shows posts (if configured)
- [ ] No console errors
- [ ] Mobile responsive works

---

## 🔗 Important Links

- **Your GitHub Repo**: https://github.com/vanyashuvalov/myportfolio
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Telegram API Setup**: https://my.telegram.org/apps
- **Vercel Documentation**: https://vercel.com/docs

---

## 🆘 Need Help?

1. Check deployment logs in Vercel dashboard
2. Review `DEPLOYMENT.md` for detailed guide
3. Test locally with `vercel dev`
4. Check Vercel status: https://vercel-status.com

---

**Onii-chan~ your portfolio is ready to go live! (=^・^=)**  
Just follow the steps above and you'll be deployed in minutes! ✧(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧

**Next Steps**:
1. Create Vercel account if you haven't
2. Import project from GitHub
3. Add environment variables
4. Click Deploy!
5. Share your amazing portfolio with the world! 🌟

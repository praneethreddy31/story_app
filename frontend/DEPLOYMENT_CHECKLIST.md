# Vercel Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Code Preparation
- [x] Code is pushed to GitHub
- [x] `vercel.json` is configured correctly
- [x] Production environment file exists (`environment.prod.ts`)
- [x] Angular configuration is set up for production

### 2. Environment Configuration
- [ ] Update `environment.prod.ts` with actual backend URLs
- [ ] Backend services are deployed and accessible
- [ ] CORS is configured on backend for Vercel domain

### 3. Dependencies
- [x] All dependencies are in `package.json`
- [x] No local-only dependencies
- [x] Build script works locally (`npm run build`)

## 🚀 Deployment Steps

### Option A: Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your repository
5. Set root directory to `angular-frontend`
6. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist/angular-frontend`
7. Deploy!

### Option B: Vercel CLI
```bash
cd angular-frontend
vercel --prod
```

## 🔧 Post-Deployment

### 1. Test Your Application
- [ ] Frontend loads correctly
- [ ] API calls work
- [ ] Authentication works
- [ ] All features function properly

### 2. Environment Variables
- [ ] Set `NODE_ENV=production` in Vercel dashboard
- [ ] Add any other required environment variables

### 3. Domain & SSL
- [ ] Custom domain (optional)
- [ ] SSL certificate is active
- [ ] Redirects are working

## 🐛 Common Issues & Solutions

### Build Fails
- Check `package.json` for missing dependencies
- Verify `angular.json` configuration
- Check Vercel build logs

### Runtime Errors
- Verify backend URLs in `environment.prod.ts`
- Check CORS configuration on backend
- Review browser console for errors

### 404 Errors
- Ensure `vercel.json` routing is correct
- Check Angular routing configuration

## 📞 Support
- Vercel Docs: https://vercel.com/docs
- Angular Deployment: https://angular.io/guide/deployment
- Check deployment logs in Vercel dashboard

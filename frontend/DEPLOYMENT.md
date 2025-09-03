# Story Engine - Deployment Guide

## Quick Deploy to Vercel (Free)

### Prerequisites
- Your code is already on GitHub ✅
- Node.js and npm installed
- Vercel CLI (optional, but recommended)

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign up/Login with your GitHub account

2. **Import Your Repository**
   - Click "New Project"
   - Select "Import Git Repository"
   - Choose your GitHub repository
   - Select the `angular-frontend` folder as the root directory

3. **Configure Build Settings**
   - Framework Preset: `Angular`
   - Build Command: `npm run build`
   - Output Directory: `dist/angular-frontend`
   - Install Command: `npm install`

4. **Environment Variables (Important!)**
   Add these in the Vercel dashboard under Settings > Environment Variables:
   ```
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Get your live URL: `https://your-app-name.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Navigate to Angular Frontend**
   ```bash
   cd angular-frontend
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Important: Update Production URLs

Before deploying, update the production environment file:
`src/environments/environment.prod.ts`

Replace the placeholder URLs with your actual backend URLs:
```typescript
export const environment = {
  production: true,
  backendUrl: 'https://your-actual-backend-url.vercel.app',
  aiServiceUrl: 'https://your-actual-ai-service-url.vercel.app',
  apiVersion: 'v1'
};
```

### Backend Deployment

Your backend also needs to be deployed. You have two options:

1. **Deploy Backend to Vercel** (if it's a Node.js/TypeScript backend)
2. **Deploy Backend to Railway/Render/Heroku** (for other backends)

### Troubleshooting

**Build Errors:**
- Make sure all dependencies are in `package.json`
- Check that `angular.json` is properly configured
- Verify `vercel.json` has correct settings

**Runtime Errors:**
- Check that production environment URLs are correct
- Ensure backend services are deployed and accessible
- Check browser console for CORS errors

**Common Issues:**
- If you get 404 errors, the routing configuration in `vercel.json` should handle Angular routing
- If API calls fail, verify the backend URLs in `environment.prod.ts`

### Next Steps After Deployment

1. Test your application thoroughly
2. Set up custom domain (optional)
3. Configure environment variables for different environments
4. Set up monitoring and analytics

### Support
- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Angular Deployment Guide: [angular.io/guide/deployment](https://angular.io/guide/deployment)
- For issues: Check Vercel deployment logs in the dashboard

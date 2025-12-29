# SustainAride Deployment Guide

## Deploying to Vercel

### Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)
- MongoDB Atlas cluster (already set up)

### Step 1: Push to GitHub

1. **Initialize and commit your code:**
```bash
git add .
git commit -m "Initial commit - ready for Vercel deployment"
```

2. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Create a new repository (e.g., `sustainaride`)
   - Don't initialize with README (you already have one)

3. **Push your code:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/sustainaride.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel

1. **Import your project:**
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your GitHub repository

2. **Configure the project:**
   - Framework Preset: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Add Environment Variables:**
   Go to Project Settings → Environment Variables and add:
   
   ```
   ATLAS_URI=mongodb+srv://dhruvagrawal013:Dhruv9425@sustainaride.ycoitdy.mongodb.net/sustainaride?retryWrites=true&w=majority&appName=SustainAride
   JWT_SECRET=your_secure_secret_key_here
   NODE_ENV=production
   ```

   ⚠️ **IMPORTANT:** Change the JWT_SECRET to a secure random string!

4. **Deploy:**
   - Click "Deploy"
   - Wait for the build to complete

### Step 3: Configure MongoDB Atlas

1. **Whitelist Vercel IPs:**
   - Go to MongoDB Atlas → Network Access
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add Vercel's specific IP ranges

### Step 4: Test Your Deployment

Once deployed, your app will be available at:
- Frontend: `https://your-project.vercel.app`
- API: `https://your-project.vercel.app/api`

Test the API endpoint:
```bash
curl https://your-project.vercel.app/api
```

### Automatic Deployments

Vercel will automatically deploy when you push to GitHub:
- Push to `main` branch → Production deployment
- Push to other branches → Preview deployment

### Troubleshooting

**Build fails:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`

**API not working:**
- Verify environment variables in Vercel dashboard
- Check MongoDB Atlas IP whitelist
- Review function logs in Vercel

**Database connection issues:**
- Ensure ATLAS_URI is correct
- Check MongoDB Atlas is not paused
- Verify network access settings

### Local Development

To run locally:
```bash
npm install
npm run dev:all
```

This runs both frontend (Vite) and backend (Express) servers.

### Important Notes

1. **Never commit `.env` or `config.env` files** - they're in `.gitignore`
2. **Update MongoDB password** if needed in environment variables
3. **Use strong JWT_SECRET** in production
4. **Monitor usage** in MongoDB Atlas and Vercel dashboards

### Support

For issues, check:
- Vercel deployment logs
- MongoDB Atlas monitoring
- Browser console for frontend errors

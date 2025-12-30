# SustainAride Deployment Guide

## 🚀 Deploying to Vercel with Automatic Backend Connection

### Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)
- MongoDB Atlas cluster (already set up)

### 🔒 Security Features Included
Your backend is now secured with:
- **SSL/TLS Encryption** for MongoDB connections
- **Rate Limiting** to prevent DDoS attacks
- **CORS Protection** with whitelist validation
- **NoSQL Injection Prevention**
- **Helmet.js** for HTTP header security
- **Automatic Health Checks** to keep serverless functions warm

---

## Step 1: Push to GitHub

1. **Stage and commit your code:**
```bash
git add .
git commit -m "Add secure backend with automatic MongoDB connection"
```

2. **Push to GitHub:**
```bash
git push origin main
```

---

## Step 2: Deploy on Vercel

1. **Import your project:**
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your repository

2. **Configure the project:**
   - Framework Preset: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **⚠️ IMPORTANT: Add Environment Variables**
   
   Go to Project Settings → Environment Variables and add these **4 variables**:

   | Variable | Value |
   |----------|-------|
   | `ATLAS_URI` | `mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/dbname?retryWrites=true&w=majority` |
   | `JWT_SECRET` | `your-secret-jwt-key-min-32-characters` (Generate a strong random key!) |
   | `FRONTEND_URL` | `https://your-app.vercel.app` (Use your actual Vercel URL) |
   | `NODE_ENV` | `production` |

   **🔐 Security Note:** 
   - Use a strong, random JWT_SECRET (minimum 32 characters)
   - Generate one here: https://randomkeygen.com/
   - Never share these variables publicly
   - Replace USERNAME, PASSWORD, cluster, and dbname with your actual MongoDB credentials

4. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes for the build to complete
   - Your app will be live at: `https://your-app.vercel.app`

---

## Step 3: Configure MongoDB Atlas Security

### A. Network Access Configuration
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. **Option 1 (Recommended for Testing):**
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   
4. **Option 2 (Production - More Secure):**
   - Add Vercel's IP ranges (contact Vercel support for current IPs)

### B. Database User Permissions
1. Go to Database Access
2. Ensure your user has **Read and Write** permissions
3. Consider creating a separate user for production

### C. Enable Monitoring
1. Go to Metrics → Enable Real-time Performance Panel
2. Set up alerts for unusual activity
3. Monitor connection patterns

---

## Step 4: Test Your Deployment

### Frontend Test:
Visit your Vercel URL: `https://your-app.vercel.app`

### Backend Health Check:
```bash
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-12-29T...",
  "environment": "production"
}
```

### API Test:
```bash
curl https://your-app.vercel.app/api
```

Expected response:
```json
{
  "message": "Welcome to SustainAride API",
  "version": "1.0.0",
  "status": "operational"
}
```

---

## 🔄 Automatic Features

### 1. **Auto-Connect to MongoDB**
   - Backend automatically connects to MongoDB on every request
   - Uses connection pooling for optimal performance
   - Retries up to 3 times on connection failure

### 2. **Auto-Reconnect**
   - If MongoDB disconnects, automatic reconnection with exponential backoff
   - Maintains connection health with monitoring

### 3. **Cold Start Prevention**
   - Frontend pings backend every 5 minutes (production only)
   - Keeps serverless functions warm
   - Reduces response time for users

### 4. **Environment Detection**
   - Frontend automatically uses correct API URL:
     - **Development**: `http://localhost:5000`
     - **Production**: Same domain as frontend (Vercel URL)

---

## 📊 Monitoring & Maintenance

### Check Deployment Logs:
1. Go to Vercel Dashboard → Your Project
2. Click "Functions" tab
3. View real-time logs for API requests

### Monitor MongoDB:
1. MongoDB Atlas Dashboard → Metrics
2. Check:
   - Connection count
   - Operation execution time
   - Network traffic

### Check Security:
1. Review rate limit violations in Vercel logs
2. Monitor failed authentication attempts
3. Check for unusual traffic patterns

---

## 🔒 Security Best Practices

### Before Going Live:
- [ ] Changed JWT_SECRET from default value
- [ ] Updated FRONTEND_URL to actual Vercel URL
- [ ] Enabled MongoDB Atlas IP whitelist
- [ ] Verified all environment variables are set
- [ ] Reviewed SECURITY.md file
- [ ] Tested all API endpoints
- [ ] Enabled 2FA on GitHub, Vercel, and MongoDB Atlas

### Regular Maintenance:
- [ ] Update dependencies monthly: `npm update`
- [ ] Check for vulnerabilities: `npm audit`
- [ ] Rotate JWT_SECRET every 90 days
- [ ] Review MongoDB Atlas logs weekly
- [ ] Monitor Vercel function usage and costs

---

## Automatic Deployments

Vercel automatically deploys when you push to GitHub:
- **Main branch** → Production deployment
- **Other branches** → Preview deployment

To deploy updates:
```bash
git add .
git commit -m "Your update message"
git push origin main
```

Wait 2-3 minutes, and your changes are live!

---

## 🐛 Troubleshooting

### Issue: "Database connection failed"
**Solution:**
1. Check ATLAS_URI in Vercel environment variables
2. Verify MongoDB Atlas is not paused
3. Check Network Access allows 0.0.0.0/0
4. Review Vercel function logs for error details

### Issue: "CORS error" in browser console
**Solution:**
1. Verify FRONTEND_URL matches your Vercel domain
2. Check Vercel deployment URL (with/without www)
3. Review browser console for exact error

### Issue: "Too many requests" (429 error)
**Solution:**
- This is rate limiting protection
- Wait 15 minutes and try again
- If legitimate traffic, adjust limits in `api/index.js`

### Issue: Slow API responses
**Solution:**
- First request may be slow (cold start)
- Health checks should keep functions warm
- Check MongoDB Atlas performance metrics

### Issue: Build fails on Vercel
**Solution:**
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify TypeScript compiles: `npm run build` locally
4. Check for missing environment variables

---

## 📱 Local Development

To run the full stack locally:

```bash
# Install dependencies
npm install

# Run both frontend and backend
npm run dev:all
```

This starts:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## 🆘 Support

### Resources:
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Security Guide**: See `SECURITY.md` in this repo

### Common Issues:
- Review Vercel function logs
- Check MongoDB Atlas monitoring
- Inspect browser console errors
- Verify all environment variables

---

## ✅ Post-Deployment Checklist

After successful deployment:
- [ ] Test user registration
- [ ] Test user login
- [ ] Test protected routes
- [ ] Verify database writes (create a ride/reward)
- [ ] Check API health endpoint
- [ ] Monitor first 24 hours for errors
- [ ] Share app URL with team/users

---

**🎉 Congratulations!** Your SustainAride app is now deployed with:
- ✅ Automatic MongoDB connection
- ✅ Enterprise-grade security
- ✅ Encrypted data transmission
- ✅ DDoS protection
- ✅ Zero-downtime deployments

# 🚀 Production Deployment Guide

## Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account
- Vercel account
- Git repository

## Step 1: Environment Setup

### Local Development
1. Copy `.env.example` to `server/config.env`
2. Fill in all required values:
   - `ATLAS_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Strong random string (32+ characters)
   - `FRONTEND_URL`: Your frontend URL

### Production (Vercel)
Add these environment variables in Vercel Dashboard:
```
ATLAS_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

## Step 2: MongoDB Atlas Configuration

1. **Create a Cluster**
   - Go to MongoDB Atlas
   - Create a free M0 cluster
   - Choose a region close to your users

2. **Network Access**
   - Click "Network Access"
   - Add IP: `0.0.0.0/0` (allows all IPs - Vercel uses dynamic IPs)
   - ⚠️ Use database user authentication for security

3. **Database User**
   - Click "Database Access"
   - Create a new user with strong password
   - Grant "Read and write to any database" role

4. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

## Step 3: Vercel Deployment

### Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Via GitHub Integration
1. Push code to GitHub
2. Import project in Vercel
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables
5. Deploy

## Step 4: Post-Deployment Checks

### Health Check
Visit: `https://your-app.vercel.app/health`

Should return:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-12-31T...",
  "environment": "production"
}
```

### Test API Endpoints
```bash
# Test registration
curl -X POST https://your-api.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"Test1234"}'

# Test login
curl -X POST https://your-api.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'
```

## Step 5: Security Hardening

### Enable HTTPS (Automatic on Vercel)
Vercel automatically provisions SSL certificates

### Configure CORS
Update `server/server.cjs`:
```javascript
app.use(cors({
  origin: [
    'https://your-app.vercel.app',
    'https://www.your-domain.com'
  ],
  credentials: true
}));
```

### Set Security Headers
Already configured via Helmet.js

### Enable Rate Limiting
Already configured in `server/server.cjs`

## Step 6: Monitoring Setup

### Vercel Analytics
1. Go to Vercel Dashboard
2. Enable Analytics for your project
3. Monitor performance and usage

### MongoDB Monitoring
1. Open MongoDB Atlas
2. Navigate to "Metrics"
3. Set up alerts for:
   - High connection count
   - Slow queries
   - Storage usage

### Error Tracking (Optional)
Install Sentry:
```bash
npm install @sentry/node @sentry/tracing
```

Add to `server/server.cjs`:
```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

## Step 7: Performance Optimization

### Enable Compression
Already configured in server

### Configure Caching
Add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=60, stale-while-revalidate"
        }
      ]
    }
  ]
}
```

### Database Indexing
Run these commands in MongoDB Atlas:
```javascript
// User indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ sustainPoints: -1 })

// Ride indexes
db.rides.createIndex({ user: 1, createdAt: -1 })
db.rides.createIndex({ status: 1 })

// Coupon indexes
db.coupons.createIndex({ code: 1 }, { unique: true })
db.coupons.createIndex({ isActive: 1, validUntil: 1 })
```

## Step 8: Backup Strategy

### MongoDB Backups
1. MongoDB Atlas provides automatic backups
2. Configure backup retention in Atlas
3. Test restore procedures regularly

### Code Backups
- GitHub repository (primary)
- Enable branch protection
- Regular commits and tags

## Step 9: Custom Domain (Optional)

1. Purchase domain (Namecheap, GoDaddy, etc.)
2. Add domain in Vercel Dashboard
3. Update DNS records:
   - Type: CNAME
   - Name: www
   - Value: cname.vercel-dns.com
4. Wait for SSL certificate provisioning

## Step 10: Continuous Integration

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test
```

## Troubleshooting

### Database Connection Issues
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Check network access settings

### CORS Errors
- Verify FRONTEND_URL in environment variables
- Check CORS configuration in server.cjs

### Rate Limiting Issues
- Adjust limits in server.cjs
- Monitor Vercel function logs

### Function Timeout
- Vercel free tier: 10s limit
- Optimize database queries
- Add connection pooling

## Production Checklist

- [ ] Environment variables configured
- [ ] MongoDB Atlas setup complete
- [ ] CORS properly configured
- [ ] Security headers enabled
- [ ] Rate limiting active
- [ ] SSL certificate provisioned
- [ ] Health check endpoint working
- [ ] Error tracking configured
- [ ] Database indexes created
- [ ] Backup strategy implemented
- [ ] Monitoring alerts set up
- [ ] Documentation updated

## Maintenance

### Regular Tasks
- **Daily**: Monitor error logs
- **Weekly**: Review performance metrics
- **Monthly**: Update dependencies (`npm audit fix`)
- **Quarterly**: Security audit, rotate secrets

### Scaling Considerations
- MongoDB Atlas: Upgrade cluster tier as needed
- Vercel: Upgrade plan for higher limits
- CDN: Consider Cloudflare for static assets
- Database: Implement read replicas for high traffic

---

**Need Help?** Check the [SECURITY.md](./SECURITY.md) for security best practices.

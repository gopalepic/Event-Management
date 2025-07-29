# 🚀 Production Deployment Guide

> **📌 For Cloud Deployment**: See [CLOUD_DEPLOYMENT.md](./CLOUD_DEPLOYMENT.md) for step-by-step cloud deployment instructions.

## 📋 Pre-deployment Checklist

### ✅ **Environment Variables Setup**

#### Backend (.env)
```bash
# Production Environment Variables
NODE_ENV=production
PORT=5000

# Database (use production database)
DATABASE_URL="postgresql://user:password@prod-db-host:5432/prod_db"

# Google OAuth (update redirect URL)
GOOGLE_CLIENT_ID="your_client_id"
GOOGLE_CLIENT_SECRET="your_client_secret"
GOOGLE_REDIRECT_URL="https://your-backend-domain.com/api/auth/google/callback"

# CORS Security
FRONTEND_URL="https://your-frontend-domain.com"
```

#### Frontend (.env.local)
```bash
# Frontend Production Environment
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```

### 🛡️ **Security Measures Added**

1. **CORS Protection**: Only allows requests from specified frontend URL
2. **Environment Variables**: All sensitive data moved to .env files
3. **Gitignore Protection**: .env files excluded from git
4. **OAuth Redirect Security**: Callback URLs properly configured

### 🌐 **Google Cloud Console Updates Required**

1. **Add Production Redirect URIs**:
   - `https://your-backend-domain.com/api/auth/google/callback`

2. **Add Production Origins** (if needed):
   - `https://your-frontend-domain.com`

### 🗄️ **Database Setup**

1. **Production Database**: Set up PostgreSQL instance
2. **Run Migrations**:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

### 📦 **Build Commands**

#### Backend:
```bash
npm run build  # if you add build script
npm start      # or npm run dev for development
```

#### Frontend:
```bash
npm run build
npm start
```

### 🚀 **Deployment Platforms**

#### Recommended Options:

**Backend:**
- Railway
- Render
- Heroku
- DigitalOcean App Platform

**Frontend:**
- Vercel
- Netlify
- Railway

**Database:**
- Railway PostgreSQL
- Supabase
- PlanetScale
- AWS RDS

### 🔧 **Platform-Specific Setup**

#### Vercel (Frontend):
1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically

#### Railway (Backend + Database):
1. Connect GitHub repository
2. Add PostgreSQL service
3. Set environment variables
4. Deploy automatically

### ⚠️ **Security Notes**

1. **Never commit .env files**
2. **Use different Google OAuth credentials for production**
3. **Use HTTPS in production**
4. **Set up proper database access controls**
5. **Enable production logging**

### 🧪 **Testing Production Build Locally**

```bash
# Backend
npm run build
npm start

# Frontend
npm run build
npm start
```

## 🚨 **Critical Steps Before Going Live**

1. ✅ Update Google OAuth redirect URLs
2. ✅ Set up production database
3. ✅ Configure environment variables on hosting platform
4. ✅ Test OAuth flow with production URLs
5. ✅ Test calendar event creation
6. ✅ Monitor logs for errors

# 🌐 Azure Portal Deployment Guide
**Deploy your Calendar Integration Backend using Azure Portal**

## 🚀 Step-by-Step Portal Deployment

### **Step 1: Create Database (PostgreSQL)**

1. **Go to Azure Portal**: https://portal.azure.com
2. **Click "Create a resource"**
3. **Search for "Azure Database for PostgreSQL"**
4. **Select "Azure Database for PostgreSQL flexible server"**
5. **Click "Create"**

**Configuration:**
- **Resource Group**: Create new → `calendar-integration-rg`
- **Server Name**: `calendar-integration-db` (must be globally unique)
- **Region**: Choose closest to you (e.g., East US)
- **PostgreSQL Version**: 14
- **Workload Type**: Development
- **Admin Username**: `calendaradmin`
- **Password**: Create a strong password (save it!)
- **Pricing Tier**: Burstable → B1ms (1 vCore, 2GB RAM) - ~$20/month

6. **Click "Review + Create"** → **"Create"**
7. **Wait for deployment** (takes 5-10 minutes)

### **Step 2: Configure Database**

1. **Go to your database resource**
2. **Click "Databases" in left menu**
3. **Click "+ Add"**
4. **Database Name**: `calender_app`
5. **Click "Save"**

6. **Configure Firewall**:
   - Go to **"Networking"** in left menu
   - Check **"Allow public access from any Azure service within Azure"** ✅
   - **For Development**: Add your IP: Click **"Add current client IP address"**
   - **For Production**: Remove your IP rule (keep only Azure services)
   - Click **"Save"**

   **⚠️ Security Note**: 
   - The "Azure services" rule allows your App Service to connect
   - Users access your app through the frontend/backend, NOT directly to database
   - Never add 0.0.0.0/0 (all IPs) - this would be insecure

### **Step 3: Create Web App (Backend)**

1. **Go back to Azure Portal home**
2. **Click "Create a resource"**
3. **Search for "Web App"**
4. **Click "Create"**

**Configuration:**
- **Resource Group**: Select `calendar-integration-rg`
- **Name**: `calendar-integration-backend` (must be globally unique)
- **Publish**: Code
- **Runtime Stack**: Node 18 LTS
- **Operating System**: Linux
- **Region**: Same as database
- **Pricing Plan**: 
  - Click "Create new"
  - Name: `calendar-plan`
  - Size: Basic B1 (~$13/month) or Free F1 (limited)

5. **Click "Review + Create"** → **"Create"**
6. **Wait for deployment**

### **Step 4: Configure Environment Variables**

1. **Go to your Web App resource**
2. **Click "Configuration" in left menu**
3. **Click "Application settings" tab**
4. **Add these environment variables** (click "+ New application setting" for each):

**CRITICAL Variables (Required):**
```
Name: DATABASE_URL
Value: postgresql://calendaradmin:YOUR_PASSWORD@calendar-integration-db.postgres.database.azure.com:5432/calender_app?sslmode=require

Name: GOOGLE_CLIENT_ID
Value: YOUR_GOOGLE_CLIENT_ID_HERE

Name: GOOGLE_CLIENT_SECRET
Value: YOUR_GOOGLE_CLIENT_SECRET_HERE

Name: GOOGLE_REDIRECT_URL
Value: https://calendar-integration-backend-eabkffc4gphtenfc.westus-01.azurewebsites.net/api/auth/google/callback

Name: FRONTEND_URL
Value: http://localhost:3000

Name: FRONTEND_CALLBACK_URL
Value: http://localhost:3000/auth/callback

Name: FRONTEND_ERROR_URL
Value: http://localhost:3000

Name: PORT
Value: 8080
(Azure App Service expects apps to listen on port 8080)

Name: SCM_DO_BUILD_DURING_DEPLOYMENT
Value: true
(Tells Azure to automatically build your TypeScript code during deployment)
```

**OPTIONAL Variables:**
```
Name: NODE_ENV
Value: production
(Standard practice but not used in your current code)
```

7. **Click "Save"** at the top

### **Step 5: Deploy Code from GitHub**

**Option A: Direct GitHub Connection**

1. **In your Web App**, click **"Deployment Center"** in left menu
2. **Source**: Select **"GitHub"**
3. **Sign in to GitHub** if prompted
4. **Organization**: Select your GitHub username
5. **Repository**: Select `Event-Management`
6. **Branch**: `main`
7. **Build Provider**: Select **"App Service Build Service"**
8. **Application folder**: `/backend` (important!)
9. **Click "Save"**

Azure will automatically deploy your code!

**Option B: Local Git (if GitHub doesn't work)**

1. **In Deployment Center**, select **"Local Git"**
2. **Click "Save"**
3. **Copy the Git URL** provided
4. **In your local terminal**:
```bash
cd "e:\My work\Calender-Integration\backend"
git remote add azure [PASTE_GIT_URL_HERE]
git push azure main
```

### **Step 6: Run Database Migration**

1. **In your Web App**, go to **"Development Tools"** → **"Console"**
2. **Run these commands**:
```bash
cd /home/site/wwwroot
npm run migrate
```

Or use **"SSH"** option:
1. **Click "SSH"** in Development Tools
2. **Click "Go"**
3. **Navigate to app directory**: `cd /home/site/wwwroot`
4. **Run migration**: `npm run migrate`

### **Step 7: Test Your Deployment**

1. **Go to "Overview" in your Web App**
2. **Click the URL** (e.g., https://calendar-integration-backend-eabkffc4gphtenfc.westus-01.azurewebsites.net)
3. **You should see**: "✅ Calendar Integration API is running!"

### **Step 8: Update Google OAuth**

1. **Go to**: https://console.cloud.google.com
2. **APIs & Services** → **Credentials**
3. **Edit your OAuth 2.0 Client ID**
4. **Add to "Authorized redirect URIs"**:
   ```
   https://calendar-integration-backend-eabkffc4gphtenfc.westus-01.azurewebsites.net/api/auth/google/callback
   ```
5. **Save**

### **Step 9: Handle Google Verification Warning**

When testing OAuth, Google will show: *"Google hasn't verified this app"*

**This is normal!** To continue:
1. **Click "Advanced"**
2. **Click "Go to [Your App] (unsafe)"**
3. **Complete OAuth flow**

**For production**: Add test users in OAuth consent screen or submit for Google verification.

## 🔧 Alternative: Azure Portal File Upload

If GitHub deployment doesn't work:

### **Upload ZIP File**

1. **Create deployment package**:
   - Zip your entire `backend` folder
   - Name it `backend.zip`

2. **In Azure Portal**:
   - Go to your Web App
   - **Advanced Tools** → **Go** (opens Kudu)
   - **Tools** → **ZIP Push Deploy**
   - **Drag and drop** your `backend.zip`
   - Wait for deployment

3. **Run commands in Console**:
```bash
npm install
npm run build
npm run generate
npm run migrate
```

## 🎯 Your Backend URL

After deployment, your backend will be available at:
```
https://calendar-integration-backend-eabkffc4gphtenfc.westus-01.azurewebsites.net
```

Test endpoints:
- Health: `https://calendar-integration-backend-eabkffc4gphtenfc.westus-01.azurewebsites.net/`
- Auth: `https://calendar-integration-backend-eabkffc4gphtenfc.westus-01.azurewebsites.net/api/auth/google`

## 💡 Next Steps

1. ✅ **Backend deployed to Azure**
2. **Update your frontend** `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=https://calendar-integration-backend-eabkffc4gphtenfc.westus-01.azurewebsites.net/api
   ```
3. **Deploy frontend** (Vercel/Azure Static Web Apps)
4. **Update environment variables** with frontend URL

## 🛠️ Troubleshooting

### **Check Logs**:
1. **Web App** → **Monitoring** → **Log stream**
2. Or **Diagnose and solve problems**

### **Common Issues**:
- **App won't start**: Check environment variables
- **Database connection**: Verify DATABASE_URL and firewall
- **OAuth issues**: Check Google redirect URLs

### **Restart App**:
1. **Web App** → **Overview** → **Restart**

## 💰 Cost Summary

- **PostgreSQL B1ms**: ~$20/month
- **App Service B1**: ~$13/month
- **Total**: ~$33/month

**Free Options**:
- App Service F1: Free (limited)
- Use Azure free credits!

You're all set! 🚀

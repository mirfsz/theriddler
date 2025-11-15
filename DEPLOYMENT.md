# 🚀 Deployment Guide - PDF Quiz Generator

## Quick Overview
Your app has been uploaded to: **https://github.com/mirfsz/theriddler.git**

This application consists of:
- **Frontend**: React app (can be deployed on Vercel)
- **Backend**: Flask API (needs separate hosting)

## 📦 Option 1: Deploy Frontend on Vercel (Recommended for testing)

### Step 1: Deploy Frontend to Vercel

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with your GitHub account
3. **Click "Add New Project"**
4. **Import** your repository: `mirfsz/theriddler`
5. **Configure Project**:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

6. **Add Environment Variable**:
   - Key: `REACT_APP_API_URL`
   - Value: Your backend URL (we'll set this up next)

7. **Click "Deploy"**

### Step 2: Deploy Backend (Choose ONE option)

#### Option A: Railway (Easiest for Python)

1. **Go to**: https://railway.app
2. **Sign in** with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Select**: `mirfsz/theriddler`
5. **Settings**:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
6. **Add Environment Variables**:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `PORT`: `5001`
7. **Deploy** - you'll get a URL like: `https://your-app.railway.app`

#### Option B: Render

1. **Go to**: https://render.com
2. **New** → **Web Service**
3. **Connect** your GitHub repo
4. **Settings**:
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
5. **Environment Variables**:
   - `OPENAI_API_KEY`: Your OpenAI API key
6. **Create Web Service**

#### Option C: PythonAnywhere (Free tier available)

1. **Go to**: https://www.pythonanywhere.com
2. **Sign up** for free account
3. **Upload** backend files
4. **Set up** virtual environment
5. **Configure** WSGI file
6. **Add** OpenAI API key to environment

### Step 3: Connect Frontend to Backend

1. **Go back to Vercel** dashboard
2. **Select your project**
3. **Settings** → **Environment Variables**
4. **Edit** `REACT_APP_API_URL`:
   - Value: Your backend URL (e.g., `https://your-app.railway.app`)
5. **Redeploy** the frontend

## 🔧 Option 2: Full Stack on Vercel (Advanced)

Since Vercel supports serverless functions, you can adapt the backend:

1. Create `api` folder in root
2. Convert Flask routes to serverless functions
3. Deploy everything to Vercel

**Note**: This requires significant code changes. Recommended for production after testing with Option 1.

## 📝 Important Configuration

### Environment Variables Needed

**Frontend (Vercel)**:
```
REACT_APP_API_URL=https://your-backend-url.com
```

**Backend (Railway/Render/Other)**:
```
OPENAI_API_KEY=your_openai_api_key_here
FLASK_ENV=production
PORT=5001
```

## 🎯 Quick Deploy Commands

If you make changes and want to redeploy:

```bash
cd /Users/irfanmirzan/Desktop/Website/pdf-quiz-app

# Add changes
git add .

# Commit
git commit -m "Your commit message"

# Push to GitHub (auto-deploys on Vercel)
git push origin main
```

## ✅ Testing Your Deployment

1. **Frontend**: Visit your Vercel URL
2. **Backend**: Test health endpoint: `https://your-backend-url.com/health`
3. **Full App**: Upload a sample PDF and generate a quiz

## 🔒 Security Notes

- Never commit `.env` file (already in `.gitignore`)
- Keep your OpenAI API key secure
- Set up rate limiting for production
- Enable CORS only for your frontend domain in production

## 📊 Monitoring

**Vercel Dashboard**: Monitor frontend deployments
**Railway/Render Dashboard**: Monitor backend performance and logs

## 💡 Tips

1. **Start with Railway** for backend - it's the easiest
2. **Test locally first** before deploying
3. **Check logs** if something doesn't work
4. **Backend URL**: Always use HTTPS in production
5. **OpenAI Costs**: Monitor your API usage

## 🆘 Troubleshooting

### Frontend not connecting to backend
- Check `REACT_APP_API_URL` environment variable
- Ensure backend is running
- Check CORS settings in `backend/app.py`

### Backend errors
- Verify OpenAI API key is correct
- Check environment variables are set
- Review backend logs

### Build failing on Vercel
- Ensure `package.json` is correct
- Check Node.js version compatibility
- Review build logs

## 📚 Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs
- **OpenAI API**: https://platform.openai.com/docs

---

**Your app is ready to deploy!** 🎉

Repository: https://github.com/mirfsz/theriddler

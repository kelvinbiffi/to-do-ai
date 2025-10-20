# Todo AI - Task Manager with AI Assistant

A simple, modern todo list app with AI-powered task enhancement.

## ⚡ Quick Start

### 1. Install & Setup

```bash
npm install
cp .env.example .env.local  # Configure your env vars
npm run dev
```

Open http://localhost:3000

### 2. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_API_KEY=your-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# n8n AI Agent
NEXT_PUBLIC_N8N_WEBHOOK_URL=your-webhook-url

# Optional: Docker
DOCKER_API_URL=http://host.docker.internal:3000/api
```

## 📋 Features

- ✅ Create, edit, delete tasks
- 🤖 AI-powered task descriptions
- 💬 Chat with AI assistant about your tasks
- 🔐 Secure authentication
- ⚡ Real-time updates
- 📱 Responsive design

## 🏗️ Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Database + Auth)
- n8n (AI Agent)

## 📁 Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   ├── login/            # Auth pages
│   └── page.tsx          # Main todo list
├── components/           # React components
├── lib/                  # Utilities
└── types/                # TypeScript types
```

## 🚀 Deployment Guide

### **Option 1: Netlify (Recommended for Free Tier)**

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Clean polling-based real-time updates"
   git push
   ```

2. **Redeploy on Netlify**
   - Go to [Netlify App](https://app.netlify.com)
   - Select your site
   - Click **Deploy** or wait for automatic deployment
   - Real-time updates via polling will work automatically

3. **Set Environment Variables (if needed)**
   - Site settings → Build & deploy → Environment
   - No additional configuration needed

### **Option 2: Vercel**

1. **Push to GitHub and redeploy**
   ```bash
   git push
   ```

2. **Vercel automatically detects and deploys**
   - Real-time polling updates work perfectly on Vercel

---

## 🔌 Real-Time Updates Architecture

### **How It Works**

- **Polling-based**: Every 5 seconds, the app fetches `/api/todos` to check for updates
- **Authentication**: Uses httpOnly cookies (set at login) for secure requests
- **Status indicator**: 🟢 **Live (Polling)** when connected, 🔴 **Offline** if fetch fails
- **Automatic**: No manual refresh needed - updates appear automatically

### **Why Polling?**

- **Simple**: Works with standard Next.js (no custom servers needed)
- **Reliable**: Works everywhere (dev, staging, production)
- **Secure**: Uses httpOnly cookies, not exposed to JavaScript
- **Fast enough**: 5-second refresh is imperceptible to users

---

## 🛠️ Troubleshooting

### Real-Time Updates Not Working

If you see 🔴 **Offline** status:

1. **Check authentication**
   - Open DevTools → Application → Cookies
   - Verify `user_id` cookie exists (set after login)

2. **Check Network**
   - Open DevTools → Network tab
   - Look for repeated `/api/todos` GET requests every 5 seconds
   - Check response status (should be 200)

### POST/PATCH Not Working

1. Check that auth token is valid
   - Open DevTools → Application → Cookies
   - Verify `auth_token` cookie exists

2. Check API response
   - Open DevTools → Network
   - Look for red 500 errors in `/api/todos` requests
   - Check the Response tab for error details

3. Verify Supabase credentials
   - Check `.env.local` has valid Supabase keys
   - Rebuild: `npm run build && npm run start`

## 📚 Key Files

- `src/app/Actions.ts` - Server-side CRUD operations
- `src/components/Chat.tsx` - AI chat interface
- `src/lib/Supabase.ts` - Database client
- `src/lib/N8nHelper.ts` - AI integration helpers

## ❓ Need Help?

Check the detailed documentation:
- [N8N_API_INTEGRATION.md](./N8N_API_INTEGRATION.md) - AI setup guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment

---

Made with ❤️ using Next.js & Supabase

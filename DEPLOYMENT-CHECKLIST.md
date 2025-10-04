# Deployment Checklist for Migo (Vercel-Only)

## ✅ Code Configuration (Done)

- [x] Created `/api/token.ts` - Ephemeral token generation
- [x] Created `/api/tools/firecrawl.ts` - Web scraping tools
- [x] Created `/api/tools/knowledge.ts` - Supabase knowledge queries
- [x] Refactored `TextChat.jsx` to use Gemini Live directly
- [x] Added TypeScript configuration (`tsconfig.json`)
- [x] Added Vercel routing configuration (`vercel.json`)
- [x] Added dependencies: `@vercel/node`, `@supabase/supabase-js`, `typescript`
- [x] Fixed TypeScript typing with proper `Type` and `Modality` enums
- [x] Created `.env.example` for environment variables

## 📝 Pre-Deployment Steps

### 1. Commit and Push Changes

```powershell
cd C:\Users\Adam\CascadeProjects\gemini-live-chatbot

git add -A
git commit -m "feat: Complete Vercel-only architecture with API routes"
git push origin main
```

### 2. Create Supabase Table

Run this in your Supabase SQL Editor:

```sql
-- Enable trigram extension
create extension if not exists pg_trgm;

-- Create knowledge table
create table if not exists knowledge (
  id bigserial primary key,
  title text not null,
  note text not null,
  inserted_at timestamptz default now()
);

-- Create search index
create index if not exists knowledge_title_note_ilike_idx
  on knowledge using gin (
    (coalesce(title,'') || ' ' || coalesce(note,'')) gin_trgm_ops
  );

-- Enable RLS
alter table knowledge enable row level security;

-- Allow public read
create policy "Allow public read" 
  on knowledge for select 
  to anon 
  using (true);
```

Get your Supabase credentials:
- **SUPABASE_URL**: Project Settings → API → Project URL
- **SUPABASE_ANON_KEY**: Project Settings → API → anon/public key

## 🚀 Vercel Deployment

### Step 1: Import Project to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. **CRITICAL**: Set **Root Directory** to `frontend`
4. Framework Preset: Should auto-detect as **Vite**
5. Build Command: `npm run build` (auto-detected)
6. Output Directory: `dist` (auto-detected)

### Step 2: Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables

Add these for **Production**, **Preview**, and **Development**:

| Variable | Value | Required |
|----------|-------|----------|
| `GEMINI_API_KEY` | Your Gemini API key | ✅ Yes |
| `FIRECRAWL_API_KEY` | Your Firecrawl API key | Optional |
| `SUPABASE_URL` | `https://xxx.supabase.co` | ✅ Yes |
| `SUPABASE_ANON_KEY` | Your Supabase anon key | ✅ Yes |

**Important**: Do NOT prefix with `VITE_` - these are server-side only.

### Step 3: Deploy

Click **Deploy** and wait 1-2 minutes.

### Step 4: Verify Deployment

After deployment, check:

1. **Build Logs**: Should show "Serverless Functions" section with:
   - `api/token.func`
   - `api/tools/firecrawl.func`
   - `api/tools/knowledge.func`

2. **Test API route** in browser console (replace YOUR-APP):
```javascript
fetch('https://YOUR-APP.vercel.app/api/token', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({mode: 'text'})
}).then(r => r.json()).then(console.log)
```

Should return: `{ token: "...", model: "...", mode: "text" }`

If you get **404**: Root Directory is not set to `frontend`

## 🔧 If You're Still Getting 404

### Fix 1: Verify Root Directory

1. Vercel Dashboard → Your Project
2. **Settings** → **General**
3. Scroll to **Build & Development Settings**
4. **Root Directory**: Must show `frontend`
5. If wrong, click **Edit**, set to `frontend`, Save
6. Go to **Deployments** → Latest → Click **Redeploy**

### Fix 2: Check Build Logs

1. Deployments → Click latest deployment
2. View **Build Logs**
3. Look for "Serverless Functions" section
4. Should list the 3 API functions

If functions are missing:
- Root Directory is wrong
- TypeScript compilation failed (check logs)

### Fix 3: Manually Test API Routes

Visit these URLs (should NOT return 404):

- `https://YOUR-APP.vercel.app/api/token` → "Method not allowed" (needs POST)
- Check Network tab in browser dev tools for actual error

## ✅ Post-Deployment Tests

Once deployed successfully:

1. **Connection Test**: Open your app, should see "Connected" status
2. **Text Chat**: Send "Hello" → Should get response from Migo
3. **Knowledge Base**: Send "Search knowledge for test"
4. **Web Tools**: Send "Search web for Spotify for Artists"

## 📊 Current Status

### What's Ready:
- ✅ API routes created with proper TypeScript typing
- ✅ Frontend refactored to use ephemeral tokens
- ✅ Tool execution via Vercel serverless functions
- ✅ Dependencies installed and configured
- ✅ TypeScript configuration fixed
- ✅ Vercel routing configured

### What You Need to Do:
- [ ] Commit and push changes to GitHub
- [ ] Create Supabase `knowledge` table
- [ ] Set Root Directory to `frontend` in Vercel
- [ ] Add environment variables in Vercel
- [ ] Deploy and verify

## 🆘 Troubleshooting

**Problem**: 404 on `/api/token`  
**Solution**: Root Directory must be `frontend` in Vercel settings

**Problem**: "GEMINI_API_KEY not configured"  
**Solution**: Add environment variables in Vercel, then redeploy

**Problem**: TypeScript errors in build  
**Solution**: Already fixed with proper `Type` enums

**Problem**: Cannot find module errors  
**Solution**: Run `npm install` in `frontend/` directory

## 📝 Summary

Your Vercel-only architecture is **configured correctly in code**. The 404 error is likely due to:
1. **Root Directory not set to `frontend`** (most common)
2. **Environment variables not configured** in Vercel
3. **Changes not pushed to GitHub yet**

Follow the checklist above to complete deployment!

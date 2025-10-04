# Migo Deployment Guide - Vercel Only

This guide walks you through deploying Migo as a single Vercel project with serverless API routes.

## Architecture

- **Frontend**: React + Vite static site
- **Backend**: Vercel Serverless Functions in `/api` folder
- **Tools**: Firecrawl (web scraping) + Supabase (knowledge base)
- **AI**: Google Gemini Live API (browser connects directly using ephemeral tokens)

## Prerequisites

1. **Vercel Account**: https://vercel.com
2. **Supabase Project**: https://supabase.com
3. **API Keys**:
   - Google Gemini API Key: https://ai.google.dev
   - Firecrawl API Key: https://firecrawl.dev (optional)

## Step 1: Supabase Setup

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable trigram extension for ILIKE search
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

-- Enable Row Level Security
alter table knowledge enable row level security;

-- Allow public read access (using anon key)
create policy "Allow public read" 
  on knowledge for select 
  to anon 
  using (true);
```

Get your credentials from Supabase Project Settings:
- **SUPABASE_URL**: `https://YOUR-PROJECT.supabase.co`
- **SUPABASE_ANON_KEY**: Public anon key (safe to use in serverless functions)

## Step 2: Push to GitHub

```powershell
cd C:\Users\Adam\CascadeProjects\gemini-live-chatbot

# Commit all changes
git add -A
git commit -m "feat: Vercel-only architecture with serverless API routes"

# Push to GitHub (create repo first if needed)
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. **Root Directory**: `frontend`
4. **Framework Preset**: Vite
5. **Build Command**: `npm run build` (auto-detected)
6. **Output Directory**: `dist` (auto-detected)
7. Click "Deploy"

### Option B: Vercel CLI

```powershell
cd frontend
npm install -g vercel
vercel
```

Follow prompts and select `frontend` as root.

## Step 4: Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

Add these variables for **Production, Preview, and Development**:

| Variable | Value | Notes |
|----------|-------|-------|
| `GEMINI_API_KEY` | Your Gemini API key | Required |
| `FIRECRAWL_API_KEY` | Your Firecrawl API key | Optional (web tools) |
| `SUPABASE_URL` | `https://xxx.supabase.co` | Required (knowledge base) |
| `SUPABASE_ANON_KEY` | Your Supabase anon key | Required (knowledge base) |

**Important**: Do NOT prefix these with `VITE_` - they are server-side only and will not be exposed to the browser.

After adding variables, **redeploy** your project:
- Dashboard: Deployments → Click latest → "Redeploy"
- CLI: `vercel --prod`

## Step 5: Test Your Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Wait for "Connected" status
3. Send a message to Migo
4. Test knowledge base: "Search knowledge for X"
5. Test web tools: "Search web for Spotify for Artists"

## API Routes Structure

Your Vercel deployment includes these serverless functions:

```
/api/token          → Mints Gemini Live ephemeral tokens
/api/tools/firecrawl → Executes Firecrawl tools (scrape, crawl, search)
/api/tools/knowledge → Queries Supabase knowledge table
```

## Local Development

1. Create `frontend/.env.local`:
```env
GEMINI_API_KEY=your_gemini_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Install and run:
```powershell
cd frontend
npm install
npm run dev
```

3. Open http://localhost:3000

Note: Vercel API routes work locally with `vite` thanks to Vite's proxy or manual testing. For full local API testing, use `vercel dev` instead:
```powershell
vercel dev
```

## Knowledge Base Usage

### Add entries via Supabase Dashboard:

1. Go to Supabase → Table Editor → `knowledge`
2. Insert Row:
   - **title**: "Spotify Playlist Pitching"
   - **note**: "Submit tracks 4-6 weeks before release. Use Spotify for Artists dashboard..."

### Query from Migo:

- "What's in my knowledge about Spotify?"
- "Search knowledge for playlist"
- "Fetch knowledge titled 'Spotify Playlist Pitching'"

## Troubleshooting

### Connection fails
- Check browser console for errors
- Verify `GEMINI_API_KEY` is set in Vercel env vars
- Redeploy after adding env vars

### Tools not working
- Firecrawl: Check `FIRECRAWL_API_KEY` is valid
- Knowledge: Verify Supabase credentials and RLS policy

### Build fails
- Ensure `frontend/` is set as Root Directory in Vercel
- Check build logs for missing dependencies

## Cost Notes

- **Vercel**: Free tier includes 100GB bandwidth, serverless functions
- **Supabase**: Free tier includes 500MB database, 2GB bandwidth
- **Gemini API**: Pay per token (Live API pricing)
- **Firecrawl**: Check their pricing page

## Security

- All API keys are server-side only (Vercel Serverless Functions)
- Supabase uses Row Level Security with anon key (read-only)
- Gemini ephemeral tokens expire after 5 minutes
- No secrets exposed to browser

## Next Steps

- Add more entries to knowledge base
- Customize Migo's system instruction in `frontend/api/token.ts`
- Add custom domain in Vercel settings
- Enable Web Analytics in Vercel

---

**Need help?** Check Vercel docs: https://vercel.com/docs

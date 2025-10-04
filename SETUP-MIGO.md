# Migo Setup Guide 🎵

Step-by-step instructions to get Migo up and running.

## Step 1: Prerequisites

### Install Node.js
1. Download Node.js 18+ from https://nodejs.org/
2. Run the installer
3. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

### Get API Keys

#### Gemini API Key (Required)
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)

#### Firecrawl API Key (Optional but Recommended)
1. Go to https://www.firecrawl.dev/
2. Sign up for a free account
3. Go to dashboard: https://www.firecrawl.dev/dashboard
4. Copy your API key (starts with `fc-...`)

**Note:** Without Firecrawl, Migo can't research the web but will still provide general advice.

## Step 2: Clone or Download the Project

```powershell
# If you have Git
git clone <repository-url>
cd gemini-live-chatbot

# Or download and extract the ZIP file
```

## Step 3: Backend Setup

### 3.1 Install Dependencies

```powershell
# Navigate to backend
cd backend-js

# Install Node.js packages
npm install
```

Expected output:
```
added 125 packages, and audited 125 packages in 5s
```

### 3.2 Configure Environment Variables

```powershell
# Create .env file from template
copy .env.example .env

# Open .env in notepad
notepad .env
```

Add your API keys:
```env
GEMINI_API_KEY=AIza...your_actual_key_here
FIRECRAWL_API_KEY=fc-...your_actual_key_here
PORT=8000
```

Save and close the file.

### 3.3 Test Backend

```powershell
# Start the backend server
npm start
```

You should see:
```
Server running on http://localhost:8000
WebSocket available at ws://localhost:8000/ws/chat
```

If you see a warning about Firecrawl, it means the API key is missing (optional feature).

**Keep this terminal open!**

## Step 4: Frontend Setup

### 4.1 Install Dependencies

Open a **NEW terminal window**:

```powershell
# Navigate to frontend
cd frontend

# Install packages
npm install
```

Expected output:
```
added 298 packages, and audited 298 packages in 20s
```

### 4.2 Start Frontend

```powershell
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## Step 5: Open Migo

1. Open your browser
2. Go to http://localhost:3000
3. You should see the Migo interface with a music icon 🎵

## Step 6: Test the Features

### Test Text Chat

1. Click the **"Text"** button
2. Type: "Hello Migo, can you help me with music distribution?"
3. Press Enter
4. You should see a markdown-formatted response

### Test Voice Chat

1. Click the **"Voice"** button
2. Click the **microphone icon** to start
3. Allow microphone access when prompted
4. Say: "Hi Migo, what's the best way to promote my music?"
5. Listen to Migo's voice response
6. See the live transcription appear

### Test Web Research (if Firecrawl is configured)

1. In text mode, ask: "Can you search for the latest Spotify submission guidelines?"
2. Migo will use the search tool automatically
3. You'll see current information from the web

## Troubleshooting

### Port Already in Use

If you see `EADDRINUSE` error:

**For Backend (port 8000):**
```powershell
# Find what's using the port
netstat -ano | findstr :8000

# Kill the process (replace PID with the actual number)
taskkill /PID <PID> /F
```

**For Frontend (port 3000):**
```powershell
# Find what's using the port
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F
```

Or change the port in `backend-js/.env` and `frontend/vite.config.js`.

### Microphone Not Working

1. Check browser permissions: Click the lock icon in address bar → Microphone → Allow
2. Refresh the page
3. Try Chrome or Edge (best compatibility)
4. Ensure no other app is using the microphone

### API Key Errors

**Error: "GEMINI_API_KEY not found"**
- Check your `backend-js/.env` file exists
- Verify the key is correct (no spaces, quotes, or newlines)
- Restart the backend server

**Error: "Invalid API key"**
- Get a new key from https://aistudio.google.com/app/apikey
- Ensure you're using the correct Google account
- Check if the key has expired

### Firecrawl Not Working

**Warning: "Firecrawl is not configured"**
- This is optional! Migo works without it
- To enable: Get a key from https://www.firecrawl.dev/
- Add to `backend-js/.env`
- Restart backend

**Error: "Firecrawl rate limit"**
- You've hit the free tier limit
- Wait until next month or upgrade your plan
- Check usage: https://www.firecrawl.dev/dashboard

### Nothing Happens When Typing

1. Check that backend is running (port 8000)
2. Check browser console (F12) for errors
3. Verify you're on http://localhost:3000
4. Refresh the page

### No Audio Output

1. Check volume icon in Migo (unmuted?)
2. Check system volume
3. Try headphones
4. Check browser console for errors

## PowerShell Execution Policy Error

If you see "running scripts is disabled":

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try `npm install` again.

## Running Both Servers

You need **TWO terminal windows**:

**Terminal 1 (Backend):**
```powershell
cd backend-js
npm start
```

**Terminal 2 (Frontend):**
```powershell
cd frontend
npm run dev
```

Keep both running while using Migo.

## Development Mode

For development with auto-restart:

**Backend:**
```powershell
cd backend-js
npm run dev
```

**Frontend:**
```powershell
cd frontend
npm run dev
```

Changes will automatically reload.

## Stopping the Servers

Press `Ctrl+C` in each terminal window.

## Next Steps

1. **Customize Migo's personality** - Edit `backend-js/server.js`
2. **Add more tools** - Integrate additional APIs
3. **Deploy online** - Use services like Vercel, Railway, or Render
4. **Build features** - Add conversation history, user accounts, etc.

## Quick Commands Reference

```powershell
# Backend
cd backend-js
npm install          # Install dependencies
npm start            # Start server
npm run dev          # Start with auto-restart

# Frontend  
cd frontend
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production

# Both
npm install          # Run in both directories
```

## Getting Help

- Review the main README-MIGO.md
- Check Gemini docs: https://ai.google.dev/gemini-api/docs/live-api
- Check Firecrawl docs: https://docs.firecrawl.dev/
- Look at browser console (F12) for errors

## Success Checklist

- ✅ Node.js 18+ installed
- ✅ Gemini API key obtained
- ✅ Backend dependencies installed
- ✅ Frontend dependencies installed
- ✅ .env file configured
- ✅ Backend running on port 8000
- ✅ Frontend running on port 3000
- ✅ http://localhost:3000 opens successfully
- ✅ Text chat responds
- ✅ Voice chat works (optional)
- ✅ Web research works (optional, needs Firecrawl)

---

**You're ready! Start chatting with Migo about your music career!** 🎵

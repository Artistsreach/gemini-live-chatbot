# Quick Setup Guide (JavaScript/Node.js Version)

## Prerequisites Check

Before starting, verify you have Node.js installed:

```powershell
node --version
# Should show v18.0.0 or higher
```

If not installed, download from [nodejs.org](https://nodejs.org/)

## Step-by-Step Installation

### 1. Get Your Gemini API Key

1. Visit https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key (keep it secure!)

### 2. Set Up Backend (Node.js)

```powershell
# Navigate to the JavaScript backend directory
cd C:\Users\Adam\CascadeProjects\gemini-live-chatbot\backend-js

# Install all dependencies
npm install

# This will install:
# - @google/genai (Gemini JavaScript SDK)
# - express (web server)
# - ws (WebSocket support)
# - cors (cross-origin resource sharing)
# - dotenv (environment variables)
```

### 3. Configure Your API Key

Create a `.env` file in the `backend-js` directory:

```powershell
# Copy the example file
copy .env.example .env

# Edit .env with notepad
notepad .env
```

Add your API key:
```
GEMINI_API_KEY=AIza...your_actual_api_key_here
PORT=8000
```

Save and close the file.

### 4. Set Up Frontend

```powershell
# Navigate to frontend directory
cd ..\frontend

# Install all dependencies
npm install

# This will install:
# - react (UI framework)
# - @google/genai (Gemini SDK for client)
# - vite (build tool)
# - tailwindcss (styling)
# - lucide-react (icons)
```

## Running the Application

### Terminal 1: Start Backend

```powershell
cd C:\Users\Adam\CascadeProjects\gemini-live-chatbot\backend-js
npm start
```

You should see:
```
Server running on http://localhost:8000
WebSocket available at ws://localhost:8000/ws/chat
```

**Keep this terminal open!**

### Terminal 2: Start Frontend

Open a new terminal:

```powershell
cd C:\Users\Adam\CascadeProjects\gemini-live-chatbot\frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

**Keep this terminal open too!**

### 5. Open in Browser

Navigate to: **http://localhost:3000**

## Testing the Application

### Test 1: Text Chat

1. The app should load with a chat interface
2. Click the **"Text"** button (should be selected by default)
3. Type: `Hello! Can you hear me?`
4. Press Enter or click Send
5. ✅ You should see a streaming response from Gemini

### Test 2: Voice Chat

1. Click the **"Voice"** button
2. Click the **"Start"** button
3. Allow microphone access when prompted
4. Say: `Hello Gemini, how are you today?`
5. ✅ You should:
   - See your speech transcribed in the chat
   - Hear Gemini's voice response
   - See Gemini's response transcribed

## Common Issues & Solutions

### Issue: `npm` command not found

**Solution**: Install Node.js from [nodejs.org](https://nodejs.org/)
- Download the LTS version
- Run the installer
- Restart your terminal

### Issue: Backend shows "GEMINI_API_KEY not found"

**Solution**: 
1. Check that `.env` file exists in `backend-js/` directory
2. Verify the API key is on a line: `GEMINI_API_KEY=your_key_here`
3. No quotes needed around the key
4. Restart the backend server

### Issue: Port 8000 or 3000 already in use

**Solution**: 
```powershell
# Find what's using the port
netstat -ano | findstr :8000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or change the port in .env:
PORT=8001
```

### Issue: `Cannot find module '@google/genai'`

**Solution**: 
```powershell
cd backend-js
npm install
# or
cd frontend
npm install
```

### Issue: Microphone access denied

**Solution**:
1. Chrome: Click the camera icon in address bar → Allow
2. Edge: Settings → Site permissions → Microphone → Allow
3. Firefox: Click the shield icon → Allow microphone
4. Try using `http://localhost:3000` (not file://)

### Issue: No audio playing

**Solution**:
1. Check system volume
2. Click the volume icon in the app (make sure it's not muted)
3. Check browser audio settings
4. Try refreshing the page

### Issue: WebSocket connection failed

**Solution**:
1. Verify backend is running (check Terminal 1)
2. Backend should show: `Server running on http://localhost:8000`
3. Check browser console (F12) for specific errors
4. Verify no firewall is blocking connections

### Issue: `Failed to get token` error

**Solution**:
1. Check backend terminal for errors
2. Verify API key is valid
3. Test API key by making a request:
```powershell
cd backend-js
node -e "import('@google/genai').then(m => new m.GoogleGenAI({apiKey: process.env.GEMINI_API_KEY}))"
```

## Verification Checklist

Before reporting issues, verify:

- [ ] Node.js 18+ is installed (`node --version`)
- [ ] Backend dependencies installed (`backend-js/node_modules` exists)
- [ ] Frontend dependencies installed (`frontend/node_modules` exists)
- [ ] `.env` file exists in `backend-js/` with valid API key
- [ ] Backend server is running (Terminal 1)
- [ ] Frontend dev server is running (Terminal 2)
- [ ] Browser is open to `http://localhost:3000`
- [ ] No console errors in browser (press F12 to check)

## Development Tips

### Enable Auto-Restart (Backend)

For development, use:
```powershell
cd backend-js
npm run dev
```

This automatically restarts the server when you edit `server.js`.

### View Backend Logs

The backend logs useful information:
- Connection status
- Gemini session events
- Error messages

Watch Terminal 1 for debugging.

### View Frontend Logs

Open browser console (F12) to see:
- WebSocket connection status
- Audio processing info
- API responses
- Any errors

## Next Steps After Setup

1. **Customize the system prompt**: Edit `backend-js/server.js`
2. **Change UI styling**: Edit files in `frontend/src/`
3. **Add features**: Refer to [Gemini Live API docs](https://ai.google.dev/gemini-api/docs/live-api)
4. **Deploy**: Consider Vercel (frontend) + Railway/Heroku (backend)

## Getting Help

If you're still stuck:

1. **Check browser console** (F12 → Console tab)
2. **Check backend terminal** for error messages
3. **Verify API key** at https://aistudio.google.com/app/apikey
4. **Test API connectivity**: Visit https://generativelanguage.googleapis.com/
5. **Review Gemini docs**: https://ai.google.dev/gemini-api/docs/live-api

## Quick Commands Reference

```powershell
# Start backend
cd backend-js && npm start

# Start backend (dev mode with auto-restart)
cd backend-js && npm run dev

# Start frontend
cd frontend && npm run dev

# Install backend dependencies
cd backend-js && npm install

# Install frontend dependencies
cd frontend && npm install

# Build frontend for production
cd frontend && npm run build

# Check Node.js version
node --version

# Check npm version
npm --version
```

## Success! 🎉

If you see the chat interface and can send messages, you're all set!

Try asking Gemini:
- "Tell me a joke"
- "What's the weather like?" (in voice mode)
- "Explain quantum computing in simple terms"
- "Write a haiku about coding"

Enjoy your AI chatbot! 🚀

# Quick Setup Guide

## Step-by-Step Instructions

### 1. Get a Gemini API Key

1. Visit https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

### 2. Configure Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory:

```
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Configure Frontend

```powershell
cd ..\frontend
npm install
```

### 4. Start the Application

**Terminal 1 - Backend:**
```powershell
cd backend
.\venv\Scripts\Activate
python main.py
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

### 5. Open in Browser

Navigate to: http://localhost:3000

## Testing

### Test Text Chat
1. Click "Text" mode
2. Type "Hello!" and press Enter
3. You should see a response from Gemini

### Test Voice Chat
1. Click "Voice" mode
2. Click "Start"
3. Allow microphone access
4. Say "Hello, how are you?"
5. You should hear Gemini respond and see transcriptions

## Common Issues

**Backend won't start:**
- Make sure Python 3.8+ is installed
- Verify the virtual environment is activated
- Check that all dependencies installed correctly

**Frontend won't start:**
- Make sure Node.js 18+ is installed
- Delete `node_modules` and run `npm install` again

**Voice not working:**
- Grant microphone permissions in your browser
- Check browser console for errors
- Ensure you're using a supported browser (Chrome, Firefox, Edge)

**API errors:**
- Verify your API key is correct
- Check that you have API quota available
- Ensure you're using the correct API key format

## Next Steps

- Customize the system instructions in `backend/main.py`
- Modify the UI styling in the frontend components
- Add more features like conversation history
- Deploy to production (remember to use HTTPS!)

# Gemini Live Chatbot

A real-time AI chatbot with voice and text conversations using Google Gemini Live API.

## 🚀 Two Implementations Available!

This project offers **two complete implementations** - choose the one that fits your stack:

### 1. **JavaScript/Node.js Version** (Recommended) ⭐
- ✅ **Pure JavaScript** - No Python required!
- ✅ Full-stack Node.js with Express backend
- ✅ Uses `@google/genai` official JavaScript SDK
- ✅ Simpler setup, fewer dependencies
- 📖 **[JavaScript Setup Guide →](SETUP-JS.md)**
- 📖 **[JavaScript Documentation →](README-JS.md)**

### 2. **Python Version**
- Uses FastAPI backend with Python
- Uses `google-genai` Python SDK
- 📖 **[Python Setup Guide →](SETUP.md)**

---

## Features (Both Versions)

- 🎙️ **Real-time Voice Conversations**: Talk naturally with AI using voice input and output
- 💬 **Text Chat**: Traditional text-based chat interface
- 📝 **Live Transcription**: See transcriptions of voice conversations in real-time
- 🔒 **Secure Authentication**: Uses ephemeral tokens for client-side API access
- 🎨 **Modern UI**: Beautiful, responsive interface built with React and TailwindCSS
- ⚡ **Low Latency**: Direct client-to-Gemini connection for voice
- 🌐 **Voice Activity Detection**: Natural conversation flow with interruption support

## Quick Start (JavaScript Version)

### Prerequisites

- Node.js 18+ only (no Python needed!)
- A Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

## Setup

### 1. Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=your_api_key_here
```

### 2. Frontend Setup

```powershell
# Navigate to frontend directory
cd ..\frontend

# Install dependencies
npm install
```

## Running the Application

### Start the Backend

```powershell
cd backend
.\venv\Scripts\Activate
python main.py
```

The backend will start on `http://localhost:8000`

### Start the Frontend

In a new terminal:

```powershell
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000`

## Usage

### Text Chat Mode

1. Click the "Text" button
2. Type your message in the input box
3. Press Enter or click the send button
4. View AI responses in real-time

### Voice Chat Mode

1. Click the "Voice" button
2. Click "Start" to begin the voice conversation
3. Allow microphone access when prompted
4. Start speaking - the AI will respond with voice
5. See transcriptions of both your speech and AI responses
6. Click the volume button to mute/unmute AI audio
7. Click "Stop" to end the conversation

## Features Explained

### Voice Activity Detection (VAD)

The app uses automatic voice activity detection to:
- Detect when you start speaking
- Know when you've finished speaking
- Allow natural interruptions

### Live Transcription

Both your speech and the AI's responses are transcribed in real-time and displayed in the chat interface, making it easy to review the conversation.

### Ephemeral Tokens

For security, the backend generates short-lived ephemeral tokens that the frontend uses to connect to Gemini. This prevents exposing your API key in the client code.

## Tech Stack

### Backend
- **FastAPI**: Modern, fast web framework for Python
- **google-genai**: Official Google Gemini Python SDK
- **python-dotenv**: Environment variable management

### Frontend
- **React**: UI framework
- **Vite**: Build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Web Audio API**: For audio recording and playback

## API Endpoints

### Backend Endpoints

- `GET /`: Health check
- `POST /api/token`: Generate ephemeral token for Gemini API
- `WebSocket /ws/chat`: WebSocket endpoint for text chat

### Gemini Live API

The frontend connects directly to Gemini Live API using WebSockets with ephemeral tokens for voice mode.

## Configuration

### Voice Settings

The voice chat uses:
- **Model**: `gemini-2.5-flash-native-audio-preview-09-2025`
- **Input**: 16kHz PCM audio
- **Output**: 24kHz PCM audio
- **Transcription**: Enabled for both input and output

### Text Settings

The text chat uses:
- **Model**: `gemini-live-2.5-flash-preview`
- **Response modality**: Text only

## Troubleshooting

### Microphone not working

1. Ensure you've granted microphone permissions in your browser
2. Check that your microphone is working in other applications
3. Try using HTTPS (required for microphone access in production)

### Connection errors

1. Verify your Gemini API key is correct
2. Check that both backend and frontend are running
3. Ensure you have internet connectivity

### No audio output

1. Click the volume button to ensure audio isn't muted
2. Check your system volume settings
3. Verify audio is working in other applications

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (may require HTTPS for microphone)

## Security Notes

- Never commit your `.env` file
- Use ephemeral tokens for production deployments
- Consider implementing user authentication for your backend
- Use HTTPS in production

## License

MIT

## Credits

Built with [Google Gemini Live API](https://ai.google.dev/gemini-api/docs/live-api)

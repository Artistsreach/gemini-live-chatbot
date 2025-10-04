# Gemini Live Chatbot (JavaScript/Node.js)

A real-time AI chatbot with voice and text conversations using Google Gemini Live API - **Full JavaScript Implementation**.

## Features

- 🎙️ **Real-time Voice Conversations**: Talk naturally with AI using voice input and output
- 💬 **Text Chat**: Traditional text-based chat interface
- 📝 **Live Transcription**: See transcriptions of voice conversations in real-time
- 🔒 **Secure Authentication**: Uses ephemeral tokens for client-side API access
- 🎨 **Modern UI**: Beautiful, responsive interface built with React and TailwindCSS
- ⚡ **JavaScript Stack**: Full JavaScript/Node.js implementation (no Python required)

## Architecture

- **Frontend**: React + Vite + TailwindCSS + @google/genai
- **Backend**: Node.js + Express + @google/genai
- **AI**: Google Gemini Live API with native audio support

## Prerequisites

- Node.js 18+ (no Python needed!)
- A Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

## Setup

### 1. Backend Setup (Node.js)

```powershell
# Navigate to backend-js directory
cd backend-js

# Install dependencies
npm install

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

### Start the Backend (Node.js)

```powershell
cd backend-js
npm start
```

Or for development with auto-restart:
```powershell
npm run dev
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
4. View AI responses in real-time with streaming

### Voice Chat Mode

1. Click the "Voice" button
2. Click "Start" to begin the voice conversation
3. Allow microphone access when prompted
4. Start speaking - the AI will respond with voice
5. See **live transcriptions** of both your speech and AI responses
6. Click the volume button to mute/unmute AI audio
7. Click "Stop" to end the conversation

## Features Explained

### Voice Activity Detection (VAD)

The app uses automatic voice activity detection to:
- Detect when you start speaking
- Know when you've finished speaking
- Allow natural interruptions during AI responses

### Live Transcription

Both your speech and the AI's responses are transcribed in real-time and displayed in the chat interface, creating a complete conversation history.

### Ephemeral Tokens

For security, the Node.js backend generates short-lived ephemeral tokens that the frontend uses to connect directly to Gemini. This prevents exposing your API key in the client code while maintaining low latency.

### WebSocket Communication

- **Text mode**: Client ↔ Node.js backend ↔ Gemini Live API
- **Voice mode**: Client ↔ Gemini Live API directly (using ephemeral token)

## Tech Stack

### Backend (Node.js)
- **Express**: Fast, minimalist web framework
- **@google/genai**: Official Google Gemini JavaScript SDK
- **ws**: WebSocket library for real-time communication
- **dotenv**: Environment variable management

### Frontend
- **React**: UI framework
- **Vite**: Build tool and dev server
- **@google/genai**: Google Gemini JavaScript SDK
- **TailwindCSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Web Audio API**: For audio recording and playback

## API Endpoints

### Backend Endpoints

- `GET /`: Health check
- `POST /api/token`: Generate ephemeral token for Gemini API
  - Request body: `{ "mode": "audio" | "text" }`
  - Response: `{ "token": "...", "model": "...", "mode": "..." }`
- `WebSocket /ws/chat`: WebSocket endpoint for text chat

### Gemini Live API

The frontend connects directly to Gemini Live API using WebSockets with ephemeral tokens for voice mode.

## Configuration

### Voice Settings

The voice chat uses:
- **Model**: `gemini-2.5-flash-native-audio-preview-09-2025`
- **Input**: 16kHz PCM audio (captured from microphone)
- **Output**: 24kHz PCM audio (played through speakers)
- **Transcription**: Enabled for both input and output
- **Features**: Native audio, Voice Activity Detection, affective dialog support

### Text Settings

The text chat uses:
- **Model**: `gemini-live-2.5-flash-preview`
- **Response modality**: Text only
- **Streaming**: Real-time token-by-token streaming

## Project Structure

```
gemini-live-chatbot/
├── backend-js/                 # Node.js backend
│   ├── server.js              # Main server file
│   ├── package.json           # Node.js dependencies
│   ├── .env.example           # Environment variables template
│   └── .gitignore
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Button.jsx     # Reusable button component
│   │   │   ├── Card.jsx       # Card UI components
│   │   │   ├── TextChat.jsx   # Text chat implementation
│   │   │   └── VoiceChat.jsx  # Voice chat implementation
│   │   ├── lib/
│   │   │   └── utils.js       # Utility functions
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # React entry point
│   │   └── index.css          # Global styles
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.js         # Vite configuration
│   └── tailwind.config.js     # Tailwind configuration
│
└── README-JS.md               # This file
```

## Troubleshooting

### Microphone not working

1. Ensure you've granted microphone permissions in your browser
2. Check that your microphone is working in other applications
3. Try using HTTPS (required for microphone access in some browsers)
4. Check browser console for specific error messages

### Connection errors

1. Verify your Gemini API key is correct in `backend-js/.env`
2. Check that both backend and frontend are running
3. Ensure ports 8000 and 3000 are available
4. Verify you have internet connectivity

### Backend won't start

1. Ensure Node.js 18+ is installed: `node --version`
2. Delete `node_modules` and run `npm install` again
3. Check that your API key is valid
4. Look for error messages in the terminal

### No audio output

1. Click the volume button to ensure audio isn't muted in the app
2. Check your system volume settings
3. Verify audio is working in other applications
4. Check browser console for audio playback errors

### WebSocket connection fails

1. Ensure the backend server is running
2. Check firewall settings
3. Verify the WebSocket URL matches your backend port
4. Check for CORS issues in browser console

## Browser Compatibility

- **Chrome/Edge**: Full support ✅
- **Firefox**: Full support ✅
- **Safari**: Full support ✅ (may require HTTPS for microphone)
- **Opera**: Full support ✅

## Development

### Running in Development Mode

Backend with auto-restart:
```powershell
cd backend-js
npm run dev
```

Frontend with hot reload:
```powershell
cd frontend
npm run dev
```

### Building for Production

```powershell
cd frontend
npm run build
```

This creates an optimized production build in the `dist` folder.

## Security Notes

- ✅ Never commit your `.env` file
- ✅ Use ephemeral tokens for production deployments
- ✅ Consider implementing user authentication for your backend
- ✅ Use HTTPS in production
- ✅ Ephemeral tokens expire after 30 minutes
- ✅ API key is only stored on the server, never exposed to client

## Advanced Features

### Session Management

The implementation supports:
- Session resumption for long conversations
- Context window compression for extended sessions
- Automatic reconnection on connection loss

### Voice Activity Detection Configuration

VAD can be configured with different sensitivity levels in the backend token generation.

### Custom System Instructions

Modify the system instruction in `backend-js/server.js`:

```javascript
systemInstruction: 'You are a helpful AI assistant. Be friendly, conversational, and concise in your responses.'
```

## Performance Tips

1. **Voice mode**: Connect directly to Gemini for lowest latency
2. **Text mode**: Uses backend WebSocket for simpler implementation
3. **Audio processing**: Uses Web Audio API for efficient audio handling
4. **Transcription**: Real-time with minimal overhead

## License

MIT

## Credits

- Built with [Google Gemini Live API](https://ai.google.dev/gemini-api/docs/live-api)
- Uses [@google/genai](https://www.npmjs.com/package/@google/genai) JavaScript SDK
- UI components inspired by shadcn/ui

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the [Gemini Live API documentation](https://ai.google.dev/gemini-api/docs/live-api)
3. Check browser console for error messages
4. Verify your API key has the necessary permissions

## Next Steps

- Deploy to production with HTTPS
- Add conversation history persistence
- Implement user authentication
- Add more voice customization options
- Support multiple languages
- Add video input support

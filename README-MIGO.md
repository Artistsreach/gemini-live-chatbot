# Migo - AI Music Business Expert 🎵

An AI-powered music business assistant that helps artists with distribution, promotion, and industry resources. Built with Google Gemini Live API and Firecrawl for real-time web research capabilities.

## About Migo

Migo is your intelligent music business consultant who provides:

- 🎧 **Music Distribution Strategies** - Guidance on Spotify, Apple Music, YouTube, and more
- 📱 **Promotion & Marketing** - Social media strategies and fan engagement tactics
- 🤝 **Industry Resources** - Connections to platforms, services, and contacts
- 📊 **Analytics & Insights** - Data-driven advice for artists
- ⚖️ **Rights Management** - Licensing and copyright guidance
- 💰 **Monetization Strategies** - Ways to earn from your music

## Key Features

### 🎙️ Real-Time Voice Conversations
Talk naturally with Migo using voice input and output. Get advice while working on your music.

### 💬 Text Chat
Traditional text-based interface with markdown support for detailed responses.

### 🌐 Web Research Tools (Firecrawl)
Migo can research the web in real-time to provide current information:
- **Scrape URLs** - Extract info from specific music industry websites
- **Crawl Websites** - Deep dive into distribution platforms or resources
- **Search the Web** - Find latest trends, opportunities, and resources

### 📝 Live Transcription
All voice conversations are transcribed in real-time for easy reference.

### 🔒 Secure & Private
Uses ephemeral tokens for secure client-side authentication.

## Prerequisites

- Node.js 18+
- [Gemini API Key](https://aistudio.google.com/app/apikey)
- [Firecrawl API Key](https://www.firecrawl.dev/) (optional but recommended)

## Quick Start

### 1. Backend Setup

```powershell
cd backend-js

# Install dependencies
npm install

# Create .env file
copy .env.example .env
```

Edit `.env` and add your API keys:
```env
GEMINI_API_KEY=your_gemini_api_key_here
FIRECRAWL_API_KEY=your_firecrawl_api_key_here  # Optional
PORT=8000
```

### 2. Frontend Setup

```powershell
cd frontend

# Install dependencies
npm install
```

### 3. Run the Application

**Terminal 1 - Backend:**
```powershell
cd backend-js
npm start
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

Open http://localhost:3000 in your browser.

## How to Use Migo

### Example Questions (Text Mode)

- "How do I distribute my music to Spotify?"
- "What are the best promotion strategies for independent artists?"
- "Can you search for the latest music marketing trends?"
- "What's the current state of TikTok for music promotion?"
- "How do I register my music for copyright?"

### Example Conversations (Voice Mode)

- "Hey Migo, help me understand music distribution"
- "What should I know about playlist pitching?"
- "Tell me about monetization options for artists"
- "How can I grow my fanbase on Instagram?"

### Using Web Research

Migo automatically uses Firecrawl tools when you ask about:
- Current information (trends, news, platform updates)
- Specific websites or services
- Comparisons between platforms
- Latest industry data

Example:
> **You:** "Can you look up the submission guidelines for DistroKid?"
> 
> **Migo:** *Uses scrape_url tool* → Provides current, accurate information from DistroKid's website

## Firecrawl Integration

### Available Tools

Migo has access to three powerful web research tools:

#### 1. Scrape URL
Extracts content from a single webpage.
```
Example: "Can you scrape the Spotify for Artists help page?"
```

#### 2. Crawl Website
Explores an entire website to gather comprehensive information.
```
Example: "Crawl the CD Baby website and tell me about their services"
```

#### 3. Search Web
Searches the internet for relevant, up-to-date information.
```
Example: "Search for the best music distribution services in 2025"
```

### When Firecrawl is Used

Migo intelligently decides when to use these tools based on your questions:
- ✅ Questions about current trends or data
- ✅ Requests for specific website information
- ✅ Comparisons requiring research
- ✅ Industry news or updates

### Without Firecrawl API Key

If you don't have a Firecrawl API key, Migo still works but relies on:
- Built-in knowledge from training data
- General music industry expertise
- Best practices and strategies

## Tech Stack

### AI & APIs
- **Google Gemini Live API** - Real-time AI conversations
- **Firecrawl API** - Web scraping and research

### Backend (Node.js)
- Express - Web framework
- @google/genai - Gemini JavaScript SDK
- @mendable/firecrawl-js - Firecrawl SDK
- ws - WebSocket support

### Frontend (React)
- React + Vite - UI framework & build tool
- TailwindCSS - Styling
- react-markdown - Markdown rendering
- Lucide React - Icons
- Web Audio API - Voice capabilities

## Project Structure

```
gemini-live-chatbot/
├── backend-js/
│   ├── server.js              # Main server with Firecrawl integration
│   ├── package.json           # Dependencies
│   └── .env                   # API keys (create from .env.example)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TextChat.jsx   # Text interface
│   │   │   ├── VoiceChat.jsx  # Voice interface
│   │   │   └── ...
│   │   ├── App.jsx            # Main app with Migo branding
│   │   └── index.css          # Markdown styles
│   └── package.json
│
└── README-MIGO.md            # This file
```

## Configuration

### Migo's Personality

Migo is configured with expert knowledge in:
- Music distribution strategies
- Promotion and marketing
- Social media for musicians
- Fan engagement
- Industry resources and contacts
- Rights management and licensing
- Analytics and data insights
- Monetization strategies

Modify the system instruction in `backend-js/server.js` to customize Migo's expertise.

### Voice Settings

Voice mode uses:
- **Model**: `gemini-2.5-flash-native-audio-preview-09-2025`
- **Native audio** for natural speech
- **Voice Activity Detection** for interruptions
- **Live transcription** for both input and output

### Text Settings

Text mode uses:
- **Model**: `gemini-live-2.5-flash-preview`
- **Tool use** for Firecrawl integration
- **Streaming responses**
- **Markdown formatting**

## API Endpoints

### Backend Endpoints

- `GET /` - Health check
- `POST /api/token` - Generate ephemeral token
  - Body: `{ "mode": "audio" | "text" }`
  - Returns: `{ "token": "...", "model": "...", "mode": "..." }`
- `WebSocket /ws/chat` - Text chat with tool support

## Troubleshooting

### No Firecrawl Tools Available

If you see "Firecrawl is not configured":
1. Get a Firecrawl API key at https://www.firecrawl.dev/
2. Add it to your `backend-js/.env` file
3. Restart the backend server

### Migo Isn't Using Web Tools

Ensure:
- Firecrawl API key is set correctly
- Your question requires current/online information
- Backend server restarted after adding the key

### Rate Limits

Firecrawl has usage limits based on your plan:
- Free tier: Limited requests per month
- Check your usage at https://www.firecrawl.dev/dashboard

### Voice Issues

1. Grant microphone permissions
2. Use HTTPS in production (required for microphone access)
3. Check browser console for errors
4. Ensure backend is running

## Security Best Practices

- ✅ Never commit `.env` files
- ✅ Use environment variables for API keys
- ✅ Ephemeral tokens expire after 30 minutes
- ✅ API keys stay on server, never exposed to client
- ✅ Use HTTPS in production

## Browser Compatibility

- **Chrome/Edge**: ✅ Full support
- **Firefox**: ✅ Full support
- **Safari**: ✅ Full support (HTTPS for microphone)
- **Opera**: ✅ Full support

## Development

### Dev Mode with Hot Reload

Backend:
```powershell
cd backend-js
npm run dev  # Uses --watch flag
```

Frontend:
```powershell
cd frontend
npm run dev
```

### Building for Production

```powershell
cd frontend
npm run build
```

## Example Use Cases

### For Independent Artists
- Research distribution platforms
- Get promotion strategies
- Learn about rights management
- Find monetization opportunities

### For Music Producers
- Explore licensing options
- Research sync opportunities
- Get industry contacts
- Learn about producer rights

### For Music Managers
- Research tools and platforms
- Get marketing insights
- Find partnership opportunities
- Learn about contract basics

## Costs

### Gemini API
- Free tier available
- Pay-as-you-go pricing
- Voice conversations use more tokens than text

### Firecrawl API
- Free tier: Limited requests
- Pro plans available
- Usage-based pricing

Check current pricing:
- Gemini: https://ai.google.dev/pricing
- Firecrawl: https://www.firecrawl.dev/pricing

## Roadmap

- [ ] Multi-language support
- [ ] Conversation history persistence
- [ ] User accounts and preferences
- [ ] Integration with music platforms (Spotify API, etc.)
- [ ] Calendar for release planning
- [ ] Contact database
- [ ] Email templates for pitching

## Credits

- Built with [Google Gemini Live API](https://ai.google.dev/gemini-api/docs/live-api)
- Web research powered by [Firecrawl](https://www.firecrawl.dev/)
- UI inspired by modern design systems

## Support

Having issues?
1. Check this troubleshooting section
2. Review [Gemini Live API docs](https://ai.google.dev/gemini-api/docs/live-api)
3. Check [Firecrawl documentation](https://docs.firecrawl.dev/)
4. Look at browser console for errors

## License

MIT

---

**Made for artists, by artists. Let Migo help you navigate the music business!** 🎵

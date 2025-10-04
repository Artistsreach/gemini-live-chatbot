# Voice Mode Configuration

## ✅ Configuration Complete

Both **Text Mode** and **Voice Mode** are now properly configured to work with Vercel deployment using ephemeral tokens.

## Architecture

### Text Mode (`TextChat.jsx`)
- ✅ Uses ephemeral tokens from `/api/token` 
- ✅ Connects to Gemini Live with `responseModalities: [Modality.TEXT]`
- ✅ Sends text via `session.sendClientContent()`
- ✅ Handles tool calls via `/api/tools/*` endpoints

### Voice Mode (`VoiceChat.jsx`)
- ✅ Uses ephemeral tokens from `/api/token` with `mode: 'audio'`
- ✅ Connects to Gemini Live with `responseModalities: [Modality.AUDIO]`
- ✅ Captures microphone audio at 16kHz PCM
- ✅ Sends audio via `session.sendRealtimeInput()`
- ✅ Receives and plays 24kHz PCM audio responses
- ✅ Shows transcriptions for both user and AI speech

## Token API Configuration

The `/api/token.ts` endpoint creates ephemeral tokens with different configurations based on mode:

**Text Mode:**
```javascript
{
  model: 'gemini-live-2.5-flash-preview',
  config: {
    responseModalities: [Modality.TEXT],
    systemInstruction: '...',
    tools: [...]
  }
}
```

**Audio Mode:**
```javascript
{
  model: 'gemini-live-2.5-flash-preview',
  config: {
    responseModalities: [Modality.AUDIO],
    inputAudioTranscription: {},
    outputAudioTranscription: {},
    systemInstruction: '...',
    tools: [...]
  }
}
```

## Model Choice

Using **`gemini-live-2.5-flash-preview`** (half-cascade audio):
- ✅ Better tool use support (Firecrawl + Supabase)
- ✅ More reliable for production
- ✅ Supports both text and audio responses

Alternative native audio models (better quality, limited tool support):
- `gemini-2.5-flash-native-audio-preview-09-2025`
- `gemini-2.5-flash-preview-native-audio-dialog`

## Audio Configuration

### Input Audio
- Format: 16-bit PCM, little-endian
- Sample Rate: 16kHz
- Channels: Mono
- Browser captures via `getUserMedia()` and `AudioContext`

### Output Audio
- Format: 16-bit PCM, little-endian
- Sample Rate: 24kHz
- Channels: Mono
- Played via Web Audio API `AudioContext`

## Voice Features

### Transcriptions
- **Input transcription**: Shows what user says (real-time)
- **Output transcription**: Shows AI's spoken response (real-time)

### Voice Activity Detection (VAD)
- Automatically enabled by Gemini Live
- Model detects when user is speaking
- Allows natural interruptions

### Audio Controls
- **End button**: Closes session and stops recording
- **Mute toggle**: Disables audio playback (transcriptions still work)

## Testing Voice Mode

1. **Deploy to Vercel** (or run locally with `npm run dev`)
2. Click **Voice** tab in the UI
3. Click **Start Voice Chat**
4. Allow microphone access when prompted
5. Wait for "Listening..." indicator
6. Speak naturally to Migo
7. AI responds with voice + transcription

## Deployment Checklist

- [x] Text mode configured with ephemeral tokens
- [x] Voice mode configured with ephemeral tokens  
- [x] Token API supports both `text` and `audio` modes
- [x] Tool execution routes created
- [x] Proper TypeScript types configured
- [x] Dependencies installed

## Next Steps

```powershell
# Commit changes
git add -A
git commit -m "feat: Configure voice mode with Gemini Live SDK"
git push origin main
```

Then verify in Vercel:
1. Deployments → Wait for auto-deploy
2. Test Text Mode
3. Test Voice Mode
4. Check browser console for any errors

## Troubleshooting

**"Microphone access denied"**
- Browser blocked microphone permission
- Check site settings and allow microphone

**No audio playback**
- Check audio mute button (Volume icon)
- Check browser audio settings
- Check browser console for errors

**Connection fails**
- Verify `GEMINI_API_KEY` in Vercel env vars
- Check browser console for 404 on `/api/token`
- Verify Root Directory = `frontend` in Vercel

**Audio quality issues**
- Network latency may cause delays
- Try closer to router for better connection
- Consider using native audio model for better quality (but tools won't work)

## Summary

✅ **Both text and voice modes are fully configured and ready for deployment!**

The voice mode will:
- Request ephemeral token with audio config
- Capture your microphone at 16kHz
- Stream audio to Gemini Live in real-time
- Receive and play AI voice responses at 24kHz
- Show live transcriptions of both sides
- Support natural conversation with VAD

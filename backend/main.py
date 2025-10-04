import os
import asyncio
import datetime
from typing import Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

app = FastAPI()

# CORS middleware to allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")


class TokenRequest(BaseModel):
    mode: str = "audio"  # "text" or "audio"


@app.get("/")
async def root():
    return {"message": "Gemini Live Chatbot API"}


@app.post("/api/token")
async def create_token(request: TokenRequest):
    """Create an ephemeral token for client-side authentication"""
    try:
        client = genai.Client(
            api_key=GEMINI_API_KEY,
            http_options={'api_version': 'v1alpha'}
        )
        
        now = datetime.datetime.now(tz=datetime.timezone.utc)
        
        # Configure based on mode
        response_modality = ["AUDIO"] if request.mode == "audio" else ["TEXT"]
        
        token = client.auth_tokens.create(
            config={
                'uses': 1,
                'expire_time': now + datetime.timedelta(minutes=30),
                'new_session_expire_time': now + datetime.timedelta(minutes=5),
                'live_connect_constraints': {
                    'model': 'gemini-2.5-flash-native-audio-preview-09-2025',
                    'config': {
                        'session_resumption': {},
                        'response_modalities': response_modality,
                        'system_instruction': 'You are a helpful AI assistant. Be friendly, conversational, and concise in your responses.',
                        'input_audio_transcription': {},
                        'output_audio_transcription': {} if request.mode == "audio" else None,
                    }
                },
                'http_options': {'api_version': 'v1alpha'},
            }
        )
        
        return {
            "token": token.name,
            "model": "gemini-2.5-flash-native-audio-preview-09-2025",
            "mode": request.mode
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    """WebSocket endpoint for text-based chat (server-side connection)"""
    await websocket.accept()
    
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        model = "gemini-live-2.5-flash-preview"
        config = {
            "response_modalities": ["TEXT"],
            "system_instruction": "You are a helpful AI assistant. Be friendly and conversational."
        }
        
        async with client.aio.live.connect(model=model, config=config) as session:
            # Task to receive messages from client
            async def receive_from_client():
                try:
                    while True:
                        data = await websocket.receive_json()
                        if data.get("type") == "text":
                            message = data.get("message")
                            await session.send_client_content(
                                turns={"role": "user", "parts": [{"text": message}]},
                                turn_complete=True
                            )
                except WebSocketDisconnect:
                    pass
            
            # Task to send responses to client
            async def send_to_client():
                try:
                    async for response in session.receive():
                        if response.text is not None:
                            await websocket.send_json({
                                "type": "text",
                                "text": response.text
                            })
                        
                        if response.server_content and response.server_content.turn_complete:
                            await websocket.send_json({
                                "type": "turn_complete"
                            })
                except Exception as e:
                    print(f"Error in send_to_client: {e}")
            
            # Run both tasks concurrently
            await asyncio.gather(
                receive_from_client(),
                send_to_client()
            )
            
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

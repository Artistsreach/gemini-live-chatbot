import React, { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Loader2, Volume2, VolumeX } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from './Button'
import { cn } from '../lib/utils'

export function VoiceChat() {
  const [isRecording, setIsRecording] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState([])
  const [audioEnabled, setAudioEnabled] = useState(true)
  
  const wsRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioContextRef = useRef(null)
  const audioStreamRef = useRef(null)
  const audioQueueRef = useRef([])
  const isPlayingRef = useRef(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  const cleanup = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop())
    }
    if (wsRef.current) {
      wsRef.current.close()
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
  }

  const connectVoice = async () => {
    try {
      setIsLoading(true)
      
      // Get ephemeral token from backend
      const tokenResponse = await fetch('http://localhost:8000/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'audio' })
      })
      
      if (!tokenResponse.ok) {
        throw new Error('Failed to get token')
      }
      
      const { token, model } = await tokenResponse.json()
      
      // Connect to Gemini Live API using WebSocket with ephemeral token
      const ws = new WebSocket(
        `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${token}`
      )
      
      ws.onopen = async () => {
        console.log('Connected to Gemini Live API')
        setIsConnected(true)
        setIsLoading(false)
        
        // Send setup message
        ws.send(JSON.stringify({
          setup: {
            model: `models/${model}`,
            generation_config: {
              response_modalities: ['AUDIO']
            }
          }
        }))
        
        // Start recording
        await startRecording(ws)
      }

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data)
        
        // Handle server content with audio data
        if (data.serverContent) {
          // Handle input transcription (user's speech)
          if (data.serverContent.inputTranscription) {
            const transcript = data.serverContent.inputTranscription.text
            setMessages(prev => {
              const newMessages = [...prev]
              const lastMessage = newMessages[newMessages.length - 1]
              
              if (lastMessage && lastMessage.role === 'user' && lastMessage.isStreaming) {
                lastMessage.content = transcript
              } else {
                newMessages.push({
                  role: 'user',
                  content: transcript,
                  isStreaming: true
                })
              }
              return newMessages
            })
          }
          
          // Handle output transcription (AI's speech)
          if (data.serverContent.outputTranscription) {
            const transcript = data.serverContent.outputTranscription.text
            setMessages(prev => {
              const newMessages = [...prev]
              const lastMessage = newMessages[newMessages.length - 1]
              
              if (lastMessage && lastMessage.role === 'assistant' && lastMessage.isStreaming) {
                lastMessage.content = transcript
              } else {
                newMessages.push({
                  role: 'assistant',
                  content: transcript,
                  isStreaming: true
                })
              }
              return newMessages
            })
          }
          
          // Handle model turn with audio
          if (data.serverContent.modelTurn) {
            for (const part of data.serverContent.modelTurn.parts) {
              if (part.inlineData && part.inlineData.data) {
                // Decode base64 audio and play
                if (audioEnabled) {
                  await playAudioChunk(part.inlineData.data)
                }
              }
            }
          }
          
          // Mark streaming as complete
          if (data.serverContent.turnComplete) {
            setMessages(prev => {
              const newMessages = [...prev]
              newMessages.forEach(msg => {
                if (msg.isStreaming) {
                  msg.isStreaming = false
                }
              })
              return newMessages
            })
          }
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setIsConnected(false)
        setIsLoading(false)
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected')
        setIsConnected(false)
        setIsRecording(false)
        cleanup()
      }

      wsRef.current = ws
      
    } catch (error) {
      console.error('Connection error:', error)
      alert('Failed to connect: ' + error.message)
      setIsLoading(false)
    }
  }

  const startRecording = async (ws) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioStreamRef.current = stream
      
      // Create audio context for processing
      const audioContext = new AudioContext({ sampleRate: 16000 })
      audioContextRef.current = audioContext
      
      const source = audioContext.createMediaStreamSource(stream)
      const processor = audioContext.createScriptProcessor(4096, 1, 1)
      
      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0)
          const pcmData = convertFloat32ToInt16(inputData)
          const base64Audio = arrayBufferToBase64(pcmData.buffer)
          
          // Send audio data to Gemini
          ws.send(JSON.stringify({
            realtimeInput: {
              mediaChunks: [{
                mimeType: 'audio/pcm;rate=16000',
                data: base64Audio
              }]
            }
          }))
        }
      }
      
      source.connect(processor)
      processor.connect(audioContext.destination)
      
      setIsRecording(true)
      
    } catch (error) {
      console.error('Microphone error:', error)
      alert('Failed to access microphone: ' + error.message)
    }
  }

  const convertFloat32ToInt16 = (float32Array) => {
    const int16Array = new Int16Array(float32Array.length)
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]))
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
    }
    return int16Array
  }

  const arrayBufferToBase64 = (buffer) => {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  const playAudioChunk = async (base64Audio) => {
    audioQueueRef.current.push(base64Audio)
    if (!isPlayingRef.current) {
      await processAudioQueue()
    }
  }

  const processAudioQueue = async () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false
      return
    }
    
    isPlayingRef.current = true
    const base64Audio = audioQueueRef.current.shift()
    
    try {
      // Decode base64 to array buffer
      const binaryString = atob(base64Audio)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      
      // Create audio context for playback (24kHz output from Gemini)
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 })
      
      // Convert PCM to audio buffer
      const audioBuffer = audioContext.createBuffer(1, bytes.length / 2, 24000)
      const channelData = audioBuffer.getChannelData(0)
      
      const dataView = new DataView(bytes.buffer)
      for (let i = 0; i < channelData.length; i++) {
        channelData[i] = dataView.getInt16(i * 2, true) / 32768.0
      }
      
      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContext.destination)
      source.onended = () => {
        audioContext.close()
        processAudioQueue()
      }
      source.start()
      
    } catch (error) {
      console.error('Audio playback error:', error)
      processAudioQueue()
    }
  }

  const disconnect = () => {
    cleanup()
    setIsConnected(false)
    setIsRecording(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {messages.length === 0 && !isConnected && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Mic className="h-10 w-10 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Talk to Migo
              </h2>
              <p className="text-gray-500 font-light leading-relaxed">
                Start a voice conversation to discuss your music career, distribution strategies, or promotion tactics.
              </p>
            </div>
          </div>
        )}
        
        {messages.length === 0 && isConnected && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-xl animate-pulse">
                <Mic className="h-10 w-10 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Listening...
              </h2>
              <p className="text-gray-500 font-light">
                I'm ready to help
              </p>
            </div>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              'flex',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[75%] rounded-2xl px-5 py-3 shadow-sm',
                message.role === 'user'
                  ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
                  : 'bg-gray-50 text-gray-900'
              )}
            >
              <p className="text-xs opacity-60 mb-2 font-medium">
                {message.role === 'user' ? 'You' : 'Migo'}
              </p>
              <div className={cn(
                "prose prose-sm max-w-none",
                message.role === 'user' ? 'prose-invert' : ''
              )}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content || '...'}
                </ReactMarkdown>
              </div>
              {message.isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse rounded-full" />
              )}
            </div>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-100 p-6">
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-4">
            {!isConnected ? (
              <button
                onClick={connectVoice}
                disabled={isLoading}
                className="flex items-center gap-3 px-8 py-3.5 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-full font-medium disabled:opacity-50 hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2.5} />
                    Connecting
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5" strokeWidth={2.5} />
                    Start Voice Chat
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={disconnect}
                  className="flex items-center gap-3 px-8 py-3.5 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-all duration-200 hover:shadow-xl"
                >
                  <MicOff className="h-5 w-5" strokeWidth={2.5} />
                  End
                </button>
                
                <button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200"
                >
                  {audioEnabled ? (
                    <Volume2 className="h-5 w-5 text-gray-700" strokeWidth={2.5} />
                  ) : (
                    <VolumeX className="h-5 w-5 text-gray-700" strokeWidth={2.5} />
                  )}
                </button>
              </>
            )}
          </div>
          
          {isRecording && (
            <div className="flex items-center gap-2 text-sm text-gray-500 font-light">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Recording...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

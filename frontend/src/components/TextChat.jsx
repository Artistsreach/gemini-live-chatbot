import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Music2, Paperclip, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from './Button'
import { cn } from '../lib/utils'
import { GoogleGenAI, Modality } from '@google/genai'

export function TextChat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const sessionRef = useRef(null)
  const messagesEndRef = useRef(null)
  const currentResponseRef = useRef('')
  const responseQueueRef = useRef([])
  const fileInputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    connectGemini()
    return () => {
      if (sessionRef.current) {
        try {
          sessionRef.current.close()
        } catch (e) {
          console.error('Error closing session:', e)
        }
      }
    }
  }, [])

  const handleToolCall = async (toolCall) => {
    const functionResponses = []

    for (const fc of toolCall.functionCalls) {
      console.log(`Executing tool: ${fc.name}`, fc.args)
      
      try {
        let result

        // Route to appropriate API endpoint
        if (['scrape_url', 'crawl_website', 'search_web'].includes(fc.name)) {
          const response = await fetch('/api/tools/firecrawl', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: fc.name, args: fc.args })
          })
          result = await response.json()
        } else if (['fetch_knowledge', 'search_knowledge'].includes(fc.name)) {
          const response = await fetch('/api/tools/knowledge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: fc.name, args: fc.args })
          })
          result = await response.json()
        } else {
          result = { error: `Unknown function: ${fc.name}` }
        }

        functionResponses.push({
          id: fc.id,
          name: fc.name,
          response: result
        })
      } catch (error) {
        console.error(`Error executing ${fc.name}:`, error)
        functionResponses.push({
          id: fc.id,
          name: fc.name,
          response: { error: error.message }
        })
      }
    }

    return functionResponses
  }

  const connectGemini = async () => {
    try {
      // Get ephemeral token from Vercel API
      const tokenResponse = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'text' })
      })

      if (!tokenResponse.ok) {
        throw new Error('Failed to get token')
      }

      const { token } = await tokenResponse.json()

      // Connect to Gemini Live using ephemeral token as API key
      const ai = new GoogleGenAI({ 
        apiKey: token,
        httpOptions: { apiVersion: 'v1alpha' }
      })
      
      const session = await ai.live.connect({
        model: 'gemini-live-2.5-flash-preview',
        config: {
          responseModalities: [Modality.TEXT],
          sessionResumption: {},
          contextWindowCompression: { slidingWindow: {} }
        },
        callbacks: {
          onopen: () => {
            console.log('Gemini session opened')
            setIsConnected(true)
          },
          onmessage: (message) => {
            responseQueueRef.current.push(message)
            processMessages()
          },
          onerror: (e) => {
            console.error('Gemini error:', e.message)
            setIsConnected(false)
          },
          onclose: (e) => {
            console.log('Gemini session closed:', e.reason)
            setIsConnected(false)
          }
        }
      })

      sessionRef.current = session
    } catch (error) {
      console.error('Connection error:', error)
      setIsConnected(false)
    }
  }

  const processMessages = async () => {
    while (responseQueueRef.current.length > 0) {
      const message = responseQueueRef.current.shift()
      
      if (message.text) {
        currentResponseRef.current += message.text
        
        setMessages(prev => {
          const newMessages = [...prev]
          const lastMessage = newMessages[newMessages.length - 1]
          
          if (lastMessage && lastMessage.role === 'assistant' && lastMessage.isStreaming) {
            lastMessage.content = currentResponseRef.current
          } else {
            newMessages.push({
              role: 'assistant',
              content: currentResponseRef.current,
              isStreaming: true
            })
          }
          
          return newMessages
        })
      }
      
      if (message.toolCall) {
        console.log('Tool call received:', message.toolCall)
        const functionResponses = await handleToolCall(message.toolCall)
        sessionRef.current.sendToolResponse({ functionResponses })
      }
      
      if (message.serverContent && message.serverContent.turnComplete) {
        // Save final content before clearing
        const finalContent = currentResponseRef.current
        
        setMessages(prev => {
          const newMessages = [...prev]
          const lastMessage = newMessages[newMessages.length - 1]
          if (lastMessage && lastMessage.isStreaming) {
            lastMessage.content = finalContent // Ensure final content is set
            lastMessage.isStreaming = false
          }
          return newMessages
        })
        
        // Clear after state update
        currentResponseRef.current = ''
        setIsLoading(false)
      }
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if it's an audio file (more permissive for various formats)
    const audioExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac', '.aiff']
    const isAudio = file.type.startsWith('audio/') || 
                    audioExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    
    if (!isAudio) {
      alert('Please upload an audio file (MP3, WAV, M4A, etc.)')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setUploadedFile({
        name: file.name,
        uri: data.uri,
        mimeType: data.mimeType
      })
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload file: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const sendMessage = (e) => {
    e.preventDefault()
    
    if ((!input.trim() && !uploadedFile) || !isConnected || isLoading) return

    const content = input.trim()
    const userMessage = {
      role: 'user',
      content: uploadedFile 
        ? `${content || 'Analyze this music'}\n[Attached: ${uploadedFile.name}]`
        : content
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // Send with file if uploaded
    if (uploadedFile) {
      sessionRef.current.sendClientContent({
        turns: [{
          role: 'user',
          parts: [
            { fileData: { fileUri: uploadedFile.uri, mimeType: uploadedFile.mimeType } },
            { text: content || 'Please analyze this music track. Provide constructive feedback on the production quality, mixing, arrangement, and overall sound. What are the strengths and what could be improved?' }
          ]
        }],
        turnComplete: true
      })
      setUploadedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } else {
      sessionRef.current.sendClientContent({
        turns: content,
        turnComplete: true
      })
    }

    setInput('')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Music2 className="h-8 w-8 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Hi, I'm Migo
              </h2>
              <p className="text-gray-500 font-light leading-relaxed">
                Your music business expert. Ask me about distribution, promotion, industry resources, or anything related to your music career.
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
              <div className={cn(
                "prose prose-sm max-w-none",
                message.role === 'user' ? 'prose-invert' : ''
              )}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
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

      <div className="border-t border-gray-100 pl-6 pr-1 md:pl-6 md:pr-6 py-6">
        {uploadedFile && (
          <div className="mb-3 flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
            <Music2 className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-purple-900 flex-1">{uploadedFile.name}</span>
            <button
              onClick={removeFile}
              className="text-purple-600 hover:text-purple-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        <form onSubmit={sendMessage} className="flex gap-1 md:gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac,.aiff"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!isConnected || isUploading || isLoading}
            className="w-11 h-11 rounded-full text-gray-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 bg-transparent hover:bg-transparent md:bg-gray-100 md:hover:bg-gray-200"
            title="Upload music file"
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2.5} />
            ) : (
              <Paperclip className="h-5 w-5" strokeWidth={2.5} />
            )}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isConnected ? (uploadedFile ? "Add a message (optional)..." : "Message Migo...") : "Connecting..."}
            disabled={!isConnected || isLoading}
            className="flex-1 px-5 py-3 bg-gray-50 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 placeholder:text-gray-400 text-gray-900 transition-all"
          />
          <button
            type="submit"
            disabled={!isConnected || (!input.trim() && !uploadedFile) || isLoading}
            className="w-16 md:w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2.5} />
            ) : (
              <Send className="h-5 w-5" strokeWidth={2.5} />
            )}
          </button>
        </form>
        
        {!isConnected && (
          <p className="text-xs text-red-500 mt-3 text-center font-light">Disconnected. Reconnecting...</p>
        )}
      </div>
    </div>
  )
}

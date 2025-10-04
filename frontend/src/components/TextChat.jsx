import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Music2 } from 'lucide-react'
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
  const sessionRef = useRef(null)
  const messagesEndRef = useRef(null)
  const currentResponseRef = useRef('')
  const responseQueueRef = useRef([])

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
        setMessages(prev => {
          const newMessages = [...prev]
          const lastMessage = newMessages[newMessages.length - 1]
          if (lastMessage && lastMessage.isStreaming) {
            lastMessage.isStreaming = false
          }
          return newMessages
        })
        currentResponseRef.current = ''
        setIsLoading(false)
      }
    }
  }

  const sendMessage = (e) => {
    e.preventDefault()
    
    if (!input.trim() || !isConnected || isLoading) return

    const userMessage = {
      role: 'user',
      content: input.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    sessionRef.current.sendClientContent({
      turns: input.trim(),
      turnComplete: true
    })

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

      <div className="border-t border-gray-100 p-6">
        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isConnected ? "Message Migo..." : "Connecting..."}
            disabled={!isConnected || isLoading}
            className="flex-1 px-5 py-3 bg-gray-50 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 placeholder:text-gray-400 text-gray-900 transition-all"
          />
          <button
            type="submit"
            disabled={!isConnected || !input.trim() || isLoading}
            className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200 hover:scale-105"
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

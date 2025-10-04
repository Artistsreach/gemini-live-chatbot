import React, { useState } from 'react'
import { MessageSquare, Mic, Music2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from './components/Card'
import { Button } from './components/Button'
import { TextChat } from './components/TextChat'
import { VoiceChat } from './components/VoiceChat'
import { cn } from './lib/utils'

function App() {
  const [mode, setMode] = useState('text') // 'text' or 'voice'

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Music2 className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
              Migo
            </h1>
          </div>
          <p className="text-base text-gray-500 font-light">
            Your AI music business expert
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-gray-100 rounded-full p-1 gap-1">
            <button
              onClick={() => setMode('text')}
              className={cn(
                'flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
                mode === 'text'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <MessageSquare className="h-4 w-4" strokeWidth={2} />
              Text
            </button>
            <button
              onClick={() => setMode('voice')}
              className={cn(
                'flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
                mode === 'voice'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Mic className="h-4 w-4" strokeWidth={2} />
              Voice
            </button>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden" style={{ height: '700px' }}>
          {mode === 'text' ? <TextChat /> : <VoiceChat />}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-400 font-light">
          <p>
            Powered by{' '}
            <a
              href="https://ai.google.dev/gemini-api/docs/live-api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              Gemini
            </a>
            {' '}and{' '}
            <a
              href="https://www.firecrawl.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              Firecrawl
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default App

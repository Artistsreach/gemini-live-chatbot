import React, { useState } from 'react'
import { MessageSquare, Mic } from 'lucide-react'
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
            <img
              src="https://derwionxcceokrlvgqwq.supabase.co/storage/v1/object/public/images/Migo%20logo%20black.png"
              alt="Migo logo"
              className="h-10 w-auto"
            />
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
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden" style={{ height: '500px' }}>
          {mode === 'text' ? <TextChat /> : <VoiceChat />}
        </div>

        
      </div>
    </div>
  )
}

export default App

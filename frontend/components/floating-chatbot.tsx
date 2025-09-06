"use client"

import { useState } from "react"
import { MessageCircle, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, loading } = useAuth()

  // Don't render if user is not authenticated
  if (loading || !user) {
    return null
  }

  const toggleChatbot = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chatbot Button */}
      <button
        onClick={toggleChatbot}
        className="w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        aria-label="Open chatbot"
      >
        <MessageCircle className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 transform transition-all duration-300 ease-in-out animate-in slide-in-from-bottom-2">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-emerald-50 rounded-t-lg">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-emerald-600" />
              BreatheBetter Bot
            </h3>
            <button
              onClick={toggleChatbot}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors duration-200"
              aria-label="Close chatbot"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Chat Content */}
          <div className="h-full">
            <iframe
              src="https://app.vectorshift.ai/chatbots/embedded/68bb35c69f0699f841676b90?openChatbot=true"
              width="100%"
              height="calc(100% - 60px)"
              className="rounded-b-lg"
              style={{ border: 'none' }}
              allow="clipboard-read; clipboard-write; microphone"
              title="BreatheBetter AI Chatbot"
            />
          </div>
        </div>
      )}
    </div>
  )
}

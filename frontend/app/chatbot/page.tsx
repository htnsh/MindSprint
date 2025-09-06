"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Navigation } from "@/components/navigation"


export default function ChatbotPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <Navigation />
        </div>
      </header>

    
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              AI Air Quality Assistant
            </h1>
            <p className="text-muted-foreground text-lg">
              Get personalized air quality insights and recommendations
            </p>
          </div>

          <main className="container mx-auto px-4 py-4w w-full">
            {/* VectorShift AI Chatbot Widget Container */}
            <div className="flex justify-center">
              <div className="w-full max-w-2xl rounded-lg overflow-hidden shadow-lg">
                <iframe
                  src="https://app.vectorshift.ai/chatbots/embedded/68bb35c69f0699f841676b90?openChatbot=true"
                  width="100%"
                  height="600px"
                  style={{ border: 'none' }}
                  allow="clipboard-read; clipboard-write; microphone"
                  title="AI Chatbot"
                  className="p-4"
                />
              </div>
            </div>
          </main>

          
        </div>
      </div>
    </div>
  )
}

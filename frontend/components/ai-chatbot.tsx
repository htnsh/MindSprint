"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, X, Bot, User } from "lucide-react"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

interface ChatbotProps {
  className?: string
}

export function AIChatbot({ className }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your air quality assistant. I can help you understand air quality data, provide health recommendations, and answer questions about air pollution. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()

    // Air Quality Index questions
    if (message.includes("aqi") || message.includes("air quality index")) {
      return "The Air Quality Index (AQI) is a scale from 0-500 that measures air pollution levels. 0-50 is Good (green), 51-100 is Moderate (yellow), 101-150 is Unhealthy for Sensitive Groups (orange), 151-200 is Unhealthy (red), 201-300 is Very Unhealthy (purple), and 301+ is Hazardous (maroon)."
    }

    // PM2.5 questions
    if (message.includes("pm2.5") || message.includes("particulate")) {
      return "PM2.5 refers to fine particulate matter with a diameter of 2.5 micrometers or smaller. These particles can penetrate deep into your lungs and bloodstream. Safe levels are below 12 μg/m³ annually. High PM2.5 can cause respiratory issues, heart disease, and other health problems."
    }

    // Health recommendations
    if (message.includes("health") || message.includes("recommendation") || message.includes("advice")) {
      return "For your health: When AQI is above 100, limit outdoor activities. Use air purifiers indoors, keep windows closed on high pollution days, wear N95 masks when necessary, and stay hydrated. People with asthma, heart conditions, or respiratory issues should be extra cautious."
    }

    // Allergen questions
    if (message.includes("pollen") || message.includes("allergen") || message.includes("allergy")) {
      return "Pollen levels vary by season and location. Tree pollen peaks in spring, grass pollen in late spring/early summer, and weed pollen in fall. Check daily pollen forecasts, keep windows closed during high pollen days, shower after being outdoors, and consider antihistamines if needed."
    }

    // Exercise questions
    if (message.includes("exercise") || message.includes("outdoor") || message.includes("running")) {
      return "Exercise outdoors when AQI is below 100. If AQI is 101-150, sensitive individuals should reduce prolonged outdoor exertion. Above 150, everyone should avoid outdoor exercise. Early morning often has better air quality than afternoon or evening."
    }

    // Indoor air quality
    if (message.includes("indoor") || message.includes("home") || message.includes("purifier")) {
      return "Improve indoor air quality with: HEPA air purifiers, proper ventilation, houseplants (spider plants, peace lilies), avoiding smoking indoors, using exhaust fans while cooking, and regular HVAC filter changes. Indoor air can be 2-5x more polluted than outdoor air."
    }

    // Weather and air quality
    if (message.includes("weather") || message.includes("wind") || message.includes("rain")) {
      return "Weather significantly affects air quality. Rain washes pollutants from the air, improving AQI. Wind disperses pollutants but can also bring them from other areas. High pressure systems can trap pollutants near the ground. Temperature inversions worsen air quality."
    }

    // Sensitive groups
    if (
      message.includes("asthma") ||
      message.includes("children") ||
      message.includes("elderly") ||
      message.includes("sensitive")
    ) {
      return "Sensitive groups include children, elderly (65+), pregnant women, and people with heart/lung conditions. They should take action when AQI reaches 101 (orange level), while healthy adults can wait until 151 (red level). Always consult healthcare providers for personalized advice."
    }

    // Masks and protection
    if (message.includes("mask") || message.includes("protection") || message.includes("n95")) {
      return "N95 or P100 masks filter out PM2.5 particles effectively. Cloth masks provide minimal protection against air pollution. Wear masks when AQI exceeds 150, during wildfires, or in heavily polluted areas. Ensure proper fit for maximum effectiveness."
    }

    // Default responses for general questions
    const defaultResponses = [
      "I can help you understand air quality data, health impacts, and protective measures. What specific aspect would you like to know about?",
      "Air quality affects everyone differently. Tell me about your specific concerns - are you asking about outdoor activities, health conditions, or general air quality information?",
      "I'm here to help with air quality questions! You can ask about AQI levels, health recommendations, pollution sources, or protective measures.",
    ]

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI thinking time
    setTimeout(
      () => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: getAIResponse(inputValue),
          sender: "bot",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botResponse])
        setIsTyping(false)
      },
      1000 + Math.random() * 1000,
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-xl z-50 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Bot className="h-5 w-5 text-emerald-600" />
          AI Assistant
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.sender === "user"
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.sender === "bot" && <Bot className="h-4 w-4 mt-0.5 text-emerald-600 flex-shrink-0" />}
                    {message.sender === "user" && <User className="h-4 w-4 mt-0.5 text-white flex-shrink-0" />}
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-emerald-600" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 mt-4">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about air quality..."
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            size="icon"
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { InteractiveMap } from "@/components/interactive-map"
import { MapControls } from "@/components/map-controls"
import { MapLegend } from "@/components/map-legend"
import { AIChatbot } from "@/components/ai-chatbot"
import { Navigation } from "@/components/navigation"

export default function MapPage() {
  const [activeLayer, setActiveLayer] = useState("aqi")
  const [selectedStation, setSelectedStation] = useState(null)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <Navigation />
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Map Controls Sidebar */}
        <div className="w-80 border-r bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-4 overflow-y-auto">
          <MapControls activeLayer={activeLayer} onLayerChange={setActiveLayer} />
          <MapLegend activeLayer={activeLayer} />

          {selectedStation && (
            <Card className="mt-4 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Station Details</CardTitle>
                <CardDescription>Real-time monitoring data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">AQI</span>
                    <Badge variant="secondary">42 - Good</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">PM2.5</span>
                    <span className="text-sm">15 μg/m³</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">PM10</span>
                    <span className="text-sm">22 μg/m³</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">O₃</span>
                    <span className="text-sm">65 μg/m³</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Last Update</span>
                    <span className="text-sm text-muted-foreground">2 min ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <InteractiveMap activeLayer={activeLayer} onStationSelect={setSelectedStation} />
        </div>
      </div>

      <AIChatbot />
    </div>
  )
}

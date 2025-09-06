"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Wind } from "lucide-react"

interface MapProps {
  activeLayer: string
  onStationSelect: (station: any) => void
}

// Mock data for demonstration
const monitoringStations = [
  { id: 1, name: "Downtown Station", lat: 37.7749, lng: -122.4194, aqi: 42, status: "good" },
  { id: 2, name: "Golden Gate Park", lat: 37.7694, lng: -122.4862, aqi: 38, status: "good" },
  { id: 3, name: "Mission District", lat: 37.7599, lng: -122.4148, aqi: 55, status: "moderate" },
  { id: 4, name: "Chinatown", lat: 37.7941, lng: -122.4078, aqi: 48, status: "good" },
  { id: 5, name: "Castro District", lat: 37.7609, lng: -122.435, aqi: 62, status: "moderate" },
]

const communityReports = [
  { id: 1, lat: 37.7849, lng: -122.4094, type: "smoke", severity: "high" },
  { id: 2, lat: 37.7549, lng: -122.4294, type: "dust", severity: "medium" },
  { id: 3, lat: 37.7749, lng: -122.4394, type: "pollen", severity: "low" },
]

export function InteractiveMap({ activeLayer, onStationSelect }: MapProps) {
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null)

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return "#10b981" // Green - Good
    if (aqi <= 100) return "#f59e0b" // Yellow - Moderate
    if (aqi <= 150) return "#f97316" // Orange - Unhealthy for Sensitive
    if (aqi <= 200) return "#ef4444" // Red - Unhealthy
    return "#7c2d12" // Maroon - Very Unhealthy
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      good: "bg-green-100 text-green-800",
      moderate: "bg-yellow-100 text-yellow-800",
      unhealthy: "bg-red-100 text-red-800",
    }
    return variants[status as keyof typeof variants] || variants.good
  }

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-blue-100 to-green-100 dark:from-gray-800 dark:to-gray-700">
      {/* Mock Map Background */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" className="text-gray-400">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Color-coded regions based on active layer */}
      <div className="absolute inset-0">
        {activeLayer === "aqi" && (
          <>
            <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-green-200/60 border-2 border-green-400"></div>
            <div className="absolute top-40 right-32 w-40 h-40 rounded-full bg-yellow-200/60 border-2 border-yellow-400"></div>
            <div className="absolute bottom-32 left-32 w-36 h-36 rounded-full bg-green-200/60 border-2 border-green-400"></div>
          </>
        )}
      </div>

      {/* Monitoring Stations */}
      {monitoringStations.map((station) => (
        <div
          key={station.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          style={{
            left: `${((station.lng + 122.5) / 0.2) * 100}%`,
            top: `${((37.8 - station.lat) / 0.1) * 100}%`,
          }}
          onClick={() => {
            setSelectedMarker(station.id)
            onStationSelect(station)
          }}
        >
          <div className="relative">
            <div
              className="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
              style={{ backgroundColor: getAQIColor(station.aqi) }}
            >
              <Wind className="h-3 w-3 text-white" />
            </div>
            {selectedMarker === station.id && (
              <Card className="absolute top-8 left-1/2 transform -translate-x-1/2 w-48 z-10">
                <div className="p-3">
                  <h4 className="font-semibold text-sm">{station.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getStatusBadge(station.status)}>AQI {station.aqi}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Click for detailed data</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      ))}

      {/* Community Reports */}
      {activeLayer === "community" &&
        communityReports.map((report) => (
          <div
            key={report.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{
              left: `${((report.lng + 122.5) / 0.2) * 100}%`,
              top: `${((37.8 - report.lat) / 0.1) * 100}%`,
            }}
          >
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center">
              <Users className="h-2 w-2 text-white" />
            </div>
          </div>
        ))}

      {/* Map Attribution */}
      <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded px-2 py-1">
        <p className="text-xs text-muted-foreground">Interactive Air Quality Map</p>
      </div>
    </div>
  )
}


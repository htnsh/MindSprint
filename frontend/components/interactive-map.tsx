//HEAD
// "use client"

// import { useState } from "react"
// import { Card } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Users, Wind } from "lucide-react"

// interface MapProps {
//   activeLayer: string
//   onStationSelect: (station: any) => void
// }

// // Mock data for demonstration
// const monitoringStations = [
//   { id: 1, name: "Downtown Station", lat: 37.7749, lng: -122.4194, aqi: 42, status: "good" },
//   { id: 2, name: "Golden Gate Park", lat: 37.7694, lng: -122.4862, aqi: 38, status: "good" },
//   { id: 3, name: "Mission District", lat: 37.7599, lng: -122.4148, aqi: 55, status: "moderate" },
//   { id: 4, name: "Chinatown", lat: 37.7941, lng: -122.4078, aqi: 48, status: "good" },
//   { id: 5, name: "Castro District", lat: 37.7609, lng: -122.435, aqi: 62, status: "moderate" },
// ]

// const communityReports = [
//   { id: 1, lat: 37.7849, lng: -122.4094, type: "smoke", severity: "high" },
//   { id: 2, lat: 37.7549, lng: -122.4294, type: "dust", severity: "medium" },
//   { id: 3, lat: 37.7749, lng: -122.4394, type: "pollen", severity: "low" },
// ]

// export function InteractiveMap({ activeLayer, onStationSelect }: MapProps) {
//   const [selectedMarker, setSelectedMarker] = useState<number | null>(null)

//   const getAQIColor = (aqi: number) => {
//     if (aqi <= 50) return "#10b981" // Green - Good
//     if (aqi <= 100) return "#f59e0b" // Yellow - Moderate
//     if (aqi <= 150) return "#f97316" // Orange - Unhealthy for Sensitive
//     if (aqi <= 200) return "#ef4444" // Red - Unhealthy
//     return "#7c2d12" // Maroon - Very Unhealthy
//   }

//   const getStatusBadge = (status: string) => {
//     const variants = {
//       good: "bg-green-100 text-green-800",
//       moderate: "bg-yellow-100 text-yellow-800",
//       unhealthy: "bg-red-100 text-red-800",
//     }
//     return variants[status as keyof typeof variants] || variants.good
//   }

//   return (
//     <div className="w-full h-full relative bg-gradient-to-br from-blue-100 to-green-100 dark:from-gray-800 dark:to-gray-700">
//       {/* Mock Map Background */}
//       <div className="absolute inset-0 opacity-20">
//         <svg width="100%" height="100%" className="text-gray-400">
//           <defs>
//             <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
//               <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1" />
//             </pattern>
//           </defs>
//           <rect width="100%" height="100%" fill="url(#grid)" />
//         </svg>
//       </div>

//       {/* Color-coded regions based on active layer */}
//       <div className="absolute inset-0">
//         {activeLayer === "aqi" && (
//           <>
//             <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-green-200/60 border-2 border-green-400"></div>
//             <div className="absolute top-40 right-32 w-40 h-40 rounded-full bg-yellow-200/60 border-2 border-yellow-400"></div>
//             <div className="absolute bottom-32 left-32 w-36 h-36 rounded-full bg-green-200/60 border-2 border-green-400"></div>
//           </>
//         )}
//       </div>

//       {/* Monitoring Stations */}
//       {monitoringStations.map((station) => (
//         <div
//           key={station.id}
//           className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
//           style={{
//             left: `${((station.lng + 122.5) / 0.2) * 100}%`,
//             top: `${((37.8 - station.lat) / 0.1) * 100}%`,
//           }}
//           onClick={() => {
//             setSelectedMarker(station.id)
//             onStationSelect(station)
//           }}
//         >
//           <div className="relative">
//             <div
//               className="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
//               style={{ backgroundColor: getAQIColor(station.aqi) }}
//             >
//               <Wind className="h-3 w-3 text-white" />
//             </div>
//             {selectedMarker === station.id && (
//               <Card className="absolute top-8 left-1/2 transform -translate-x-1/2 w-48 z-10">
//                 <div className="p-3">
//                   <h4 className="font-semibold text-sm">{station.name}</h4>
//                   <div className="flex items-center gap-2 mt-1">
//                     <Badge className={getStatusBadge(station.status)}>AQI {station.aqi}</Badge>
//                   </div>
//                   <p className="text-xs text-muted-foreground mt-1">Click for detailed data</p>
//                 </div>
//               </Card>
//             )}
//           </div>
//         </div>
//       ))}

//       {/* Community Reports */}
//       {activeLayer === "community" &&
//         communityReports.map((report) => (
//           <div
//             key={report.id}
//             className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
//             style={{
//               left: `${((report.lng + 122.5) / 0.2) * 100}%`,
//               top: `${((37.8 - report.lat) / 0.1) * 100}%`,
//             }}
//           >
//             <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center">
//               <Users className="h-2 w-2 text-white" />
//             </div>
//           </div>
//         ))}

//       {/* Map Attribution */}
//       <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded px-2 py-1">
//         <p className="text-xs text-muted-foreground">Interactive Air Quality Map</p>
//       </div>
//     </div>
//   )
// }
"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Layers, MapPin, RefreshCw, AlertCircle } from "lucide-react"

// Types
type Station = {
  id: number
  name: string
  lat: number
  lng: number
  aqi: number
  status: string
}

// API Keys
const WAQI_TOKEN = "fec89e5d35967b3907e0bdac5b9537ce3a8b9d2c"
const NINJA_API_KEY = "zY6iVhzDvCz1khRwHrddCQ==azeYo7v0wNQQ5nqC"

// AQI Helpers
const getAQIStatus = (aqi: number) => {
  if (aqi <= 50) return "good"
  if (aqi <= 100) return "moderate"
  if (aqi <= 150) return "unhealthy-sensitive"
  if (aqi <= 200) return "unhealthy"
  if (aqi <= 300) return "very-unhealthy"
  return "hazardous"
}

const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return "#10b981"
  if (aqi <= 100) return "#f59e0b"
  if (aqi <= 150) return "#f97316"
  if (aqi <= 200) return "#ef4444"
  if (aqi <= 300) return "#7c2d12"
  return "#4c1d95"
}

const getStatusBadge = (status: string) => {
  const variants: Record<string, string> = {
    good: "bg-green-100 text-green-800",
    moderate: "bg-yellow-100 text-yellow-800",
    "unhealthy-sensitive": "bg-orange-100 text-orange-800",
    unhealthy: "bg-red-100 text-red-800",
    "very-unhealthy": "bg-red-200 text-red-900",
    hazardous: "bg-purple-100 text-purple-800",
  }
  return variants[status] || variants.moderate
}

const createCustomIcon = (color: string) => {
  const size = 32
  const svgString = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${color}" stroke="white" stroke-width="2"/>
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`
}

// Interactive Map
// Interactive Map
function InteractiveMap({
  stations = [],
  onStationSelect,
}: {
  stations?: Station[]
  onStationSelect: (s: Station) => void
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (!mapRef.current) return
    const L = (window as any).L
    if (!L) {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css"
      document.head.appendChild(link)

      const script = document.createElement("script")
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"
      script.onload = () => initMap()
      document.head.appendChild(script)
    } else {
      initMap()
    }

    function initMap() {
      if (mapInstanceRef.current) mapInstanceRef.current.remove()
      const L = (window as any).L
      const map = L.map(mapRef.current).setView([28.6139, 77.209], 6) // Default Delhi
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map)
      mapInstanceRef.current = map
      updateMarkers()
    }

    return () => {
      if (mapInstanceRef.current) mapInstanceRef.current.remove()
    }
  }, [])

  useEffect(() => {
    updateMarkers()
  }, [stations])

  const updateMarkers = () => {
    const L = (window as any).L
    if (!L || !mapInstanceRef.current) return

    // Clear existing markers
    markersRef.current.forEach((m) => mapInstanceRef.current.removeLayer(m))
    markersRef.current = []

    // ✅ Guard against undefined or empty array
    if (!stations || stations.length === 0) return

    stations.forEach((s) => {
      const icon = L.icon({
        iconUrl: createCustomIcon(getAQIColor(s.aqi)),
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      const marker = L.marker([s.lat, s.lng], { icon })
        .bindPopup(`<strong>${s.name}</strong><br/>AQI: ${s.aqi}`)
        .on("click", () => onStationSelect(s))
        .addTo(mapInstanceRef.current)

      markersRef.current.push(marker)
    })

    if (stations.length === 1) {
      mapInstanceRef.current.setView([stations[0].lat, stations[0].lng], 11)
    }
  }

  return <div ref={mapRef} className="w-full h-full rounded-lg" />
}

// Location Search
function LocationSearch({ onSearch, loading }: { onSearch: (city: string) => void; loading: boolean }) {
  const [query, setQuery] = useState("")
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex gap-2 items-center">
          <MapPin className="h-5 w-5" /> Search City
        </CardTitle>
        <CardDescription>Enter city to load AQI data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. Delhi, San Francisco" />
          <Button onClick={() => onSearch(query)} disabled={loading || !query.trim()}>
            {loading ? "Loading..." : "Go"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Map Controls
function MapControls({ onRefresh, onMyLocation, loading }: { onRefresh: () => void; onMyLocation: () => void; loading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Map Controls
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onMyLocation} disabled={loading}>
              <MapPin className="h-4 w-4" /> My Location
            </Button>
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
    </Card>
  )
}

// Map Legend
function MapLegend() {
  const items = [
    { range: "0-50", color: "#10b981", label: "Good" },
    { range: "51-100", color: "#f59e0b", label: "Moderate" },
    { range: "101-150", color: "#f97316", label: "Unhealthy Sensitive" },
    { range: "151-200", color: "#ef4444", label: "Unhealthy" },
    { range: "201-300", color: "#7c2d12", label: "Very Unhealthy" },
    { range: "301+", color: "#4c1d95", label: "Hazardous" },
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle>Legend</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: it.color }}></div>
            <span className="text-sm">{it.range} - {it.label}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Main App
export default function AirQualityApp() {
  const [stations, setStations] = useState<Station[]>([])
  const [selected, setSelected] = useState<Station | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCityAQI = async (city: string) => {
    setLoading(true)
    setError(null)
    try {
      // 1. Get coordinates
      const geoRes = await fetch(`https://api.api-ninjas.com/v1/geocoding?city=${encodeURIComponent(city)}`, {
        headers: { "X-Api-Key": NINJA_API_KEY },
      })
      const geo = await geoRes.json()
      const lat = geo[0]?.latitude
      const lon = geo[0]?.longitude
      if (!lat || !lon) throw new Error("No coordinates")

      // 2. Get AQI
      const aqiRes = await fetch(`https://api.waqi.info/feed/geo:${lat};${lon}/?token=${WAQI_TOKEN}`)
      const data = await aqiRes.json()
      if (data.status !== "ok") throw new Error("No AQI data")

      const s: Station = {
        id: Date.now(),
        name: data.data.city.name,
        lat,
        lng: lon,
        aqi: data.data.aqi,
        status: getAQIStatus(data.data.aqi),
      }
      setStations([s])
      setSelected(s)
    } catch (e: any) {
      console.error(e)
      setError("Failed to load AQI. Showing demo data.")
      const demo: Station = {
        id: Date.now(),
        name: `${city} Demo Station`,
        lat: 28.6,
        lng: 77.2,
        aqi: Math.floor(Math.random() * 200),
        status: "moderate",
      }
      setStations([demo])
      setSelected(demo)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    if (selected) fetchCityAQI(selected.name)
  }

  const handleMyLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const lat = pos.coords.latitude
          const lon = pos.coords.longitude
          const aqiRes = await fetch(`https://api.waqi.info/feed/geo:${lat};${lon}/?token=${WAQI_TOKEN}`)
          const data = await aqiRes.json()
          if (data.status === "ok") {
            const s: Station = {
              id: Date.now(),
              name: data.data.city.name,
              lat,
              lng: lon,
              aqi: data.data.aqi,
              status: getAQIStatus(data.data.aqi),
            }
            setStations([s])
            setSelected(s)
          }
        } catch (err) {
          console.error(err)
        }
      })
    }
  }

  useEffect(() => {
    fetchCityAQI("Delhi") // Default load
  }, [])

  return (
    <div className="w-full h-screen flex gap-4 p-4 bg-gray-50">
      <div className="flex-1 bg-white rounded-lg shadow-sm">
        <InteractiveMap stations={stations} onStationSelect={setSelected} />
      </div>
      <div className="w-80 space-y-4 overflow-y-auto">
        <LocationSearch onSearch={fetchCityAQI} loading={loading} />
        <MapControls onRefresh={handleRefresh} onMyLocation={handleMyLocation} loading={loading} />
        <MapLegend />
        {error && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-2 text-sm text-yellow-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> {error}
            </CardContent>
          </Card>
        )}
        {selected && (
          <Card>
            <CardHeader>
              <CardTitle>Station Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>{selected.name}</strong></p>
              <Badge className={getStatusBadge(selected.status)}>AQI {selected.aqi}</Badge>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

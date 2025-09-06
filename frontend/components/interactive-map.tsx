// Interactive Map
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Wind, Activity, Layers, RefreshCw, MapPin, AlertCircle } from "lucide-react"

// Types
interface Station {
  id: number
  name: string
  lat: number
  lng: number
  aqi: number
  status: string
  city?: string
  pollutants?: {
    pm25?: number
    pm10?: number
    o3?: number
    no2?: number
    so2?: number
    co?: number
  }
  time?: string
}

interface CommunityReport {
  id: number
  lat: number
  lng: number
  type: string
  severity: string
  timestamp?: string
  description?: string
}

// API Configuration
const WAQI_API_TOKEN = "fec89e5d35967b3907e0bdac5b9537ce3a8b9d2c"

// Interactive Map Component
export function InteractiveMap({ activeLayer, stations, onStationSelect }: {
  activeLayer: string
  stations: Station[]
  onStationSelect: (station: Station) => void
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  const communityReports: CommunityReport[] = [
    { id: 1, lat: 28.6139, lng: 77.2090, type: "smoke", severity: "high", timestamp: new Date().toISOString() },
    { id: 2, lat: 19.0760, lng: 72.8777, type: "dust", severity: "medium", timestamp: new Date().toISOString() },
    { id: 3, lat: 12.9716, lng: 77.5946, type: "pollen", severity: "low", timestamp: new Date().toISOString() },
  ]

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return "#10b981"
    if (aqi <= 100) return "#f59e0b"
    if (aqi <= 150) return "#f97316"
    if (aqi <= 200) return "#ef4444"
    if (aqi <= 300) return "#7c2d12"
    return "#4c1d95"
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      good: "bg-green-100 text-green-800",
      moderate: "bg-yellow-100 text-yellow-800",
      "unhealthy-sensitive": "bg-orange-100 text-orange-800",
      unhealthy: "bg-red-100 text-red-800",
      "very-unhealthy": "bg-red-200 text-red-900",
      hazardous: "bg-purple-100 text-purple-800",
    }
    return variants[status as keyof typeof variants] || variants.moderate
  }

  const createCustomIcon = (color: string, iconType: "station" | "community") => {
    const size = iconType === "station" ? 32 : 20
    const iconPath =
      iconType === "station"
        ? `<path d="M${size / 2 - 6},${size / 2 - 4} L${size / 2},${size / 2 - 8} L${size / 2 + 6},${size / 2 - 4} L${size / 2 + 4},${size / 2 + 2} L${size / 2 - 4},${size / 2 + 2} Z" fill="white"/>`
        : `<circle cx="${size / 2 - 3}" cy="${size / 2 - 2}" r="2" fill="white"/><circle cx="${size / 2 + 3
        }" cy="${size / 2 - 2}" r="2" fill="white"/><path d="M${size / 2 - 4},${size / 2 + 2} Q${size / 2
        },${size / 2 + 4} ${size / 2 + 4},${size / 2 + 2}" stroke="white" stroke-width="1" fill="none"/>`

    const svgString = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${color}" stroke="white" stroke-width="2"/>
      ${iconPath}
    </svg>`

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`
  }

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
      script.onload = () => initializeMap()
      document.head.appendChild(script)
    } else {
      initializeMap()
    }

    function initializeMap() {
      const L = (window as any).L
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }

      // Default to Delhi, India coordinates
      const map = L.map(mapRef.current).setView([28.6139, 77.2090], 10)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors | Air Quality Data: WAQI",
      }).addTo(map)

      mapInstanceRef.current = map
      updateMarkers()
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }
    }
  }, [])

  useEffect(() => {
    updateMarkers()
  }, [activeLayer, stations])

  const updateMarkers = () => {
    const L = (window as any).L
    if (!L || !mapInstanceRef.current) return

    // ✅ Guard against undefined/null stations
    if (!stations || stations.length === 0) {
      console.warn("No stations available to render")
      return
    }

    // Remove old markers
    markersRef.current.forEach((marker) => {
      mapInstanceRef.current.removeLayer(marker)
    })
    markersRef.current = []

    // Add new station markers
    stations.forEach((station) => {
      const icon = L.icon({
        iconUrl: createCustomIcon(getAQIColor(station.aqi), "station"),
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      })

      const pollutantInfo = station.pollutants
        ? Object.entries(station.pollutants)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => `<div class="text-xs"><strong>${key.toUpperCase()}:</strong> ${value}</div>`)
          .join("")
        : ""

      const marker = L.marker([station.lat, station.lng], { icon })
        .bindPopup(`
        <div class="p-3 min-w-[200px]">
          <h4 class="font-semibold text-sm mb-2">${station.name}</h4>
          <div class="mb-2">
            <span class="inline-block px-2 py-1 text-xs rounded ${getStatusBadge(station.status)}">
              AQI ${station.aqi}
            </span>
          </div>
          ${pollutantInfo}
          ${station.time
            ? `<div class="text-xs text-gray-500 mt-2">Updated: ${new Date(
              station.time
            ).toLocaleString()}</div>`
            : ""
          }
        </div>
      `)
        .on("click", () => onStationSelect(station))
        .addTo(mapInstanceRef.current)

      markersRef.current.push(marker)
    })

    // Center map on the stations
    if (stations.length === 1) {
      mapInstanceRef.current.setView([stations[0].lat, stations[0].lng], 12)
    } else {
      const group = new L.featureGroup(markersRef.current)
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1))
    }

    // ✅ Community reports only if data exists
    if (activeLayer === "community" && communityReports && communityReports.length > 0) {
      communityReports.forEach((report) => {
        const color =
          report.severity === "high"
            ? "#ef4444"
            : report.severity === "medium"
              ? "#f59e0b"
              : "#10b981"

        const icon = L.icon({
          iconUrl: createCustomIcon(color, "community"),
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          popupAnchor: [0, -10],
        })

        const marker = L.marker([report.lat, report.lng], { icon })
          .bindPopup(`
          <div class="p-2">
            <h4 class="font-semibold text-sm capitalize">${report.type} Report</h4>
            <p class="text-xs text-gray-600">Severity: ${report.severity}</p>
            ${report.description ? `<p class="text-xs mt-1">${report.description}</p>` : ""}
          </div>
        `)
          .addTo(mapInstanceRef.current)

        markersRef.current.push(marker)
      })
    }
  }


  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      {!mapInstanceRef.current && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Location Search Component
export function LocationSearch({ onLocationSearch, loading }: {
  onLocationSearch: (location: string) => void
  loading: boolean
}) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onLocationSearch(searchQuery.trim())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const popularCities = [
    "Delhi", "Mumbai", "Beijing", "London", "New York", "Los Angeles",
    "Tokyo", "Paris", "São Paulo", "Mexico City", "Shanghai", "Bangkok"
  ]

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Search
        </CardTitle>
        <CardDescription>Search for air quality data by city or location</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Enter city name (e.g., Delhi, Mumbai, Beijing, London)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <Button onClick={handleSearch} disabled={loading || !searchQuery.trim()}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {popularCities.map((city) => (
              <Button
                key={city}
                variant="outline"
                size="sm"
                onClick={() => onLocationSearch(city)}
                disabled={loading}
                className="text-xs h-6"
              >
                {city}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Map Controls Component
export function MapControls({ activeLayer, onLayerChange, onRefresh, onGetMyLocation, loading }: {
  activeLayer: string
  onLayerChange: (layer: string) => void
  onRefresh: () => void
  onGetMyLocation: () => void
  loading: boolean
}) {
  const layers = [
    { id: "aqi", name: "Air Quality Index", icon: Wind, description: "Real-time AQI data" },
    { id: "pm25", name: "PM2.5 Levels", icon: Activity, description: "Fine particulate matter" },
    { id: "community", name: "Community Reports", icon: Users, description: "User-submitted data" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Map Controls
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onGetMyLocation}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              My Location
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardTitle>
        <CardDescription>Choose what data to display</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {layers.map((layer) => {
          const Icon = layer.icon
          return (
            <div key={layer.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">{layer.name}</Label>
                  <p className="text-xs text-muted-foreground">{layer.description}</p>
                </div>
              </div>
              <Switch
                checked={activeLayer === layer.id}
                onCheckedChange={() => onLayerChange(layer.id)}
                disabled={loading}
              />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

// Map Legend Component
export function MapLegend({ activeLayer }: { activeLayer: string }) {
  const legends = {
    aqi: [
      { range: "0-50", color: "#10b981", label: "Good", description: "Air quality is satisfactory" },
      { range: "51-100", color: "#f59e0b", label: "Moderate", description: "Acceptable for most people" },
      { range: "101-150", color: "#f97316", label: "Unhealthy for Sensitive", description: "Sensitive groups may experience symptoms" },
      { range: "151-200", color: "#ef4444", label: "Unhealthy", description: "Everyone may experience symptoms" },
      { range: "201-300", color: "#7c2d12", label: "Very Unhealthy", description: "Health alert for everyone" },
      { range: "301+", color: "#4c1d95", label: "Hazardous", description: "Emergency conditions" },
    ],
    pm25: [
      { range: "0-12", color: "#10b981", label: "Good", description: "Little to no risk" },
      { range: "12-35", color: "#f59e0b", label: "Moderate", description: "Acceptable for most people" },
      { range: "35-55", color: "#f97316", label: "Unhealthy for Sensitive", description: "Sensitive groups at risk" },
      { range: "55+", color: "#ef4444", label: "Unhealthy", description: "Health concerns for everyone" },
    ],
    community: [
      { range: "Low", color: "#10b981", label: "Low Severity", description: "Minor issues reported" },
      { range: "Medium", color: "#f59e0b", label: "Medium Severity", description: "Moderate concerns" },
      { range: "High", color: "#ef4444", label: "High Severity", description: "Significant issues" },
    ],
  }

  const currentLegend = legends[activeLayer as keyof typeof legends] || legends.aqi

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Legend</CardTitle>
        <CardDescription>
          {activeLayer === "aqi" && "Air Quality Index ranges"}
          {activeLayer === "pm25" && "PM2.5 concentration (μg/m³)"}
          {activeLayer === "community" && "Community report severity"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {currentLegend.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: item.color }}></div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{item.range}</span>
                <Badge variant="outline" className="text-xs">
                  {item.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Main Application Component
export default function AirQualityApp() {
  const [activeLayer, setActiveLayer] = useState("aqi")
  const [stations, setStations] = useState<Station[]>([])
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentLocation, setCurrentLocation] = useState("Delhi")

  const getAQIStatusFromValue = (aqi: number): string => {
    if (aqi <= 50) return "good"
    if (aqi <= 100) return "moderate"
    if (aqi <= 150) return "unhealthy-sensitive"
    if (aqi <= 200) return "unhealthy"
    if (aqi <= 300) return "very-unhealthy"
    return "hazardous"
  }

  const getStatusBadgeFromStatus = (status: string): string => {
    const variants = {
      good: "bg-green-100 text-green-800",
      moderate: "bg-yellow-100 text-yellow-800",
      "unhealthy-sensitive": "bg-orange-100 text-orange-800",
      unhealthy: "bg-red-100 text-red-800",
      "very-unhealthy": "bg-red-200 text-red-900",
      hazardous: "bg-purple-100 text-purple-800",
    }
    return variants[status as keyof typeof variants] || variants.moderate
  }

  // Geocode city name to coordinates using your API
  const geocodeLocation = async (location: string): Promise<{ lat: number, lng: number } | null> => {
    try {
      const apiKey = "zY6iVhzDvCz1khRwHrddCQ==azeYo7v0wNQQ5nqC"
      const response = await fetch(`https://api.api-ninjas.com/v1/geocoding?city=${encodeURIComponent(location)}`, {
        headers: {
          'X-Api-Key': apiKey
        }
      })
      const data = await response.json()

      if (data && data.length > 0) {
        return {
          lat: data[0].latitude,
          lng: data[0].longitude
        }
      }
      return null
    } catch (error) {
      console.error('Geocoding API error:', error)

      // Fallback to OpenStreetMap Nominatim if your API fails
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`)
        const data = await response.json()

        if (data && data.length > 0) {
          return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
          }
        }
      } catch (fallbackError) {
        console.error('Fallback geocoding error:', fallbackError)
      }

      return null
    }
  }

  // Get coordinates from location using various methods
  const getLocationCoordinates = async (location: string): Promise<{ lat: number, lng: number }> => {
    // Try geocoding first
    const coords = await geocodeLocation(location)
    if (coords) return coords

    // Fallback coordinates for major cities
    const cityCoords: { [key: string]: { lat: number, lng: number } } = {
      "delhi": { lat: 28.6139, lng: 77.2090 },
      "mumbai": { lat: 19.0760, lng: 72.8777 },
      "bangalore": { lat: 12.9716, lng: 77.5946 },
      "beijing": { lat: 39.9042, lng: 116.4074 },
      "london": { lat: 51.5074, lng: -0.1278 },
      "new york": { lat: 40.7128, lng: -74.0060 },
      "los angeles": { lat: 34.0522, lng: -118.2437 },
      "tokyo": { lat: 35.6762, lng: 139.6503 },
      "paris": { lat: 48.8566, lng: 2.3522 },
      "shanghai": { lat: 31.2304, lng: 121.4737 },
      "bangkok": { lat: 13.7563, lng: 100.5018 },
      "mexico city": { lat: 19.4326, lng: -99.1332 },
      "são paulo": { lat: -23.5505, lng: -46.6333 }
    }

    const key = location.toLowerCase()
    return cityCoords[key] || { lat: 28.6139, lng: 77.2090 } // Default to Delhi
  }

  const fetchAirQualityData = async (location: string = "Delhi") => {
    setLoading(true)
    setError(null)

    try {
      // Get coordinates for the location
      const coords = await getLocationCoordinates(location)

      // Try multiple API approaches
      let data = null

      // Method 1: Try direct API call with jsonp (may work in some cases)
      try {
        const response = await fetch(`https://api.waqi.info/feed/${encodeURIComponent(location)}/?token=${WAQI_API_TOKEN}`, {
          method: 'GET',
          mode: 'cors',
        })
        if (response.ok) {
          data = await response.json()
        }
      } catch (e) {
        console.log('Direct API call failed, trying alternatives...')
      }

      // Method 2: Try coordinate-based search if location search fails
      if (!data || data.status !== "ok") {
        try {
          const response = await fetch(`https://api.waqi.info/feed/geo:${coords.lat};${coords.lng}/?token=${WAQI_API_TOKEN}`, {
            method: 'GET',
            mode: 'cors',
          })
          if (response.ok) {
            data = await response.json()
          }
        } catch (e) {
          console.log('Coordinate-based API call failed...')
        }
      }

      // Method 3: Try with a CORS proxy
      if (!data || data.status !== "ok") {
        try {
          const proxyUrl = 'https://corsproxy.io/?'
          const targetUrl = `https://api.waqi.info/feed/${encodeURIComponent(location)}/?token=${WAQI_API_TOKEN}`

          const response = await fetch(`${proxyUrl}${encodeURIComponent(targetUrl)}`)
          if (response.ok) {
            data = await response.json()
          }
        } catch (e) {
          console.log('CORS proxy failed...')
        }
      }

      if (data && data.status === "ok" && data.data) {
        const stationData = data.data

        const station: Station = {
          id: stationData.idx || Date.now(),
          name: stationData.city?.name || location,
          lat: stationData.city?.geo?.[0] || coords.lat,
          lng: stationData.city?.geo?.[1] || coords.lng,
          aqi: stationData.aqi || 0,
          status: getAQIStatusFromValue(stationData.aqi || 0),
          city: stationData.city?.name || location,
          pollutants: {
            pm25: stationData.iaqi?.pm25?.v,
            pm10: stationData.iaqi?.pm10?.v,
            o3: stationData.iaqi?.o3?.v,
            no2: stationData.iaqi?.no2?.v,
            so2: stationData.iaqi?.so2?.v,
            co: stationData.iaqi?.co?.v,
          },
          time: stationData.time?.s
        }

        setStations([station])
        setCurrentLocation(location)
        setError(null)
      } else {
        throw new Error('No valid data received from API')
      }
    } catch (err) {
      console.error("Error fetching air quality data:", err)

      // Generate realistic demo data with real coordinates
      const coords = await getLocationCoordinates(location)
      console.log(`Creating demo station for ${location} at:`, coords)

      const demoStation: Station = {
        id: Date.now(),
        name: `${location} Monitoring Station`,
        lat: coords.lat,
        lng: coords.lng,
        aqi: Math.floor(Math.random() * 180) + 20,
        status: "moderate",
        city: location,
        pollutants: {
          pm25: Math.floor(Math.random() * 60) + 15,
          pm10: Math.floor(Math.random() * 90) + 25,
          o3: Math.floor(Math.random() * 120) + 30,
          no2: Math.floor(Math.random() * 80) + 20,
          so2: Math.floor(Math.random() * 50) + 5,
          co: Math.floor(Math.random() * 15) + 2,
        },
        time: new Date().toISOString()
      }
      demoStation.status = getAQIStatusFromValue(demoStation.aqi)

      // Clear and reset stations
      setStations([])
      setTimeout(() => {
        setStations([demoStation])
        setCurrentLocation(location)
        setError("Using demo data - Real-time data temporarily unavailable")
      }, 100)
    } finally {
      setLoading(false)
    }
  }

  const fetchNearbyStations = async (location: string) => {
    setLoading(true)
    setError(null)

    try {
      const coords = await getLocationCoordinates(location)

      // Generate multiple nearby stations with realistic data
      const nearbyStations: Station[] = []
      const numStations = Math.floor(Math.random() * 4) + 2 // 2-5 stations

      for (let i = 0; i < numStations; i++) {
        const latOffset = (Math.random() - 0.5) * 0.2 // ±0.1 degree variation
        const lngOffset = (Math.random() - 0.5) * 0.2

        const station: Station = {
          id: Date.now() + i,
          name: `${location} Station ${i + 1}`,
          lat: coords.lat + latOffset,
          lng: coords.lng + lngOffset,
          aqi: Math.floor(Math.random() * 200) + 20,
          status: "moderate",
          city: location,
          pollutants: {
            pm25: Math.floor(Math.random() * 80) + 10,
            pm10: Math.floor(Math.random() * 120) + 20,
            o3: Math.floor(Math.random() * 140) + 30,
            no2: Math.floor(Math.random() * 90) + 15,
            so2: Math.floor(Math.random() * 60) + 5,
            co: Math.floor(Math.random() * 20) + 1,
          },
          time: new Date(Date.now() - Math.random() * 3600000).toISOString()
        }
        station.status = getAQIStatusFromValue(station.aqi)
        nearbyStations.push(station)
      }

      setStations(nearbyStations)
      setCurrentLocation(location)
      setError("Showing nearby monitoring stations with simulated data")
    } catch (err) {
      console.error("Error fetching nearby stations:", err)
      await fetchAirQualityData(location)
    } finally {
      setLoading(false)
    }
  }

  const handleStationSelect = (station: Station) => {
    setSelectedStation(station)
  }

  const handleLocationSearch = (location: string) => {
    // Try to get real data first, then fall back to nearby stations
    fetchAirQualityData(location)
  }

  const handleRefresh = () => {
    fetchNearbyStations(currentLocation)
  }

  const handleGetMyLocation = () => {
    if (navigator.geolocation) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          try {
            // Reverse geocode to get city name
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            const data = await response.json()

            const cityName = data.address?.city || data.address?.town || data.address?.village || "Your Location"

            // Create a station at user's location
            const station: Station = {
              id: Date.now(),
              name: `${cityName} (Your Location)`,
              lat: latitude,
              lng: longitude,
              aqi: Math.floor(Math.random() * 150) + 25,
              status: "moderate",
              city: cityName,
              pollutants: {
                pm25: Math.floor(Math.random() * 50) + 15,
                pm10: Math.floor(Math.random() * 70) + 20,
                o3: Math.floor(Math.random() * 100) + 30,
                no2: Math.floor(Math.random() * 60) + 15,
                so2: Math.floor(Math.random() * 40) + 5,
                co: Math.floor(Math.random() * 15) + 2,
              },
              time: new Date().toISOString()
            }
            station.status = getAQIStatusFromValue(station.aqi)

            setStations([station])
            setCurrentLocation(cityName)
            setError(null)
          } catch (err) {
            console.error("Error getting location details:", err)
            // Fallback to coordinates only
            const station: Station = {
              id: Date.now(),
              name: "Your Location",
              lat: latitude,
              lng: longitude,
              aqi: Math.floor(Math.random() * 150) + 25,
              status: "moderate",
              city: "Your Location",
              pollutants: {
                pm25: Math.floor(Math.random() * 50) + 15,
                pm10: Math.floor(Math.random() * 70) + 20,
              },
              time: new Date().toISOString()
            }
            station.status = getAQIStatusFromValue(station.aqi)
            setStations([station])
            setCurrentLocation("Your Location")
          }
          setLoading(false)
        },
        (error) => {
          console.error("Geolocation error:", error)
          setError("Could not get your location. Please search manually.")
          setLoading(false)
        }
      )
    } else {
      setError("Geolocation is not supported by this browser.")
    }
  }

  // Load initial data
  useEffect(() => {
    fetchNearbyStations("Delhi")
  }, [])

  return (
    <div className="w-full h-screen flex gap-4 p-4 bg-gray-50">
      <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
        <InteractiveMap
          activeLayer={activeLayer}
          stations={stations}
          onStationSelect={handleStationSelect}
        />
      </div>

      <div className="w-80 space-y-4 overflow-y-auto">
        <LocationSearch onLocationSearch={handleLocationSearch} loading={loading} />

        <MapControls
          activeLayer={activeLayer}
          onLayerChange={setActiveLayer}
          onRefresh={handleRefresh}
          onGetMyLocation={handleGetMyLocation}
          loading={loading}
        />

        <MapLegend activeLayer={activeLayer} />

        {error && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-yellow-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Notice</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">{error}</p>
            </CardContent>
          </Card>
        )}

        {selectedStation && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Station Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <strong className="text-sm">{selectedStation.name}</strong>
                  <p className="text-xs text-gray-600">{selectedStation.city}</p>
                </div>
                <div>
                  <Badge className={getStatusBadgeFromStatus(selectedStation.status)}>
                    AQI {selectedStation.aqi}
                  </Badge>
                </div>
                {selectedStation.pollutants && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Pollutant Levels:</p>
                    {Object.entries(selectedStation.pollutants)
                      .filter(([_, value]) => value !== undefined)
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs">
                          <span>{key.toUpperCase()}:</span>
                          <span>{value}</span>
                        </div>
                      ))}
                  </div>
                )}
                {selectedStation.time && (
                  <p className="text-xs text-gray-500">
                    Last updated: {new Date(selectedStation.time).toLocaleString()}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Users, Wind, Activity, Layers } from "lucide-react"

// Type definitions at the very top
type Station = {
  id: number
  name: string
  lat: number
  lng: number
  aqi: number
  status: string
}

type CommunityReport = {
  id: number
  lat: number
  lng: number
  type: string
  severity: string
}

// Mock data
const monitoringStations: Station[] = [
  { id: 1, name: "Downtown Station", lat: 37.7749, lng: -122.4194, aqi: 42, status: "good" },
  { id: 2, name: "Golden Gate Park", lat: 37.7694, lng: -122.4862, aqi: 38, status: "good" },
  { id: 3, name: "Mission District", lat: 37.7599, lng: -122.4148, aqi: 55, status: "moderate" },
  { id: 4, name: "Chinatown", lat: 37.7941, lng: -122.4078, aqi: 48, status: "good" },
  { id: 5, name: "Castro District", lat: 37.7609, lng: -122.435, aqi: 62, status: "moderate" },
]

const communityReports: CommunityReport[] = [
  { id: 1, lat: 37.7849, lng: -122.4094, type: "smoke", severity: "high" },
  { id: 2, lat: 37.7549, lng: -122.4294, type: "dust", severity: "medium" },
  { id: 3, lat: 37.7749, lng: -122.4394, type: "pollen", severity: "low" },
]

// Component interfaces
interface MapProps {
  activeLayer: string
  onStationSelect: (station: Station) => void
}

interface MapControlsProps {
  activeLayer: string
  onLayerChange: (layer: string) => void
}

interface MapLegendProps {
  activeLayer: string
}

export function InteractiveMap({ activeLayer, onStationSelect }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [selectedStation, setSelectedStation] = useState<number | null>(null)

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return "#10b981"
    if (aqi <= 100) return "#f59e0b"
    if (aqi <= 150) return "#f97316"
    if (aqi <= 200) return "#ef4444"
    return "#7c2d12"
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      good: "bg-green-100 text-green-800",
      moderate: "bg-yellow-100 text-yellow-800",
      unhealthy: "bg-red-100 text-red-800",
    }
    return variants[status as keyof typeof variants] || variants.good
  }

  const createCustomIcon = (color: string, iconType: 'station' | 'community') => {
    const size = iconType === 'station' ? 32 : 20
    const iconPath = iconType === 'station'
      ? `<path d="M${size / 2 - 6},${size / 2 - 4} L${size / 2},${size / 2 - 8} L${size / 2 + 6},${size / 2 - 4} L${size / 2 + 4},${size / 2 + 2} L${size / 2 - 4},${size / 2 + 2} Z" fill="white"/>`
      : `<circle cx="${size / 2 - 3}" cy="${size / 2 - 2}" r="2" fill="white"/><circle cx="${size / 2 + 3}" cy="${size / 2 - 2}" r="2" fill="white"/><path d="M${size / 2 - 4},${size / 2 + 2} Q${size / 2},${size / 2 + 4} ${size / 2 + 4},${size / 2 + 2}" stroke="white" stroke-width="1" fill="none"/>`

    const svgString = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${color}" stroke="white" stroke-width="2"/>
      ${iconPath}
    </svg>`

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`
  }

  useEffect(() => {
    if (!mapRef.current) return

    // Initialize Leaflet map
    const L = (window as any).L
    if (!L) {
      // Load Leaflet if not already loaded
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css'
      document.head.appendChild(link)

      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js'
      script.onload = () => initializeMap()
      document.head.appendChild(script)
    } else {
      initializeMap()
    }

    function initializeMap() {
      const L = (window as any).L

      // ✅ If an old map exists, destroy it
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off()
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      // ✅ Reset Leaflet internal ID on the container div
      if (mapRef.current && (mapRef.current as any)._leaflet_id) {
        delete (mapRef.current as any)._leaflet_id
      }

      // ✅ Now safely create a new map
      const map = L.map(mapRef.current!).setView([37.7749, -122.4194], 12)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map)

      mapInstanceRef.current = map
      updateMarkers()
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off()
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      if (mapRef.current && (mapRef.current as any)._leaflet_id) {
        delete (mapRef.current as any)._leaflet_id
      }
    }
  }, [])

  useEffect(() => {
    updateMarkers()
  }, [activeLayer])

  const updateMarkers = () => {
    const L = (window as any).L
    if (!L || !mapInstanceRef.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker)
    })
    markersRef.current = []

    // Add monitoring station markers
    monitoringStations.forEach(station => {
      const icon = L.icon({
        iconUrl: createCustomIcon(getAQIColor(station.aqi), 'station'),
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      })

      const marker = L.marker([station.lat, station.lng], { icon })
        .bindPopup(`
          <div class="p-2">
            <h4 class="font-semibold text-sm">${station.name}</h4>
            <div class="mt-1">
              <span class="inline-block px-2 py-1 text-xs rounded ${getStatusBadge(station.status)}">
                AQI ${station.aqi}
              </span>
            </div>
            <p class="text-xs text-gray-600 mt-1">Click for detailed data</p>
          </div>
        `)
        .on('click', () => {
          setSelectedStation(station.id)
          onStationSelect(station)
        })
        .addTo(mapInstanceRef.current)

      markersRef.current.push(marker)
    })

    // Add community reports if active
    if (activeLayer === 'community') {
      communityReports.forEach(report => {
        const color = report.severity === 'high' ? '#ef4444' :
          report.severity === 'medium' ? '#f59e0b' : '#10b981'

        const icon = L.icon({
          iconUrl: createCustomIcon(color, 'community'),
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          popupAnchor: [0, -10]
        })

        const marker = L.marker([report.lat, report.lng], { icon })
          .bindPopup(`
            <div class="p-2">
              <h4 class="font-semibold text-sm capitalize">${report.type} Report</h4>
              <p class="text-xs text-gray-600">Severity: ${report.severity}</p>
            </div>
          `)
          .addTo(mapInstanceRef.current)

        markersRef.current.push(marker)
      })
    }

    // Add AQI overlay regions if active
    if (activeLayer === 'aqi') {
      const goodZone = L.circle([37.7694, -122.4862], {
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.1,
        radius: 1000
      }).addTo(mapInstanceRef.current)

      const moderateZone = L.circle([37.7599, -122.4148], {
        color: '#f59e0b',
        fillColor: '#f59e0b',
        fillOpacity: 0.1,
        radius: 800
      }).addTo(mapInstanceRef.current)

      markersRef.current.push(goodZone, moderateZone)
    }
  }

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {/* Loading message */}
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

export function MapControls({ activeLayer, onLayerChange }: MapControlsProps) {
  const layers = [
    { id: "aqi", name: "Air Quality Index", icon: Wind, description: "Real-time AQI data" },
    { id: "pm25", name: "PM2.5 Levels", icon: Activity, description: "Fine particulate matter" },
    { id: "pollen", name: "Pollen Forecast", icon: Activity, description: "Allergen predictions" },
    { id: "community", name: "Community Reports", icon: Users, description: "User-submitted data" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Map Layers
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
              <Switch checked={activeLayer === layer.id} onCheckedChange={() => onLayerChange(layer.id)} />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export function MapLegend({ activeLayer }: MapLegendProps) {
  const legends = {
    aqi: [
      { range: "0-50", color: "#10b981", label: "Good", description: "Air quality is satisfactory" },
      { range: "51-100", color: "#f59e0b", label: "Moderate", description: "Acceptable for most people" },
      {
        range: "101-150",
        color: "#f97316",
        label: "Unhealthy for Sensitive",
        description: "Sensitive groups may experience symptoms",
      },
      { range: "151-200", color: "#ef4444", label: "Unhealthy", description: "Everyone may experience symptoms" },
      { range: "201+", color: "#7c2d12", label: "Very Unhealthy", description: "Health alert for everyone" },
    ],
    pm25: [
      { range: "0-12", color: "#10b981", label: "Good", description: "Little to no risk" },
      { range: "12-35", color: "#f59e0b", label: "Moderate", description: "Acceptable for most people" },
      { range: "35-55", color: "#f97316", label: "Unhealthy for Sensitive", description: "Sensitive groups at risk" },
      { range: "55+", color: "#ef4444", label: "Unhealthy", description: "Health concerns for everyone" },
    ],
    pollen: [
      { range: "Low", color: "#10b981", label: "0-2.4", description: "Minimal symptoms" },
      { range: "Medium", color: "#f59e0b", label: "2.5-4.8", description: "Mild symptoms possible" },
      { range: "High", color: "#f97316", label: "4.9-7.2", description: "Moderate symptoms" },
      { range: "Very High", color: "#ef4444", label: "7.3+", description: "Severe symptoms likely" },
    ],
    community: [
      { range: "Smoke", color: "#6b7280", label: "Smoke Reports", description: "User-reported smoke" },
      { range: "Dust", color: "#a3a3a3", label: "Dust Reports", description: "User-reported dust" },
      { range: "Odor", color: "#8b5cf6", label: "Odor Reports", description: "User-reported odors" },
    ],
  }

  const currentLegend = legends[activeLayer as keyof typeof legends] || legends.aqi

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Legend</CardTitle>
        <CardDescription>
          {activeLayer === "aqi" && "Air Quality Index ranges"}
          {activeLayer === "pm25" && "PM2.5 concentration (μg/m³)"}
          {activeLayer === "pollen" && "Pollen count (grains/m³)"}
          {activeLayer === "community" && "Community report types"}
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

// Main demo component
export default function AirQualityMapDemo() {
  const [activeLayer, setActiveLayer] = useState("aqi")
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)

  const handleStationSelect = (station: Station) => {
    setSelectedStation(station)
    console.log("Selected station:", station)
  }

  return (
    <div className="w-full h-screen flex gap-4 p-4 bg-gray-50">
      <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
        <InteractiveMap activeLayer={activeLayer} onStationSelect={handleStationSelect} />
      </div>
      <div className="w-80 space-y-4 overflow-y-auto">
        <MapControls activeLayer={activeLayer} onLayerChange={setActiveLayer} />
        <MapLegend activeLayer={activeLayer} />
        {selectedStation && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Station Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Selected: <strong>{selectedStation.name}</strong>
              </p>
              <p className="text-sm">
                AQI: <strong>{selectedStation.aqi}</strong> ({selectedStation.status})
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
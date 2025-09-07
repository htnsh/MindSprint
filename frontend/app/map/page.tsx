"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { InteractiveMap } from "@/components/interactive-map"
import { MapControls } from "@/components/map-controls"
import { MapLegend } from "@/components/map-legend"
import { Navigation } from "@/components/navigation"
import { mapAPI, type MapData, type AQIStation } from "@/lib/map-api"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MapPage() {
  const [activeLayer, setActiveLayer] = useState("aqi")
  const [selectedStation, setSelectedStation] = useState<AQIStation | null>(null)
  const [mapData, setMapData] = useState<MapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Fetch map data
  const fetchMapData = async () => {
    try {
      setError(null)
      const data = await mapAPI.getMapData(activeLayer)
      if (data) {
        setMapData(data)
      } else {
        setError('Failed to load map data')
      }
    } catch (err) {
      console.error('Error fetching map data:', err)
      setError('Failed to load map data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Handle layer change
  const handleLayerChange = (layer: string) => {
    setActiveLayer(layer)
    setSelectedStation(null)
    // Fetch new data for the selected layer
    fetchMapData()
  }

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true)
    fetchMapData()
  }

  // Handle station selection
  const handleStationSelect = (station: AQIStation) => {
    setSelectedStation(station)
  }


  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchMapData()
    }
  }, [user, activeLayer])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      fetchMapData()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [user, activeLayer])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading map...</p>
        </div>
      </div>
    )
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Map Controls</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {mapData && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live Data</span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Last updated: {new Date(mapData.last_updated).toLocaleTimeString()}
              </p>
              <p className="text-xs text-green-600">
                {mapData.total_reports} community reports • {mapData.aqi_stations.length} AQI stations
              </p>
            </div>
          )}

          {error && (
            <Card className="mb-4 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-sm text-red-700">{error}</p>
              </CardContent>
            </Card>
          )}

          <MapControls activeLayer={activeLayer} onLayerChange={handleLayerChange} />
          <MapLegend activeLayer={activeLayer} />

          {selectedStation && (
            <Card className="mt-4 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedStation.aqi ? 'AQI Station Details' : 'Pollen Station Details'}
                </CardTitle>
                <CardDescription>
                  {selectedStation.aqi ? 'Real-time air quality data' : 'Real-time pollen data'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Station</span>
                    <span className="text-sm font-medium">{selectedStation.name}</span>
                  </div>
                  
                  {/* AQI Station Data */}
                  {selectedStation.aqi && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">AQI</span>
                        <Badge variant="secondary">{selectedStation.aqi} - {selectedStation.status}</Badge>
                      </div>
                      {selectedStation.pm25 && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">PM2.5</span>
                          <span className="text-sm">{selectedStation.pm25} μg/m³</span>
                        </div>
                      )}
                      {selectedStation.pm10 && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">PM10</span>
                          <span className="text-sm">{selectedStation.pm10} μg/m³</span>
                        </div>
                      )}
                      {selectedStation.o3 && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">O3</span>
                          <span className="text-sm">{selectedStation.o3} μg/m³</span>
                        </div>
                      )}
                      {selectedStation.no2 && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">NO2</span>
                          <span className="text-sm">{selectedStation.no2} μg/m³</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Pollen Station Data */}
                  {(selectedStation as any).tree_pollen !== undefined && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Tree Pollen</span>
                        <Badge variant="outline">{(selectedStation as any).tree_pollen} ({(selectedStation as any).tree_risk})</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Grass Pollen</span>
                        <Badge variant="outline">{(selectedStation as any).grass_pollen} ({(selectedStation as any).grass_risk})</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Weed Pollen</span>
                        <Badge variant="outline">{(selectedStation as any).weed_pollen} ({(selectedStation as any).weed_risk})</Badge>
                      </div>
                    </>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Last Update</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(selectedStation.last_updated).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <InteractiveMap
            activeLayer={activeLayer}
            mapData={mapData}
            onStationSelect={handleStationSelect}
          />
        </div>
      </div>

    </div>
  )
}

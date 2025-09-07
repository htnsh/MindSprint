"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Wind, Users, Activity, Layers } from "lucide-react"

interface MapControlsProps {
  activeLayer: string
  onLayerChange: (layer: string) => void
}

export function MapControls({ activeLayer, onLayerChange }: MapControlsProps) {
  const layers = [
    { id: "aqi", name: "Air Quality Index", icon: Wind, description: "Real-time AQI data" },
    { id: "pm25", name: "PM2.5 Levels", icon: Activity, description: "Fine particulate matter" },
    { id: "pollen", name: "Pollen Forecast", icon: Activity, description: "Allergen predictions" },
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

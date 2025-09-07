"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface MapLegendProps {
  activeLayer: string
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
      { range: "Low", color: "#10b981", label: "Low", description: "Minimal symptoms" },
      { range: "Medium", color: "#f59e0b", label: "Medium", description: "Mild symptoms possible" },
      { range: "High", color: "#f97316", label: "High", description: "Moderate symptoms" },
      { range: "Very High", color: "#ef4444", label: "Very High", description: "Severe symptoms likely" },
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
          {activeLayer === "pollen" && "Pollen risk levels"}
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

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Leaf, Flower, TreePine } from "lucide-react"

export function AllergenTracker({ pollenData }: { pollenData: any }) {
  if (!pollenData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Allergen Levels</CardTitle>
          <CardDescription>Loading pollen data...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const allergenData = [
    { 
      name: "Tree Pollen", 
      level: pollenData.tree_pollen, 
      risk: pollenData.tree_risk, 
      icon: TreePine, 
      color: "text-green-600" 
    },
    { 
      name: "Grass Pollen", 
      level: pollenData.grass_pollen, 
      risk: pollenData.grass_risk, 
      icon: Leaf, 
      color: "text-emerald-600" 
    },
    { 
      name: "Weed Pollen", 
      level: pollenData.weed_pollen, 
      risk: pollenData.weed_risk, 
      icon: Flower, 
      color: "text-yellow-600" 
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allergen Levels</CardTitle>
        <CardDescription>Current pollen and allergen concentrations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {allergenData.map((allergen) => {
          const Icon = allergen.icon
          return (
            <div key={allergen.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${allergen.color}`} />
                  <span className="text-sm font-medium">{allergen.name}</span>
                </div>
                <Badge
                  variant={
                    allergen.risk === "High"
                      ? "destructive"
                      : allergen.risk === "Moderate"
                      ? "default"
                      : "secondary"
                  }
                >
                  {allergen.risk}
                </Badge>
              </div>
              <Progress value={allergen.level} className="h-2" />
              <p className="text-xs text-muted-foreground">{allergen.level} grains/m³</p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

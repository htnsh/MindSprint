"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Leaf, Flower, TreePine } from "lucide-react"

const allergenData = [
  { name: "Tree Pollen", level: 65, icon: TreePine, color: "text-green-600", severity: "High" },
  { name: "Grass Pollen", level: 30, icon: Leaf, color: "text-emerald-600", severity: "Low" },
  { name: "Weed Pollen", level: 45, icon: Flower, color: "text-yellow-600", severity: "Medium" },
]

export function AllergenTracker() {
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
                    allergen.severity === "High"
                      ? "destructive"
                      : allergen.severity === "Medium"
                        ? "default"
                        : "secondary"
                  }
                >
                  {allergen.severity}
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

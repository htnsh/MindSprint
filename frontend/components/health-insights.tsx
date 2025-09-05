"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, Shield, AlertTriangle, CheckCircle } from "lucide-react"

const insights = [
  {
    type: "positive",
    icon: CheckCircle,
    title: "Great Air Quality",
    message: "Perfect conditions for outdoor activities and exercise.",
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950",
  },
  {
    type: "warning",
    icon: AlertTriangle,
    title: "High Tree Pollen",
    message: "Consider taking allergy medication if you're sensitive to tree pollen.",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-950",
  },
  {
    type: "info",
    icon: Shield,
    title: "UV Protection",
    message: "UV index is moderate. Sunscreen recommended for extended outdoor time.",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950",
  },
]

export function HealthInsights() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Personalized Health Insights
        </CardTitle>
        <CardDescription>AI-powered recommendations based on current conditions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = insight.icon
          return (
            <Alert key={index} className={insight.bgColor}>
              <Icon className={`h-4 w-4 ${insight.color}`} />
              <AlertDescription>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{insight.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{insight.message}</p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )
        })}
      </CardContent>
    </Card>
  )
}

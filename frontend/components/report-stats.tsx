"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, MapPin, Clock } from "lucide-react"

export function ReportStats() {
  const stats = [
    {
      title: "Reports Today",
      value: "47",
      change: "+12%",
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      title: "Active Contributors",
      value: "24",
      change: "+3",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Areas Covered",
      value: "8",
      change: "SF Districts",
      icon: MapPin,
      color: "text-purple-600",
    },
    {
      title: "Avg Response Time",
      value: "12m",
      change: "Community",
      icon: Clock,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

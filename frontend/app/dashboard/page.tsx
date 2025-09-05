"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wind, MapPin, Users, Bell, TrendingUp, Activity } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AirQualityChart } from "@/components/air-quality-chart"
import { AllergenTracker } from "@/components/allergen-tracker"
import { HealthInsights } from "@/components/health-insights"
import { LocationSelector } from "@/components/location-selector"
import { AIChatbot } from "@/components/ai-chatbot"
import { Navigation } from "@/components/navigation"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return <div>Loading...</div>
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

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-balance">Your Air Quality Dashboard</h1>
          <p className="text-muted-foreground">Monitor real-time air quality and allergen levels in your area</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Air Quality Index</CardTitle>
              <Wind className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">42</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Good - Safe for outdoor activities
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pollen Level</CardTitle>
              <Activity className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">Medium</div>
              <p className="text-xs text-muted-foreground">Tree pollen: 6.2 grains/m³</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Community Reports</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">12</div>
              <p className="text-xs text-muted-foreground">Reports in your area today</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health Status</CardTitle>
              <Bell className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Good</div>
              <p className="text-xs text-muted-foreground">No active health alerts</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <LocationSelector />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AirQualityChart />
          <AllergenTracker />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HealthInsights />

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your air quality monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/map">
                <Button className="w-full h-14 rounded-lg justify-start bg-transparent border-emerald-600 text-emerald-700 hover:bg-emerald-50 mb-4" variant="outline">
                  <MapPin className="h-4 w-4 mr-2" />
                  View Interactive Map
                </Button>
              </Link>
              <Link href="/community">
                <Button className="w-full h-14 rounded-lg justify-start bg-transparent border-emerald-600 text-emerald-700 hover:bg-emerald-50 mb-4" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Submit Community Report
                </Button>
              </Link>
              <Link href="/notifications">
                <Button className="w-full h-14 rounded-lg justify-start bg-transparent border-emerald-600 text-emerald-700 hover:bg-emerald-50 mb-4" variant="outline">
                  <Bell className="h-4 w-4 mr-2" />
                  Manage Notifications
                </Button>
              </Link>
              <Button className="w-full h-14 rounded-lg justify-start bg-transparent border-emerald-600 text-emerald-700 hover:bg-emerald-50" variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                View Health History
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <AIChatbot />
    </div>
  )
}

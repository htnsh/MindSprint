// "use client"

// import { useAuth } from "@/contexts/auth-context"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Wind, MapPin, Users, Bell, TrendingUp, Activity } from "lucide-react"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { useEffect, useState } from "react"
// import { AirQualityChart } from "@/components/air-quality-chart"
// import { AllergenTracker } from "@/components/allergen-tracker"
// import { HealthInsights } from "@/components/health-insights"
// import { LocationSelector } from "@/components/location-selector"
// import { Navigation } from "@/components/navigation"

// export default function DashboardPage() {
//   const { user, loading } = useAuth()
//   const router = useRouter()

//   const [location, setLocation] = useState("Ahmedabad")
//   // Redirect if not logged in
//   useEffect(() => {
//     if (!loading && !user) {
//       router.push('/')
//     }
//   }, [user, loading, router])

//   // Fetch AQI data when location changes
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await fetch(`http://127.0.0.1:8000/api/aqi/${location}/`)
//         const data = await res.json()
//         setAqiData(data)
//         console.log("Dashboard API Data:", data)
//       } catch (error) {
//         console.error("Error fetching AQI data:", error)
//       }
//     }
//     if (location) {
//       fetchData()
//     }
//   }, [location])

//   const [aqiData, setAqiData] = useState<any>(null)
//   const [chartData, setChartData] = useState<any[]>([])

//   useEffect(() => {
//     if (aqiData) {
//       // push new entry into chartData for trend line
//       setChartData(prev => [
//         ...prev,
//         {
//           time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
//           aqi: aqiData.aqi,
//           pm25: aqiData.pollutants.pm25,
//           pm10: aqiData.pollutants.pm10,
//         }
//       ])
//     }
//   }, [aqiData])


//   if (loading) {
//     return <div>Loading...</div>
//   }
//   if (!user) return null

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
//       <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
//         <div className="container mx-auto px-4 py-4">
//           <Navigation />
//         </div>
//       </header>

//       <main className="container mx-auto px-4 py-8">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold mb-2 text-balance">Your Air Quality Dashboard</h1>
//           <p className="text-muted-foreground">
//             Monitor real-time air quality and allergen levels in your area
//           </p>
//         </div>

//         {/* ✅ Dynamic Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <Card className="border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Air Quality Index</CardTitle>
//               <Wind className="h-4 w-4 text-emerald-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-emerald-600">
//                 {aqiData ? aqiData.aqi : "--"}
//               </div>
//               <p className="text-xs text-muted-foreground flex items-center gap-1">
//                 <TrendingUp className="h-3 w-3" />
//                 {aqiData
//                   ? `Dominant: ${aqiData.dominant_pollutant}`
//                   : "Fetching data..."}
//               </p>
//             </CardContent>
//           </Card>

//           {/* Pollen placeholder (static for now, API later) */}
//           <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Pollen Level</CardTitle>
//               <Activity className="h-4 w-4 text-yellow-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-yellow-600">Medium</div>
//               <p className="text-xs text-muted-foreground">Tree pollen: 6.2 grains/m³</p>
//             </CardContent>
//           </Card>

//           {/* Community Reports (fake for now) */}
//           <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Community Reports</CardTitle>
//               <Users className="h-4 w-4 text-blue-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-blue-600">12</div>
//               <p className="text-xs text-muted-foreground">Reports in your area today</p>
//             </CardContent>
//           </Card>

//           {/* Health Status (simple rule-based) */}
//           <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Health Status</CardTitle>
//               <Bell className="h-4 w-4 text-green-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-green-600">
//                 {aqiData && aqiData.aqi <= 50
//                   ? "Good"
//                   : aqiData && aqiData.aqi <= 100
//                     ? "Moderate"
//                     : aqiData
//                       ? "Unhealthy"
//                       : "--"}
//               </div>
//               <p className="text-xs text-muted-foreground">
//                 {aqiData ? `Updated at ${aqiData.time}` : "No active alerts"}
//               </p>
//             </CardContent>
//           </Card>
//         </div>

//         {/* ✅ Pass setter to LocationSelector */}
//         <div className="mb-8">
//           <LocationSelector location={location} setLocation={setLocation} />
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//           <AirQualityChart data={chartData} />
//           <AllergenTracker />
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <HealthInsights />
//           {/* Quick Actions */}
//           <Card className="hover:shadow-md transition-shadow">
//             <CardHeader>
//               <CardTitle>Quick Actions</CardTitle>
//               <CardDescription>Manage your air quality monitoring</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Link href="/map">
//                 <Button className="w-full h-14 rounded-lg justify-start bg-transparent border-emerald-600 text-emerald-700 hover:bg-emerald-50 mb-4" variant="outline">
//                   <MapPin className="h-4 w-4 mr-2" />
//                   View Interactive Map
//                 </Button>
//               </Link>
//               <Link href="/community">
//                 <Button className="w-full h-14 rounded-lg justify-start bg-transparent border-emerald-600 text-emerald-700 hover:bg-emerald-50 mb-4" variant="outline">
//                   <Users className="h-4 w-4 mr-2" />
//                   Submit Community Report
//                 </Button>
//               </Link>
//               <Link href="/notifications">
//                 <Button className="w-full h-14 rounded-lg justify-start bg-transparent border-emerald-600 text-emerald-700 hover:bg-emerald-50 mb-4" variant="outline">
//                   <Bell className="h-4 w-4 mr-2" />
//                   Manage Notifications
//                 </Button>
//               </Link>
//               <Button className="w-full h-14 rounded-lg justify-start bg-transparent border-emerald-600 text-emerald-700 hover:bg-emerald-50" variant="outline">
//                 <Activity className="h-4 w-4 mr-2" />
//                 View Health History
//               </Button>
//             </CardContent>
//           </Card>
//         </div>
//       </main>
//     </div>
//   )
// }


"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wind, MapPin, Users, Bell, TrendingUp, Activity } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AirQualityChart } from "@/components/air-quality-chart"
import { AllergenTracker } from "@/components/allergen-tracker"
import { HealthInsights } from "@/components/health-insights"
import { LocationSelector } from "@/components/location-selector"
import { Navigation } from "@/components/navigation"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [location, setLocation] = useState("Ahmedabad")
  const [aqiData, setAqiData] = useState<any>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [pollenData, setPollenData] = useState<any>(null)

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Fetch latest AQI for cards
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/aqi/${location}/`)
        const data = await res.json()
        setAqiData(data)
        console.log("Dashboard API Data:", data)
      } catch (error) {
        console.error("Error fetching AQI data:", error)
      }
    }
    if (location) {
      fetchData()
    }
  }, [location])

  // useEffect(() => {
  //   const fetchPollen = async () => {
  //     try {
  //       const res = await fetch(`http://127.0.0.1:8000/api/pollen/${location}/`)
  //       const data = await res.json()
  //       setPollenData(data)
  //       console.log("Pollen API Data:", data)
  //     } catch (error) {
  //       console.error("Error fetching Pollen data:", error)
  //     }
  //   }
  //   if (location) {
  //     fetchPollen()
  //   }
  // }, [location])


  if (loading) {
    return <div>Loading...</div>
  }
  if (!user) return null

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
          <p className="text-muted-foreground">
            Monitor real-time air quality and allergen levels in your area
          </p>
        </div>

        {/* ✅ Dynamic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* AQI Card */}
          <Card className="border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Air Quality Index</CardTitle>
              <Wind className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {aqiData ? aqiData.aqi : "--"}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {aqiData
                  ? `Dominant: ${aqiData.dominant_pollutant}`
                  : "Fetching data..."}
              </p>
            </CardContent>
          </Card>

          {/* ✅ Dynamic Pollen Card */}
          <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pollen Level</CardTitle>
              <Activity className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              {pollenData ? (
                <>
                  {/* Find dominant pollen */}
                  {(() => {
                    const pollenTypes = [
                      { name: "Tree", count: pollenData.tree_pollen, risk: pollenData.tree_risk },
                      { name: "Grass", count: pollenData.grass_pollen, risk: pollenData.grass_risk },
                      { name: "Weed", count: pollenData.weed_pollen, risk: pollenData.weed_risk },
                    ]
                    const dominant = pollenTypes.reduce((max, p) => (p.count > max.count ? p : max), pollenTypes[0])

                    return (
                      <>
                        <div className="text-2xl font-bold text-yellow-600">
                          {dominant.risk}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {dominant.name} pollen: {dominant.count} grains/m³
                        </p>
                      </>
                    )
                  })()}
                </>
              ) : (
                <div className="text-muted-foreground text-sm">Loading...</div>
              )}
            </CardContent>
          </Card>


          {/* Community Reports (fake for now) */}
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

          {/* Health Status (rule-based) */}
          <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health Status</CardTitle>
              <Bell className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {aqiData && aqiData.aqi <= 50
                  ? "Good"
                  : aqiData && aqiData.aqi <= 100
                    ? "Moderate"
                    : aqiData
                      ? "Unhealthy"
                      : "--"}
              </div>
              <p className="text-xs text-muted-foreground">
                {aqiData ? `Updated at ${aqiData.time}` : "No active alerts"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ✅ Pass setter to LocationSelector */}
        <div className="mb-8">
          <LocationSelector location={location} setLocation={setLocation} />
        </div>

        {/* Chart + Allergen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AirQualityChart />
          <AllergenTracker pollenData={pollenData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HealthInsights />

          {/* Quick Actions */}
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
    </div>
  )
}

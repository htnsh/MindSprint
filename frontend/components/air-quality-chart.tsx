"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { time: "6 AM", aqi: 35, pm25: 12, pm10: 18 },
  { time: "9 AM", aqi: 42, pm25: 15, pm10: 22 },
  { time: "12 PM", aqi: 48, pm25: 18, pm10: 25 },
  { time: "3 PM", aqi: 55, pm25: 22, pm10: 30 },
  { time: "6 PM", aqi: 62, pm25: 25, pm10: 35 },
  { time: "9 PM", aqi: 45, pm25: 18, pm10: 28 },
]

export function AirQualityChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>24-Hour Air Quality Trend</CardTitle>
        <CardDescription>Real-time AQI, PM2.5, and PM10 levels</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="aqi" stroke="#10b981" strokeWidth={2} name="AQI" />
            <Line type="monotone" dataKey="pm25" stroke="#f59e0b" strokeWidth={2} name="PM2.5" />
            <Line type="monotone" dataKey="pm10" stroke="#ef4444" strokeWidth={2} name="PM10" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// "use client"

// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// type AirQualityChartProps = {
//   data: { time: string; aqi: number; pm25?: number; pm10?: number }[]
// }

// export function AirQualityChart({ data }: AirQualityChartProps) {
//   if (!data || data.length === 0) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>24-Hour Air Quality Trend</CardTitle>
//           <CardDescription>No data available</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <p className="text-muted-foreground">No air quality data yet. Select a location.</p>
//         </CardContent>
//       </Card>
//     )
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>24-Hour Air Quality Trend</CardTitle>
//         <CardDescription>Real-time AQI, PM2.5, and PM10 levels</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <ResponsiveContainer width="100%" height={300}>
//           <LineChart data={data}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="time" />
//             <YAxis />
//             <Tooltip />
//             <Line type="monotone" dataKey="aqi" stroke="#10b981" strokeWidth={2} name="AQI" />
//             <Line type="monotone" dataKey="pm25" stroke="#f59e0b" strokeWidth={2} name="PM2.5" />
//             <Line type="monotone" dataKey="pm10" stroke="#ef4444" strokeWidth={2} name="PM10" />
//           </LineChart>
//         </ResponsiveContainer>
//       </CardContent>
//     </Card>
//   )
// }

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Search, Navigation } from "lucide-react"

type LocationSelectorProps = {
  location: string
  setLocation: (value: string) => void
}

export function LocationSelector({ location, setLocation }: LocationSelectorProps) {
  const [locationInput, setLocationInput] = useState(location)
  const [isEditing, setIsEditing] = useState(false)

  const handleLocationUpdate = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/aqi/${locationInput}/`)
      const data = await res.json()

      console.log("Fetched Data:", data)

      setLocation(locationInput) // ✅ Update parent state
      alert(`AQI for ${data.city} is ${data.aqi}`)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
    setIsEditing(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-emerald-600" />
          Your Location
        </CardTitle>
        <CardDescription>Air quality data for your area</CardDescription>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-3">
            <Input
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="Enter city or address"
            />
            <div className="flex gap-2">
              <Button onClick={handleLocationUpdate} size="sm" className="flex-1">
                <Search className="h-4 w-4 mr-2" />
                Update
              </Button>
              <Button variant="outline" size="sm">
                <Navigation className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{location}</p>
              <p className="text-sm text-muted-foreground">Last updated: just now</p>
            </div>
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              Change
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

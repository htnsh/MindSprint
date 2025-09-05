"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Search, Navigation } from "lucide-react"

export function LocationSelector() {
  const [location, setLocation] = useState("San Francisco, CA")
  const [isEditing, setIsEditing] = useState(false)

  const handleLocationUpdate = () => {
    // In a real app, this would update the user's location and fetch new data
    setIsEditing(false)
  }

  const getCurrentLocation = () => {
    // In a real app, this would use the Geolocation API
    setLocation("Current Location")
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
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Enter city or address" />
            <div className="flex gap-2">
              <Button onClick={handleLocationUpdate} size="sm" className="flex-1">
                <Search className="h-4 w-4 mr-2" />
                Update
              </Button>
              <Button onClick={getCurrentLocation} variant="outline" size="sm">
                <Navigation className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{location}</p>
              <p className="text-sm text-muted-foreground">Last updated: 2 minutes ago</p>
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

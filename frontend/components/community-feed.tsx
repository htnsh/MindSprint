"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThumbsUp, ThumbsDown, MapPin, Clock, Filter } from "lucide-react"

// Mock data for community reports
const mockReports = [
  {
    id: 1,
    user: "Sarah M.",
    avatar: "SM",
    type: "smoke",
    severity: "high",
    location: "Downtown SF",
    description: "Heavy smoke visible from nearby construction site. Strong burning smell affecting visibility.",
    timestamp: "15 minutes ago",
    votes: { up: 12, down: 1 },
    verified: true,
  },
  {
    id: 2,
    user: "Mike R.",
    avatar: "MR",
    type: "pollen",
    severity: "medium",
    location: "Golden Gate Park",
    description: "Noticed increased pollen levels during morning jog. Tree pollen seems particularly high today.",
    timestamp: "1 hour ago",
    votes: { up: 8, down: 0 },
    verified: false,
  },
  {
    id: 3,
    user: "Lisa K.",
    avatar: "LK",
    type: "dust",
    severity: "low",
    location: "Mission District",
    description: "Light dust in the air, possibly from construction work on 16th Street.",
    timestamp: "2 hours ago",
    votes: { up: 5, down: 2 },
    verified: true,
  },
  {
    id: 4,
    user: "David L.",
    avatar: "DL",
    type: "odor",
    severity: "severe",
    location: "SOMA",
    description: "Strong chemical odor near the industrial area. Multiple people reporting respiratory irritation.",
    timestamp: "3 hours ago",
    votes: { up: 23, down: 0 },
    verified: true,
  },
]

export function CommunityFeed() {
  const [filter, setFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recent")

  const getTypeColor = (type: string) => {
    const colors = {
      smoke: "bg-gray-100 text-gray-800",
      dust: "bg-yellow-100 text-yellow-800",
      odor: "bg-purple-100 text-purple-800",
      pollen: "bg-green-100 text-green-800",
      smog: "bg-orange-100 text-orange-800",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      severe: "bg-red-100 text-red-800",
    }
    return colors[severity as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const filteredReports = mockReports.filter((report) => {
    if (filter === "all") return true
    return report.type === filter
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="smoke">Smoke/Fire</SelectItem>
                  <SelectItem value="dust">Dust Storm</SelectItem>
                  <SelectItem value="odor">Chemical Odor</SelectItem>
                  <SelectItem value="pollen">High Pollen</SelectItem>
                  <SelectItem value="smog">Smog/Haze</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="votes">Most Voted</SelectItem>
                  <SelectItem value="severity">Highest Severity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Feed */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{report.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{report.user}</span>
                      {report.verified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {report.timestamp}
                      <MapPin className="h-3 w-3 ml-2" />
                      {report.location}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={getTypeColor(report.type)}>{report.type}</Badge>
                  <Badge className={getSeverityColor(report.severity)}>{report.severity}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{report.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {report.votes.up}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    {report.votes.down}
                  </Button>
                </div>
                <Button variant="outline" size="sm">
                  View on Map
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

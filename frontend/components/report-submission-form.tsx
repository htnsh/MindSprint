"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Camera, Send } from "lucide-react"

interface ReportSubmissionFormProps {
  onSubmitSuccess: () => void
}

export function ReportSubmissionForm({ onSubmitSuccess }: ReportSubmissionFormProps) {
  const [formData, setFormData] = useState({
    type: "",
    severity: "",
    location: "",
    description: "",
    photo: null as File | null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const reportTypes = [
    { value: "smoke", label: "Smoke/Fire" },
    { value: "dust", label: "Dust Storm" },
    { value: "odor", label: "Chemical Odor" },
    { value: "pollen", label: "High Pollen" },
    { value: "smog", label: "Smog/Haze" },
    { value: "other", label: "Other" },
  ]

  const severityLevels = [
    { value: "low", label: "Low - Barely noticeable" },
    { value: "medium", label: "Medium - Noticeable discomfort" },
    { value: "high", label: "High - Significant impact" },
    { value: "severe", label: "Severe - Health concerns" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setSuccess(true)
    setIsSubmitting(false)

    setTimeout(() => {
      onSubmitSuccess()
      setSuccess(false)
      setFormData({
        type: "",
        severity: "",
        location: "",
        description: "",
        photo: null,
      })
    }, 2000)
  }

  const getCurrentLocation = () => {
    // In a real app, this would use the Geolocation API
    setFormData((prev) => ({ ...prev, location: "Current Location (37.7749, -122.4194)" }))
  }

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              Thank you! Your report has been submitted successfully and will help the community stay informed about
              local air quality conditions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Air Quality Report</CardTitle>
        <CardDescription>Help your community by reporting current air quality conditions in your area</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Report Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity Level</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, severity: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  {severityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="flex gap-2">
              <Input
                id="location"
                placeholder="Enter location or address"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={getCurrentLocation}>
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what you're observing (e.g., visibility, smell, symptoms experienced)"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Photo (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(e) => setFormData((prev) => ({ ...prev, photo: e.target.files?.[0] || null }))}
                className="flex-1"
              />
              <Camera className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Adding a photo helps verify your report and provides visual context
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={isSubmitting || !formData.type || !formData.severity || !formData.location}
          >
            {isSubmitting ? (
              "Submitting Report..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Report
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Bell, Settings, AlertTriangle, CheckCircle, Info } from "lucide-react"
import Link from "next/link"
import { AIChatbot } from "@/components/ai-chatbot"

interface Notification {
  id: string
  title: string
  message: string
  type: "alert" | "info" | "success"
  timestamp: Date
  read: boolean
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Air Quality Alert",
      message:
        "AQI has reached 105 (Unhealthy for Sensitive Groups) in your area. Consider limiting outdoor activities.",
      type: "alert",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
    },
    {
      id: "2",
      title: "Pollen Forecast",
      message: "High tree pollen expected tomorrow (8.5 grains/m³). Take precautions if you have allergies.",
      type: "info",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
    },
    {
      id: "3",
      title: "Air Quality Improved",
      message: "Great news! AQI has dropped to 42 (Good) in your area. Perfect time for outdoor activities.",
      type: "success",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: true,
    },
  ])

  const [preferences, setPreferences] = useState({
    airQualityAlerts: true,
    pollenAlerts: true,
    communityReports: true,
    dailySummary: true,
    emailNotifications: false,
    pushNotifications: true,
  })

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Bell className="h-8 w-8 text-emerald-600" />
              <span className="text-xl font-bold">Notifications</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && <Badge variant="destructive">{unreadCount} unread</Badge>}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Notifications & Alerts</h1>
          <p className="text-muted-foreground">Stay informed about air quality changes and health recommendations</p>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Recent Notifications</h2>
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-colors ${
                    !notification.read ? "border-l-4 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20" : ""
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-medium ${!notification.read ? "font-semibold" : ""}`}>
                            {notification.title}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {notification.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                      </div>
                      {!notification.read && <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Air Quality Alerts</label>
                      <p className="text-xs text-muted-foreground">Get notified when AQI changes significantly</p>
                    </div>
                    <Switch
                      checked={preferences.airQualityAlerts}
                      onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, airQualityAlerts: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Pollen Alerts</label>
                      <p className="text-xs text-muted-foreground">Receive pollen forecasts and allergy warnings</p>
                    </div>
                    <Switch
                      checked={preferences.pollenAlerts}
                      onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, pollenAlerts: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Community Reports</label>
                      <p className="text-xs text-muted-foreground">Get notified about reports in your area</p>
                    </div>
                    <Switch
                      checked={preferences.communityReports}
                      onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, communityReports: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Daily Summary</label>
                      <p className="text-xs text-muted-foreground">Receive daily air quality summaries</p>
                    </div>
                    <Switch
                      checked={preferences.dailySummary}
                      onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, dailySummary: checked }))}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-4">Delivery Methods</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium">Push Notifications</label>
                        <p className="text-xs text-muted-foreground">Receive notifications in your browser</p>
                      </div>
                      <Switch
                        checked={preferences.pushNotifications}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({ ...prev, pushNotifications: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium">Email Notifications</label>
                        <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={preferences.emailNotifications}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({ ...prev, emailNotifications: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <AIChatbot />
    </div>
  )
}

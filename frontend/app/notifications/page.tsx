"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Bell, Settings, AlertTriangle, CheckCircle, Info } from "lucide-react"
import Link from "next/link"
import { 
  getMockNotifications, 
  markNotificationRead, 
  markAllNotificationsRead,
  getNotificationPreferences,
  updateNotificationPreferences,
  generateAirQualityAlert,
  generateDailySummary,
  type Notification,
  type NotificationPreference
} from "@/lib/notifications-api"

export default function NotificationsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreference>({
    air_quality_alerts: true,
    pollen_alerts: true,
    community_reports: true,
    daily_summary: true,
    email_notifications: false,
    push_notifications: true,
  })
  const [loadingNotifications, setLoadingNotifications] = useState(true)
  const [loadingPreferences, setLoadingPreferences] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Fetch notifications and preferences when component mounts
  useEffect(() => {
    if (user) {
      fetchNotifications()
      fetchPreferences()
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true)
      const response = await getMockNotifications()
      if (response.success) {
        setNotifications(response.data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoadingNotifications(false)
    }
  }

  const fetchPreferences = async () => {
    try {
      setLoadingPreferences(true)
      const response = await getNotificationPreferences()
      if (response.success) {
        setPreferences(response.data)
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
    } finally {
      setLoadingPreferences(false)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      await markNotificationRead(id)
      setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsRead()
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const handlePreferenceChange = async (key: keyof NotificationPreference, value: boolean) => {
    try {
      const updatedPreferences = { ...preferences, [key]: value }
      setPreferences(updatedPreferences)
      await updateNotificationPreferences({ [key]: value })
    } catch (error) {
      console.error('Error updating preferences:', error)
      // Revert on error
      setPreferences(preferences)
    }
  }

  const generateAlert = async () => {
    try {
      const response = await generateAirQualityAlert('Delhi')
      if (response.success) {
        setNotifications(prev => [response.notification, ...prev])
      }
    } catch (error) {
      console.error('Error generating alert:', error)
    }
  }

  const generateSummary = async () => {
    try {
      const response = await generateDailySummary('Delhi')
      if (response.success) {
        setNotifications(prev => [response.notification, ...prev])
      }
    } catch (error) {
      console.error('Error generating summary:', error)
    }
  }

  const getNotificationIcon = (type: string, priority: string) => {
    if (priority === 'urgent' || type === 'air_quality') {
      return <AlertTriangle className="h-5 w-5 text-red-500" />
    } else if (type === 'pollen') {
      return <Info className="h-5 w-5 text-yellow-500" />
    } else {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null // Will redirect
  }

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
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={generateAlert}>
                  Generate Alert
                </Button>
                <Button variant="outline" size="sm" onClick={generateSummary}>
                  Generate Summary
                </Button>
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={markAllAsRead}>
                    Mark all as read
                  </Button>
                )}
              </div>
            </div>

            {loadingNotifications ? (
              <div className="text-center py-8">Loading notifications...</div>
            ) : (
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No notifications yet</h3>
                      <p className="text-muted-foreground">You'll receive alerts about air quality and pollen here.</p>
                    </CardContent>
                  </Card>
                ) : (
                  notifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`cursor-pointer transition-colors ${
                        !notification.read ? "border-l-4 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20" : ""
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(notification.notification_type, notification.priority)}
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h3 className={`font-medium ${!notification.read ? "font-semibold" : ""}`}>
                                {notification.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                <Badge variant={notification.priority === 'urgent' ? 'destructive' : 'secondary'}>
                                  {notification.priority}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(notification.created_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                            {notification.data && (
                              <div className="text-xs text-muted-foreground">
                                {notification.data.aqi && `AQI: ${notification.data.aqi}`}
                                {notification.data.location && ` • Location: ${notification.data.location}`}
                              </div>
                            )}
                          </div>
                          {!notification.read && <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingPreferences ? (
                  <div className="text-center py-8">Loading preferences...</div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium">Air Quality Alerts</label>
                          <p className="text-xs text-muted-foreground">Get notified when AQI changes significantly</p>
                        </div>
                        <Switch
                          checked={preferences.air_quality_alerts}
                          onCheckedChange={(checked) => handlePreferenceChange('air_quality_alerts', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium">Pollen Alerts</label>
                          <p className="text-xs text-muted-foreground">Receive pollen forecasts and allergy warnings</p>
                        </div>
                        <Switch
                          checked={preferences.pollen_alerts}
                          onCheckedChange={(checked) => handlePreferenceChange('pollen_alerts', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium">Community Reports</label>
                          <p className="text-xs text-muted-foreground">Get notified about reports in your area</p>
                        </div>
                        <Switch
                          checked={preferences.community_reports}
                          onCheckedChange={(checked) => handlePreferenceChange('community_reports', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium">Daily Summary</label>
                          <p className="text-xs text-muted-foreground">Receive daily air quality summaries</p>
                        </div>
                        <Switch
                          checked={preferences.daily_summary}
                          onCheckedChange={(checked) => handlePreferenceChange('daily_summary', checked)}
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
                            checked={preferences.push_notifications}
                            onCheckedChange={(checked) => handlePreferenceChange('push_notifications', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <label className="text-sm font-medium">Email Notifications</label>
                            <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                          </div>
                          <Switch
                            checked={preferences.email_notifications}
                            onCheckedChange={(checked) => handlePreferenceChange('email_notifications', checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

    </div>
  )
}

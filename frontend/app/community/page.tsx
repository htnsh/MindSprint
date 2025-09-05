"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Users } from "lucide-react"
import { ReportSubmissionForm } from "@/components/report-submission-form"
import { CommunityFeed } from "@/components/community-feed"
import { ReportStats } from "@/components/report-stats"
import { AIChatbot } from "@/components/ai-chatbot"
import { Navigation } from "@/components/navigation"

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("feed")

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <Navigation />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-balance">Community Air Quality Reports</h1>
          <p className="text-muted-foreground">Share and discover real-time air quality conditions in your area</p>
        </div>

        <ReportStats />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="feed" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Community Feed
            </TabsTrigger>
            <TabsTrigger value="submit" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Submit Report
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-6">
            <CommunityFeed />
          </TabsContent>

          <TabsContent value="submit" className="mt-6">
            <ReportSubmissionForm onSubmitSuccess={() => setActiveTab("feed")} />
          </TabsContent>
        </Tabs>
      </main>

      <AIChatbot />
    </div>
  )
}

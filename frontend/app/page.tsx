import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wind, MapPin, Users, Bot, Bell, Shield } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wind className="h-8 w-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-foreground">BreatheBetter</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="border-border bg-transparent hover:bg-card/50" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <Badge variant="secondary" className="mb-4 border border-emerald-200 bg-emerald-100 text-emerald-700">
            Hyperlocal Air Quality Monitoring
          </Badge>
          <h2 className="text-5xl font-bold text-foreground mb-6 text-balance">
            Breathe Easier with Real-Time Air Quality Intelligence
          </h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Get hyperlocal air quality data, allergen predictions, and personalized health recommendations powered by AI
            and community insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              asChild
            >
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">Everything You Need for Healthier Air</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive air quality monitoring with community-driven insights and AI-powered recommendations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="glass-strong hover:shadow-glow transition-all duration-300 hover:scale-105 border-border/60">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-chart-1/20">
                    <Wind className="h-6 w-6 text-chart-1" />
                  </div>
                  <CardTitle className="text-card-foreground">Real-Time AQI</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Monitor air quality index and pollutant levels in your exact location with color-coded severity
                  indicators.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-strong hover:shadow-glow transition-all duration-300 hover:scale-105 border-border/60">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-secondary/20">
                    <MapPin className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="text-card-foreground">Hyperlocal Mapping</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Interactive maps showing air quality and allergen levels at street-level precision with community data
                  points.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-strong hover:shadow-glow transition-all duration-300 hover:scale-105 border-border/60">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-accent/20">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-card-foreground">Community Reports</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Share and view symptom reports from your community to get real human insights on air quality
                  conditions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-strong hover:shadow-glow transition-all duration-300 hover:scale-105 border-border/60">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-secondary/20">
                    <Bot className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="text-card-foreground">AI Health Assistant</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Ask natural questions like "Is it safe to jog today?" and get personalized recommendations based on
                  current conditions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-strong hover:shadow-glow transition-all duration-300 hover:scale-105 border-border/60">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-chart-2/20">
                    <Bell className="h-6 w-6 text-chart-2" />
                  </div>
                  <CardTitle className="text-card-foreground">Smart Alerts</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Receive personalized notifications for high-risk conditions based on your health profile and
                  preferences.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-strong hover:shadow-glow transition-all duration-300 hover:scale-105 border-border/60">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-card-foreground">Health Predictions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  24-hour forecasts for air quality and allergen levels using advanced machine learning algorithms.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto text-center max-w-3xl relative z-10">
          <div className="p-12 rounded-2xl border border-emerald-200 bg-white/70 dark:bg-gray-900/70">
            <h3 className="text-4xl font-bold text-foreground mb-6">Ready to Breathe Better?</h3>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of users who trust BreatheBetter for their daily air quality decisions. Start monitoring
              your local air quality today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                asChild
              >
                <Link href="/signup">Create Free Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Wind className="h-6 w-6 text-accent" />
                <span className="font-bold text-foreground">BreatheBetter</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Hyperlocal air quality monitoring for healthier communities.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/features" className="hover:text-primary transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-primary transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="hover:text-primary transition-colors">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-primary transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-primary transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-primary transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/help" className="hover:text-primary transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-primary transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-primary transition-colors">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 BreatheBetter. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

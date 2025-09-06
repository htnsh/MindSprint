"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wind, LayoutDashboard, Map, Users, Bell, MessageCircle, Menu, X, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Map", href: "/map", icon: Map },
    { name: "Community", href: "/community", icon: Users },
    { name: "AI Chat", href: "/chatbot", icon: MessageCircle },
    { name: "Notifications", href: "/notifications", icon: Bell, badge: 2 },
  ]

  const isActive = (href: string) => pathname === href

  if (!user) return null

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-between w-full">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Wind className="h-8 w-8 text-emerald-600" />
            <span className="text-xl font-bold">BreatheBetter</span>
          </Link>

          <div className="flex items-center gap-3">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={`flex items-center gap-2 ${
                    isActive(item.href) 
                      ? "!bg-emerald-600 hover:!bg-emerald-700 !text-white" 
                      : "hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                  {item.badge && (
                    <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Welcome, {user.first_name || user.username || user.email}
          </span>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden flex items-center justify-between w-full">
        <Link href="/" className="flex items-center gap-2">
          <Wind className="h-8 w-8 text-emerald-600" />
          <span className="text-xl font-bold">BreatheBetter</span>
        </Link>

        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-b shadow-lg z-50">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-2 ${
                    isActive(item.href) 
                      ? "!bg-emerald-600 hover:!bg-emerald-700 !text-white" 
                      : "hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                  {item.badge && (
                    <Badge variant="destructive" className="ml-auto h-5 w-5 p-0 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            ))}
            <div className="border-t pt-4 space-y-2">
              <div className="flex items-center justify-between px-3">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.first_name || user.username || user.email}
                </span>
              </div>
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent" onClick={logout}>
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

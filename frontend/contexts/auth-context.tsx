"use client"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type User = { id: string; email: string; first_name: string; last_name: string }

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, password: string, first_name: string, last_name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)  // ✅ added
  const router = useRouter()

  useEffect(() => {
    // Example: check if user is in localStorage
    const stored = localStorage.getItem("user")
    if (stored) {
      setUser(JSON.parse(stored))
    }
    setLoading(false) // ✅ stop loading once initialized
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setUser(data.user)
        localStorage.setItem("user", JSON.stringify(data.user)) // ✅ persist
        router.push("/dashboard")
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch {
      return { success: false, error: "Something went wrong" }
    }
  }

  const signup = async (email: string, password: string, first_name: string, last_name: string) => {
    try {
      const res = await fetch("http://localhost:8000/api/auth/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, first_name, last_name })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setUser(data.user)
        localStorage.setItem("user", JSON.stringify(data.user)) // ✅ persist
        router.push("/dashboard")
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch {
      return { success: false, error: "Something went wrong" }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user") // ✅ clear storage
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

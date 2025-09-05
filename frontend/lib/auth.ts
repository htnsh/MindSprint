import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

// Mock user database (replace with real database)
const users: User[] = []

export async function createToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    return null
  }
}

export async function getUser(email: string) {
  return users.find((user) => user.email === email)
}

export async function createUser(email: string, password: string, name: string) {
  // In production, hash the password
  const user: User = {
    id: Math.random().toString(36).substr(2, 9),
    email,
    name,
    createdAt: new Date().toISOString(),
  }
  users.push(user)
  return user
}

export async function validateCredentials(email: string, password: string) {
  // In production, compare hashed passwords
  const user = await getUser(email)
  return user // Simplified for demo
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) return null

    const payload = await verifyToken(token)
    if (!payload) return null

    return await getUser(payload.email as string)
  } catch (error) {
    return null
  }
}

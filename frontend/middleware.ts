// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  // 🚫 Disable redirect for now
  return NextResponse.next()
}

export const config = {
  matcher: [], // no routes protected
}

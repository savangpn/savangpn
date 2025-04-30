import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)

  // Check auth status
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Auth routes logic
  const isAuthRoute = request.nextUrl.pathname === "/" || request.nextUrl.pathname === "/signup"
  const isApiRoute = request.nextUrl.pathname.startsWith("/api")
  const isAuthCallbackRoute = request.nextUrl.pathname.startsWith("/auth/callback")
  const isProtectedRoute = !isAuthRoute && !isApiRoute && !isAuthCallbackRoute

  // If accessing protected route without session, redirect to login
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // If accessing login page with session, redirect to dashboard
  if (request.nextUrl.pathname === "/" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // If accessing signup page with session, redirect to dashboard
  if (request.nextUrl.pathname === "/signup" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

import { NextRequest, NextResponse } from "next/server"
import { auth } from "./lib/auth/auth"

// List of public routes that don't require authentication
const publicRoutes = ["/login", "/register", "/forgot-password", "/api/auth"]

// List of admin routes that require admin role
const adminRoutes = ["/settings", "/staff", "/departments", "/audit-logs"]

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check authentication
  const session = await auth()

  if (!session) {
    // Redirect to login if not authenticated
    if (!pathname.startsWith("/api")) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check role-based access for admin routes
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    const userRole = session.user?.role

    const adminRoles = ["SUPER_ADMIN", "ADMINISTRATOR"]
    if (!adminRoles.includes(userRole || "")) {
      if (!pathname.startsWith("/api")) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}

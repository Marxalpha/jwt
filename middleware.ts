import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Skip CSRF check for GET requests and public routes
  if (
    request.method === "GET" ||
    request.nextUrl.pathname.startsWith("/api/auth/login") ||
    request.nextUrl.pathname.startsWith("/api/auth/signup") ||
    request.nextUrl.pathname.startsWith("/api/auth/csrf") ||
    process.env.NODE_ENV !== "production" // Skip CSRF in development
  ) {
    return NextResponse.next();
  }

  const csrfToken = request.headers.get("x-csrf-token");
  const storedToken = request.cookies.get("csrf-token");

  // Verify CSRF token in production only
  if (process.env.NODE_ENV === "production") {
    if (!csrfToken || !storedToken || csrfToken !== storedToken.value) {
      return NextResponse.json(
        { error: "Invalid CSRF token" },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};

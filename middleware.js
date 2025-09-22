// src/middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  // Example: redirect unauthenticated users
  const url = request.nextUrl.clone();

  if (!request.cookies.get("token")) {
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Apply middleware to specific routes
export const config = {
  matcher: ["/profile/:path*", "/billing/:path*"],
};

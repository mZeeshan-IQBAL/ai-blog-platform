// 2. Updated middleware.js (enhanced for billing protection)
import { NextResponse } from "next/server";

export function middleware(request) {
  const url = request.nextUrl.clone();
  const token = request.cookies.get("token");
  
  // Check if user is authenticated
  if (!token) {
    // Allow access to billing success and public routes
    if (url.pathname.startsWith('/billing/success') || url.pathname === '/pricing') {
      return NextResponse.next();
    }
    
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }

  // For billing routes, you might want to add additional checks
  if (url.pathname.startsWith('/billing')) {
    // Add any billing-specific middleware logic here
    // For example, checking if user has valid session
    const response = NextResponse.next();
    
    // Add billing-related headers if needed
    response.headers.set('X-Billing-Route', 'true');
    
    return response;
  }

  return NextResponse.next();
}

// Apply middleware to specific routes
export const config = {
  matcher: [
    "/profile/:path*", 
    "/billing/:path*",
    "/dashboard/:path*", // Add dashboard protection
    "/api/billing/:path*" // Protect billing API routes
  ],
};

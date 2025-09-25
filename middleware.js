// middleware.js (for custom JWT tokens)
import { NextResponse } from "next/server";

export function middleware(request) {
  const url = request.nextUrl.clone();
  
  // Check for NextAuth session cookies (common names)
  const sessionToken = request.cookies.get("next-auth.session-token") || 
                      request.cookies.get("__Secure-next-auth.session-token") ||
                      request.cookies.get("token"); // Your custom token
  
  // Check if user is authenticated
  if (!sessionToken) {
    // Allow access to billing success, auth routes, and public routes
    if (url.pathname.startsWith('/billing/success') || 
        url.pathname === '/pricing' ||
        url.pathname.startsWith('/auth/')) {
      return NextResponse.next();
    }
    
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }

  // For billing routes, add additional checks
  if (url.pathname.startsWith('/billing')) {
    const response = NextResponse.next();
    
    // Add billing-related headers if needed
    response.headers.set('X-Billing-Route', 'true');
    
    return response;
  }

  // For dashboard routes
  if (url.pathname.startsWith('/dashboard')) {
    const response = NextResponse.next();
    
    // Add dashboard-specific headers if needed
    response.headers.set('X-Dashboard-Route', 'true');
    
    return response;
  }

  return NextResponse.next();
}

// Apply middleware to specific routes
export const config = {
  matcher: [
    "/profile/:path*", 
    "/billing/:path*",
    "/dashboard/:path*",
    "/api/billing/:path*"
  ],
};
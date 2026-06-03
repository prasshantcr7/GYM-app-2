import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    
    // Check for the Better Auth session token safely
    const sessionToken = request.cookies?.get("better-auth.session_token")?.value || 
                         request.cookies?.get("__Secure-better-auth.session_token")?.value;

    // Paths that do not require authentication check
    const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/api/auth");
    const isPublicAsset = pathname.startsWith("/icons") || 
                          pathname.startsWith("/manifest.json") || 
                          pathname.includes(".");

    if (isPublicAsset) {
      return NextResponse.next();
    }

    // Redirect to login if accessing protected routes without session token
    if (!sessionToken && !isAuthRoute) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Redirect to home if logged-in user attempts to access auth routes
    if (sessionToken && pathname.startsWith("/login")) {
      const homeUrl = new URL("/", request.url);
      return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("PROXY RUNTIME ERROR:", error);
    // Fallback to let the request continue to avoid rendering a blank page
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Match all routes except standard internal next folders and auth API
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};

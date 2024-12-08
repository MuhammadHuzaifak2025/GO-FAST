import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get the "access-token" cookie
  const cookie = request.cookies.get("access-token");

  // Determine the current pathname
  const pathname = request.nextUrl.pathname;

  // Redirect logic
  if (cookie) {
    // If the user is already authenticated and trying to access "/" or "/login", redirect them to "/admin"
    if (pathname === "/" || pathname === "/login") {
      const adminUrl = new URL("/admin", request.nextUrl.origin);
      return NextResponse.redirect(adminUrl);
    }
    // Allow access to other routes
    return NextResponse.next();
  } else {
    if (pathname !== "/login" && pathname !== "/") {
      const loginUrl = new URL("/", request.nextUrl.origin);
      return NextResponse.redirect(loginUrl);
    }
  }
}

// Apply middleware to specific paths
export const config = {
  matcher: ["/", "/login", "/admin"], // Middleware will run on these routes
};

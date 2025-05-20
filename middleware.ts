import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Check if mock mode is enabled
  const useMock = process.env.USE_MOCK_API === "true";

  if (useMock && request.nextUrl.pathname.startsWith("/api/")) {
    // Add a header to indicate that mock mode is enabled
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-use-mock", "true");

    // Create a new request with the updated headers
    const newRequest = {
      ...request,
      headers: requestHeaders,
    };

    return NextResponse.next({
      request: newRequest,
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  return NextResponse.next({
    request
  });
}

export const config = {
  matcher: '/api/:path*'
};

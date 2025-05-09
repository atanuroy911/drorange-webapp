import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import {routing} from './i18n/routing';

export default createMiddleware(routing);

// Function to handle JWT verification
async function verifyJwt(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return null; // No token, return null
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret); // ✅ edge-compatible verification
    return true; // Valid token
  } catch (err) {
    console.error("JWT ERROR:", err);
    return null; // Invalid token
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 2. JWT Authentication check: Ensure the user is authenticated before proceeding
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/register') || pathname.startsWith('/login')) {
    const isAuthenticated = await verifyJwt(request);
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url)); // Redirect if not authenticated
    }
  }

  // Skip if the pathname already includes a locale or is an API route
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/static')) {
    return NextResponse.next();
  }

  const locales = ['cn', 'en', 'bn', 'fa'];
  const defaultLocale = 'cn';

  // Check if the pathname starts with a supported locale
  const hasLocale = locales.some((locale) => pathname.startsWith(`/${locale}`));

  if (!hasLocale) {
    // Redirect to the default locale
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Match all paths that are not static assets or API routes
export const config = {
   matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};

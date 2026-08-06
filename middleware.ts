import { NextResponse, type NextRequest } from "next/server";
import { buildContentSecurityPolicy } from "./lib/security/contentSecurityPolicy";

function isAssetRequest(pathname: string): boolean {
  return (
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap")
  );
}

export function middleware(request: NextRequest) {
  if (isAssetRequest(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const isDev = process.env.NODE_ENV !== "production";
  const csp = buildContentSecurityPolicy({
    allowLocalDevUnsafeEval: isDev,
    reportOnly: process.env.CSP_REPORT_ONLY === "true",
    reportUri: process.env.CSP_REPORT_URI,
  });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", csp.nonce ?? "");

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set(csp.headerName, csp.headerValue);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  );
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except API routes, Next.js static assets,
     * image optimization files, and common metadata files.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};

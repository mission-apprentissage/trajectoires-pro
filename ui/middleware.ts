import type { NextRequest } from "next/server";
import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse, NextFetchEvent } from "next/server";

async function authIJMiddleware(request: NextRequest, event: NextFetchEvent) {
  const requestWithAuth = request as unknown as NextRequestWithAuth;
  const matcher = ["/inserjeunes/((?!api|login).*)"];

  if (matcher.length === 0 || matcher.find((m) => new RegExp(m).test(request.nextUrl.pathname))) {
    return withAuth(
      function middleware(req) {
        console.log("logged", req.nextauth.token);
      },
      {
        pages: {
          error: "/api/inserjeunes/auth/error",
          signIn: "/api/inserjeunes/auth/signin",
        },
      }
    )(requestWithAuth, event);
  }
  return NextResponse.next();
}
export async function middleware(request: NextRequest, event: NextFetchEvent) {
  if (request.nextUrl.pathname.startsWith("/inserjeunes")) {
    return authIJMiddleware(request, event);
  }

  return NextResponse.next();
}

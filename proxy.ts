import { NextResponse, type NextRequest } from "next/server";
import { getAuthSessionFromRequest } from "@/lib/auth";

// Pages accessibles sans authentification. Le jeu « La Côte » est ouvert aux
// invités : ils jouent librement et un CTA les invite à créer un compte pour
// enregistrer leur score au classement.
const PUBLIC_PATHS = new Set(["/", "/login", "/register", "/jeu"]);
const AUTH_PATHS = new Set(["/login", "/register"]);

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = getAuthSessionFromRequest(request);

  if (session) {
    if (AUTH_PATHS.has(pathname)) {
      return NextResponse.redirect(new URL("/pneu", request.url));
    }

    return NextResponse.next();
  }

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

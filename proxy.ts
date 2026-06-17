import { NextResponse, type NextRequest } from "next/server";
import { getAuthSessionFromRequest } from "@/lib/auth";

// `/revendeurs` est public : un localisateur de boutiques doit rester
// accessible (et indexable) sans authentification.
const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/register",
  "/revendeurs",
  "/catalogue",
  "/jeu"
]);
const AUTH_PATHS = new Set(["/login", "/register"]);

/* Préfixes publics : accessibles sans authentification (contenu SEO/organique).
   Le blog « Le Mag » doit rester crawlable et lisible par les visiteurs non
   connectés — il ne doit jamais rediriger vers /login. */
const PUBLIC_PREFIXES = ["/blog"];

function isPublic(pathname: string): boolean {
  return (
    PUBLIC_PATHS.has(pathname) ||
    PUBLIC_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  );
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = getAuthSessionFromRequest(request);

  if (session) {
    if (AUTH_PATHS.has(pathname)) {
      return NextResponse.redirect(new URL("/pneu", request.url));
    }

    return NextResponse.next();
  }

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

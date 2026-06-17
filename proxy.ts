import { NextResponse, type NextRequest } from "next/server";
// import { getAuthSessionFromRequest } from "@/lib/auth";

// Pages accessibles sans authentification. Le jeu « La Côte » est ouvert aux
// invités : ils jouent librement et un CTA les invite à créer un compte pour
// enregistrer leur score au classement.
const PUBLIC_PATHS = new Set(["/", "/login", "/register", "/jeu"]);
const AUTH_PATHS = new Set(["/login", "/register"]);

// Préfixes publics : accessibles sans authentification (contenu SEO/organique).
// Le blog « Le Mag » doit rester crawlable et lisible par les visiteurs non
// connectés — il ne doit jamais rediriger vers /login.
// const PUBLIC_PREFIXES = ["/blog"];

// function isPublic(pathname: string): boolean {
//   return (
//     PUBLIC_PATHS.has(pathname) ||
//     PUBLIC_PREFIXES.some(
//       (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
//     )
//   );
// }

export function proxy(_request: NextRequest) {
  void _request;

  // Temporary public-access mode: keep proxy active for the matcher, but skip
  // auth-based redirects so every page can be opened without a session.
  return NextResponse.next();

  // const { pathname, search } = request.nextUrl;
  // const session = getAuthSessionFromRequest(request);

  // if (session) {
  //   if (AUTH_PATHS.has(pathname)) {
  //     return NextResponse.redirect(new URL("/pneu", request.url));
  //   }

  //   return NextResponse.next();
  // }

  // if (isPublic(pathname)) {
  //   return NextResponse.next();
  // }

  // const loginUrl = new URL("/login", request.url);
  // loginUrl.searchParams.set("next", `${pathname}${search}`);

  // return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

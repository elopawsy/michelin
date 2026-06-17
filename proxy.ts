import { NextResponse, type NextRequest } from "next/server";
// import { getAuthSessionFromRequest } from "@/lib/auth";

// const PUBLIC_PATHS = new Set(["/", "/login", "/register"]);
// const AUTH_PATHS = new Set(["/login", "/register"]);

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

  // if (PUBLIC_PATHS.has(pathname)) {
  //   return NextResponse.next();
  // }

  // const loginUrl = new URL("/login", request.url);
  // loginUrl.searchParams.set("next", `${pathname}${search}`);

  // return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

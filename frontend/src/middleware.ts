import { jwtDecode } from "jwt-decode";
import { NextRequest, NextResponse } from "next/server";

// This middleware only handles auth-based route protection.
// Config-dependent redirects (registration, SMTP, legal, etc.) are handled
// client-side in _app.tsx to avoid fetching config on every navigation.

export const config = {
  matcher: "/((?!api|static|.*\\..*|_next).*)",
};

export function middleware(request: NextRequest) {
  const route = request.nextUrl.pathname;
  let user: { isAdmin: boolean } | null = null;
  const accessToken = request.cookies.get("access_token")?.value;

  try {
    const claims = jwtDecode<{ exp: number; isAdmin: boolean }>(
      accessToken as string,
    );
    if (claims.exp * 1000 > Date.now()) {
      user = claims;
    }
  } catch {
    user = null;
  }

  const publicRoutes = new Routes([
    "/share/*",
    "/s/*",
    "/upload",
    "/upload/*",
    "/help",
    "/404",
    "/error",
    "/imprint",
    "/privacy",
    "/auth/*",
    "/",
  ]);

  const accountRoutes = new Routes(["/account*"]);
  const adminRoutes = new Routes(["/admin/*"]);

  if (!user && (accountRoutes.contains(route) || adminRoutes.contains(route))) {
    return NextResponse.redirect(
      new URL("/auth/signIn?redirect=" + encodeURIComponent(route), request.url),
    );
  }

  if (adminRoutes.contains(route) && !user?.isAdmin) {
    return NextResponse.redirect(new URL("/upload", request.url));
  }

  if (user && route.startsWith("/auth/")) {
    return NextResponse.redirect(new URL("/upload", request.url));
  }
}

// Helper class to check if a route matches a list of routes
class Routes {
  // eslint-disable-next-line no-unused-vars
  constructor(public routes: string[]) {}

  contains(_route: string) {
    for (const route of this.routes) {
      if (new RegExp("^" + route.replace(/\*/g, ".*") + "$").test(_route))
        return true;
    }
    return false;
  }
}

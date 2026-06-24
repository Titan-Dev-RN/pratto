import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/app", "/admin"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get("pratto_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  /* Token super-admin só em /admin */
  if (pathname.startsWith("/admin")) {
    const role = request.cookies.get("pratto_role")?.value;
    if (role !== "superadmin") {
      return NextResponse.redirect(new URL("/app/pedidos", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};

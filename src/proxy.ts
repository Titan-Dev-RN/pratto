import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/app", "/admin"];

/* Painéis com dados sensíveis (faturamento etc.) — só admin/superadmin, mesmo digitando a URL direto */
const ADMIN_ONLY_APP_PATHS = ["/app/dashboard", "/app/cardapio", "/app/config"];

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

  const role = request.cookies.get("pratto_role")?.value;

  /* Token super-admin só em /admin */
  if (pathname.startsWith("/admin")) {
    if (role !== "superadmin") {
      return NextResponse.redirect(new URL("/app/pedidos", request.url));
    }
  }

  /* Garçom/caixa não acessam painéis administrativos, nem digitando a URL */
  if (ADMIN_ONLY_APP_PATHS.some((p) => pathname.startsWith(p))) {
    if (role !== "admin" && role !== "superadmin") {
      return NextResponse.redirect(new URL("/app/pedidos", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};

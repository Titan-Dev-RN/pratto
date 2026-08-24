import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/app"];

/* Painéis com dados sensíveis (faturamento etc.) — só admin, mesmo digitando a URL direto */
const ADMIN_ONLY_APP_PATHS = ["/app/dashboard", "/app/cardapio", "/app/config", "/app/cupons"];

/* Fluxo de salão (mesas, PDV) — entregador e cozinha não têm essa
   permissão (cozinha só visualiza os pedidos que chegam, não abre mesa
   nem lança pedido; ver Cozinha #4 nos problemas relatados) */
const SALAO_ONLY_APP_PATHS = ["/app/mesas", "/app/pedidos/novo"];
const SEM_SALAO_ROLES = ["entregador", "cozinha"];

function destinoPadrao(role: string | undefined, request: NextRequest) {
  if (role === "entregador") return new URL("/app/entregas", request.url);
  return new URL("/app/pedidos", request.url);
}

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

  /* Garçom/caixa/cozinha não acessam painéis administrativos, nem digitando a URL */
  if (ADMIN_ONLY_APP_PATHS.some((p) => pathname.startsWith(p))) {
    if (role !== "admin") {
      return NextResponse.redirect(destinoPadrao(role, request));
    }
  }

  /* Entregador e cozinha não têm permissão de salão (mesas/PDV) */
  if (SALAO_ONLY_APP_PATHS.some((p) => pathname.startsWith(p))) {
    if (SEM_SALAO_ROLES.includes(role ?? "")) {
      return NextResponse.redirect(destinoPadrao(role, request));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};

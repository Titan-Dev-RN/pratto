/* Proxy same-origin pro backend Rails ("API_atendimento").
 *
 * Motivo: o backend real (http://85.209.92.60:5000) não tem TLS. Em
 * produção o app é servido em HTTPS (domínio da Vercel), então um
 * fetch() direto do navegador pro backend é bloqueado pelo browser como
 * "mixed content" (HTTPS ativo → HTTP é sempre recusado, não é só um
 * aviso). Ver INTEGRACAO_API.md.
 *
 * Solução: `src/lib/api/client.ts` chama URLs relativas (`/api/...`),
 * que caem aqui — este arquivo roda no servidor da Vercel (não no
 * navegador) e repassa a chamada pro backend real. O browser só enxerga
 * uma chamada same-origin HTTPS; o hop HTTP acontece servidor-a-servidor,
 * onde mixed content não existe. Bônus: como fica same-origin, nunca
 * precisa de CORS/preflight.
 *
 * Este arquivo captura QUALQUER coisa sob /api/* (inclusive
 * /api/v1/cliente/autenticacao/login, o único endpoint fora do padrão
 * em inglês) e repassa 1:1 — método, query string, corpo, Content-Type
 * e Authorization. Ver "Proxying to a backend" nos docs do Next
 * (node_modules/next/dist/docs/01-app/02-guides/backend-for-frontend.md).
 */

const TARGET = (process.env.API_PROXY_TARGET ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000").replace(
  /\/+$/,
  "",
);

async function forward(request: Request, path: string[]): Promise<Response> {
  const search = new URL(request.url).search;
  const targetUrl = `${TARGET}/api/${path.join("/")}${search}`;

  /* Repassa só o que o backend precisa — nunca o request inteiro (Host,
     Cookie, Origin etc. da Vercel não fazem sentido pro Rails, e o Rails
     tem HostAuthorization habilitado por padrão: um Host desconhecido no
     header vira 403 "Blocked host"). */
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const authorization = request.headers.get("authorization");
  if (authorization) headers.set("authorization", authorization);

  const hasBody = !["GET", "HEAD"].includes(request.method);

  let backendRes: Response;
  try {
    backendRes = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      /* Backend não tem certificado válido pra validar mesmo — não tem
         redirect esperado nesse contrato. */
      redirect: "manual",
    });
  } catch {
    return Response.json({ erro: "Não foi possível conectar ao servidor." }, { status: 502 });
  }

  if (backendRes.status === 204 || backendRes.status === 205) {
    return new Response(null, { status: backendRes.status });
  }

  const responseHeaders = new Headers();
  const responseContentType = backendRes.headers.get("content-type");
  if (responseContentType) responseHeaders.set("content-type", responseContentType);

  return new Response(await backendRes.arrayBuffer(), {
    status: backendRes.status,
    statusText: backendRes.statusText,
    headers: responseHeaders,
  });
}

type Params = Promise<{ path: string[] }>;

export async function GET(request: Request, { params }: { params: Params }) {
  return forward(request, (await params).path);
}

export async function POST(request: Request, { params }: { params: Params }) {
  return forward(request, (await params).path);
}

export async function PATCH(request: Request, { params }: { params: Params }) {
  return forward(request, (await params).path);
}

export async function PUT(request: Request, { params }: { params: Params }) {
  return forward(request, (await params).path);
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  return forward(request, (await params).path);
}

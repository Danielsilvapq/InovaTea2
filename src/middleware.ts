import { NextResponse, type NextRequest } from "next/server";

/** Quem tenta abrir uma página protegida sem estar logado vai para o login e depois volta para ela. */
export function middleware(req: NextRequest) {
  if (req.cookies.get("inovatea_session")) return NextResponse.next();
  const url = req.nextUrl.clone();
  const next = req.nextUrl.pathname + req.nextUrl.search;
  url.pathname = "/entrar";
  url.search = `?next=${encodeURIComponent(next)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/painel", "/responsavel/:path*", "/profissional/:path*", "/paciente/:path*", "/crianca/:path*"],
};

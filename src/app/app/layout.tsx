"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/store/session";
import { useOrders } from "@/lib/hooks/useOrders";
import { useMounted } from "@/lib/hooks/useMounted";
import { toast } from "@/components/ui/Toast";

const navItems = [
  {
    href: "/app/pedidos",
    label: "Pedidos",
    roles: [] as string[],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    href: "/app/mesas",
    label: "Mesas",
    roles: ["garcom", "caixa", "admin"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="3" y="3" width="8" height="8" rx="1" />
        <rect x="13" y="3" width="8" height="8" rx="1" />
        <rect x="3" y="13" width="8" height="8" rx="1" />
        <rect x="13" y="13" width="8" height="8" rx="1" />
      </svg>
    ),
  },
  {
    href: "/app/entregas",
    label: "Entregas",
    roles: ["entregador", "admin"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    href: "/app/dashboard",
    label: "Painel",
    roles: ["admin"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
  },
  {
    href: "/app/cardapio",
    label: "Cardápio",
    roles: ["admin"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    href: "/app/cupons",
    label: "Cupons",
    roles: ["admin"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M9 5H4a1 1 0 00-1 1v4a2 2 0 010 4v4a1 1 0 001 1h5M9 5h11a1 1 0 011 1v4a2 2 0 000 4v4a1 1 0 01-1 1H9M9 5v14" />
      </svg>
    ),
  },
  {
    href: "/app/config",
    label: "Config",
    roles: ["admin"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { usuario, clearSession, hasRole } = useSessionStore();
  /* Sessão vem de localStorage (zustand persist) — no SSR "usuario" é
     sempre null, então o menu por papel só pode usar o valor real depois
     de montar no cliente, senão diverge do HTML do servidor. */
  const mounted = useMounted();

  useOrders({
    onNovoPedido: () => toast.info("Novo pedido!", "Um novo pedido chegou."),
  });

  function handleLogout() {
    clearSession();
    document.cookie = "pratto_token=; path=/; max-age=0";
    document.cookie = "pratto_role=; path=/; max-age=0";
    router.push("/login");
  }

  const isAdmin = mounted && hasRole("admin");

  const visibleNav = navItems.filter((item) =>
    item.roles.length === 0 ||
    (mounted && item.roles.some((r) => hasRole(r as "garcom" | "caixa" | "cozinha" | "admin" | "entregador")))
  );

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-team-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-team-500 flex items-center justify-center font-bold text-sm flex-shrink-0">
            P
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Pratto</span>
            {isAdmin && (
              <span className="text-xs bg-team-600 text-team-200 font-semibold px-2 py-0.5 rounded-full">
                Admin
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/app/perfil" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-full bg-team-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {(mounted ? usuario?.nome : undefined)?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <span className="text-team-300 text-sm hidden sm:block truncate max-w-28">
              {(mounted ? usuario?.nome : undefined) ?? "Equipe"}
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="text-team-400 hover:text-white text-xs font-medium transition-colors px-2.5 py-1 rounded-lg hover:bg-team-700"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 overflow-auto pb-20">{children}</main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-neutral-200">
        <div className="flex max-w-lg mx-auto">
          {visibleNav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center gap-0.5 pt-2.5 pb-3 text-xs font-medium transition-colors relative ${
                  active ? "text-team-600" : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-team-500 rounded-full" />
                )}
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

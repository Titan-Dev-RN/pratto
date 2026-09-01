"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/store/session";
<<<<<<< HEAD
import { useRestauranteAdmin } from "@/lib/api/queries/restaurante";
import { useCategoriasAdmin, useProdutosAdmin } from "@/lib/api/queries/menu";
import { useMesas } from "@/lib/api/queries/mesas";
import { useAtualizarUsuario } from "@/lib/api/queries/usuarios";
import { apiErrorMessage } from "@/lib/api/client";
import { toast } from "@/components/ui/Toast";
=======
import { useMesas } from "@/lib/api/queries/mesas";
import { useProdutos } from "@/lib/api/queries/menu";
import { useMounted } from "@/lib/hooks/useMounted";
import { PageLoader, Spinner } from "@/components/ui/Spinner";
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59

const roleInfo: Record<string, { label: string; desc: string; cor: string }> = {
  garcom: { label: "Garçom", desc: "Atendimento de mesas e pedidos", cor: "bg-blue-100 text-blue-700" },
  caixa: { label: "Caixa", desc: "Fechamento de contas e pagamentos", cor: "bg-amber-100 text-amber-700" },
  cozinha: { label: "Cozinha", desc: "Preparo dos pedidos que chegam", cor: "bg-orange-100 text-orange-700" },
  admin: { label: "Administrador", desc: "Acesso total ao painel do restaurante", cor: "bg-team-100 text-team-700" },
  entregador: { label: "Entregador", desc: "Entregas designadas a você", cor: "bg-purple-100 text-purple-700" },
};

export default function PerfilPage() {
  const router = useRouter();
<<<<<<< HEAD
  const { usuario, clearSession, hasRole, setSession, token } = useSessionStore();
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(usuario?.nome ?? "");
=======
  const { usuario, clearSession, hasRole } = useSessionStore();
  /* Sessão vem de localStorage (zustand persist) — no SSR "usuario" é
     sempre null, então a página inteira depende do papel real e precisa
     esperar montar no cliente antes de renderizar, senão diverge do HTML
     do servidor (hydration mismatch). */
  const mounted = useMounted();
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59

  const isAdmin = mounted && hasRole("admin");
  const role = usuario?.role ?? "garcom";
  const info = roleInfo[role] ?? roleInfo.garcom;
  const inicial = (usuario?.nome ?? usuario?.email ?? "U").charAt(0).toUpperCase();

<<<<<<< HEAD
  const { data: restauranteData } = useRestauranteAdmin();
  const { data: mesasData } = useMesas();
  const { data: produtosData } = useProdutosAdmin();
  const { data: categoriasData } = useCategoriasAdmin();
  const atualizarUsuario = useAtualizarUsuario();

  const restaurante = restauranteData?.data;
  const totalMesas = mesasData?.data.length ?? 0;
  const totalProdutos = produtosData?.data.filter((p) => p.ativo).length ?? 0;
  const totalCategorias = categoriasData?.data.filter((c) => c.ativa).length ?? 0;
  const inicial = (usuario?.nome ?? "U").charAt(0).toUpperCase();
  const salvando = atualizarUsuario.isPending;

  async function salvarNome() {
    if (!nome.trim() || !usuario || !token) return;
    try {
      await atualizarUsuario.mutateAsync({ id: usuario.id, dados: { nome: nome.trim() } });
      setSession(token, { ...usuario, nome: nome.trim() });
      toast.success("Perfil atualizado!");
      setEditando(false);
    } catch (err) {
      toast.error("Não foi possível salvar", apiErrorMessage(err));
    }
  }
=======
  /* Estatísticas rápidas só pra admin, evitando requests desnecessários pros outros papéis */
  const { data: mesas, isLoading: loadingMesas } = useMesas();
  const { data: produtos, isLoading: loadingProdutos } = useProdutos();
  const carregandoStats = isAdmin && (loadingMesas || loadingProdutos);
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59

  function handleLogout() {
    clearSession();
    document.cookie = "pratto_token=; path=/; max-age=0";
    document.cookie = "pratto_role=; path=/; max-age=0";
    router.push("/login");
  }

  if (!mounted) return <PageLoader />;

  return (
    <div className="max-w-lg mx-auto pb-10">
      {/* Hero do perfil */}
      <div className="bg-team-800 px-5 pt-8 pb-10 relative">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-20 h-20 rounded-full bg-team-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-team-900/50 ring-4 ring-team-700">
            {inicial}
          </div>

          <h1 className="text-xl font-bold text-white mt-1">{usuario?.nome ?? usuario?.email}</h1>

          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${info.cor}`}>
            {info.label}
          </span>
          {usuario?.email && <p className="text-team-400 text-sm">{usuario.email}</p>}
        </div>
      </div>

      {/* Cards */}
      <div className="px-4 -mt-5 flex flex-col gap-4">

        {/* Card: Conta */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
          <div className="px-5 pt-4 pb-2">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Conta</p>
          </div>
          <Row label="Nome" value={usuario?.nome ?? "—"} />
          <Row label="E-mail" value={usuario?.email ?? "—"} />
          <Row label="Função" value={info.label} badge={info.cor} />
          <Row label="Permissões" value={info.desc} muted />
        </div>

<<<<<<< HEAD
        {/* Card: Restaurante (somente admin) */}
        {isAdmin && restaurante && (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
            <div className="px-5 pt-4 pb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Restaurante</p>
              <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                Ativo
              </span>
            </div>
            <Row label="Nome" value={restaurante.nome} />
            <Row label="Slug / URL" value={`/${restaurante.slug}`} mono />
            <Row label="Plano" value="Profissional" badge="bg-team-100 text-team-700" />
            <Row label="Mesas cadastradas" value={`${totalMesas} mesas`} />
            <Row label="Produtos ativos" value={`${totalProdutos} produtos em ${totalCategorias} categorias`} />
            <Row label="Acesso ao cardápio" value={`pratto.app/${restaurante.slug}`} mono />
          </div>
        )}

=======
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
        {/* Card: Estatísticas rápidas (somente admin) */}
        {isAdmin && (
          carregandoStats ? (
            <div className="flex justify-center py-4"><Spinner size="sm" /></div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <StatCard value={String(mesas?.length ?? 0)} label="Mesas" color="bg-team-50 border-team-100" text="text-team-700" />
              <StatCard value={String(produtos?.filter((p) => p.ativo).length ?? 0)} label="Produtos ativos" color="bg-green-50 border-green-100" text="text-green-700" />
            </div>
          )
        )}

        {/* Card: Ações */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
          <div className="px-5 pt-4 pb-2">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Ações</p>
          </div>

          {isAdmin && (
            <>
              <ActionRow
                href="/app/config"
                icon={
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                  </svg>
                }
<<<<<<< HEAD
                label="Configurações do restaurante"
              />
              <ActionRow
                href={`/${restaurante?.slug ?? ""}`}
                external
                icon={
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                }
                label="Ver cardápio público"
=======
                label="Configurações"
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
              />
              <ActionRow
                href="/app/dashboard"
                icon={
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 20V10M12 20V4M6 20v-6" />
                  </svg>
                }
                label="Ir ao painel de métricas"
              />
            </>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-4 text-red-500 hover:bg-red-50 transition-colors text-left border-t border-neutral-100"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="font-semibold text-sm">Sair da conta</span>
          </button>
        </div>

        <p className="text-center text-neutral-400 text-xs pb-2">
          Pratto v1.0 · Sistema para restaurantes
        </p>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  badge,
  muted,
}: {
  label: string;
  value: string;
  badge?: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-3 border-t border-neutral-50">
      <span className="text-sm text-neutral-500 flex-shrink-0">{label}</span>
      {badge ? (
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badge}`}>{value}</span>
      ) : (
        <span className={`text-sm text-right ${muted ? "text-neutral-400" : "text-neutral-900 font-medium"}`}>
          {value}
        </span>
      )}
    </div>
  );
}

function StatCard({ value, label, color, text }: { value: string; label: string; color: string; text: string }) {
  return (
    <div className={`rounded-2xl border p-4 text-center ${color}`}>
      <p className={`text-2xl font-bold ${text}`}>{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
    </div>
  );
}

function ActionRow({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  const cls = "flex items-center gap-3 px-5 py-4 hover:bg-neutral-50 transition-colors border-t border-neutral-50 text-neutral-700";
  return (
    <Link href={href} className={cls}>
      <span className="text-neutral-400 flex-shrink-0">{icon}</span>
      <span className="font-medium text-sm flex-1">{label}</span>
      <svg className="w-4 h-4 text-neutral-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}

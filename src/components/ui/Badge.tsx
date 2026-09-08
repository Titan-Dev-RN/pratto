import { ItemComandaStatus, TableStatus } from "@/types/domain";

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
}

const styles: Record<BadgeVariant, string> = {
  success: "bg-green-100 text-green-800",
  warning: "bg-amber-100 text-amber-800",
  error: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
  neutral: "bg-neutral-100 text-neutral-700",
};

const dots: Record<BadgeVariant, string> = {
  success: "bg-green-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
  info: "bg-blue-500",
  neutral: "bg-neutral-400",
};

export function Badge({ children, variant = "neutral", dot = false }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[variant]}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dots[variant]}`} aria-hidden="true" />}
      {children}
    </span>
  );
}

/* Status do item na comanda/cozinha — só 3 valores existem de verdade no
   backend (confirmado ao vivo); "entregue" é controle só do front. */
export function ItemComandaStatusBadge({ status }: { status: ItemComandaStatus }) {
  const map: Record<ItemComandaStatus, { label: string; variant: BadgeVariant }> = {
    pendente: { label: "Novo", variant: "warning" },
    em_andamento: { label: "Em preparo", variant: "info" },
    pronto: { label: "Pronto", variant: "success" },
    cancelado: { label: "Cancelado", variant: "error" },
  };
  /* Fallback defensivo — se o backend um dia devolver um status que a
     gente ainda não mapeou, mostra ele cru em vez de quebrar a tela
     (já aconteceu com "cancelado" antes de virar um valor conhecido). */
  const { label, variant } = map[status] ?? { label: status, variant: "neutral" as BadgeVariant };
  return <Badge variant={variant} dot>{label}</Badge>;
}

/* Status de entrega — na verdade é o mesmo enum de status da comanda
   (confirmado ao vivo testando `status_delivery` no PATCH
   /api/delivery_orders/:id/status: pendente/confirmado/em_preparo/
   pronto/entregue/cancelado aceitos; "saiu_para_entrega" do exemplo do
   Insomnia dá 500 "not a valid status" — não existe estado dedicado de
   "em trânsito"). */
export function EntregaStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    pendente: { label: "Pendente", variant: "warning" },
    confirmado: { label: "Confirmado", variant: "warning" },
    em_preparo: { label: "Em preparo", variant: "info" },
    pronto: { label: "Pronto p/ entrega", variant: "info" },
    entregue: { label: "Entregue", variant: "success" },
    cancelado: { label: "Cancelado", variant: "error" },
  };
  const { label, variant } = map[status] ?? { label: status, variant: "neutral" as BadgeVariant };
  return <Badge variant={variant} dot>{label}</Badge>;
}

/* Aceita string crua: a superfície V1 (/api/v1/cliente/mesas) pode
   devolver valores fora do enum antigo (ex.: "fechada"). Fallback
   defensivo mostra o valor cru em vez de quebrar, igual aos outros
   badges de status. */
export function TableStatusBadge({ status }: { status: TableStatus | string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    livre: { label: "Livre", variant: "success" },
    ocupada: { label: "Ocupada", variant: "warning" },
    conta_pedida: { label: "Conta pedida", variant: "info" },
    fechada: { label: "Fechada", variant: "neutral" },
  };
  const { label, variant } = map[status] ?? { label: status, variant: "neutral" as BadgeVariant };
  return <Badge variant={variant} dot>{label}</Badge>;
}

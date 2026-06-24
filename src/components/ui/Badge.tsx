import { OrderStatus, TableStatus } from "@/types/domain";

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

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { label: string; variant: BadgeVariant }> = {
    pendente: { label: "Pendente", variant: "warning" },
    confirmado: { label: "Confirmado", variant: "info" },
    em_preparo: { label: "Em preparo", variant: "info" },
    pronto: { label: "Pronto", variant: "success" },
    entregue: { label: "Entregue", variant: "neutral" },
    cancelado: { label: "Cancelado", variant: "error" },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant} dot>{label}</Badge>;
}

export function TableStatusBadge({ status }: { status: TableStatus }) {
  const map: Record<TableStatus, { label: string; variant: BadgeVariant }> = {
    livre: { label: "Livre", variant: "success" },
    ocupada: { label: "Ocupada", variant: "warning" },
    conta_pedida: { label: "Conta pedida", variant: "error" },
    reservada: { label: "Reservada", variant: "info" },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant} dot>{label}</Badge>;
}

/* Modelo de domínio alinhado ao contrato real do backend Rails, superfície
   `/api/*` (sem versionamento, nomes em inglês nos payloads de escrita,
   português nas respostas de leitura — é assim que a API real se comporta,
   confirmado ao vivo em 2026-08-24 contra http://85.209.92.60:5000).
   Ids são UUID (string). Ver INTEGRACAO_API.md para o histórico completo
   da investigação (inclusive a API alternativa `/api/v1/cliente/*` que
   NÃO é a usada — mesmo banco, contrato diferente, descartada). */

export type UserRole = "admin" | "garcom" | "caixa" | "cozinha" | "entregador";

export type TableStatus = "livre" | "ocupada" | "conta_pedida";

/* Status do item dentro da comanda / fila da cozinha. Confirmado ao vivo:
   PATCH só aceita pendente/em_andamento/pronto como valor a setar (uma
   tentativa com "entregue" derruba 500 "not a valid status" — "entregar"
   não existe pro backend, é controlado 100% no front, ver
   useEntregaLocalStore). "cancelado" também é um status real, mas só
   aparece como RESULTADO de DELETE /commands/:id/items/:id — que é soft
   delete (confirmado ao vivo: o item não some, só muda de status). */
export type ItemComandaStatus = "pendente" | "em_andamento" | "pronto" | "cancelado";

/* "mesa" confirmado ao vivo (campo `tipo` da comanda). "delivery"/"balcao"
   inferidos pelos campos que só fazem sentido fora de mesa
   (nome_cliente/telefone_cliente/endereco_entrega/codigo_rastreio) —
   ainda sem uma comanda de delivery real pra confirmar o valor exato. */
export type ComandaTipo = "mesa" | "delivery" | "balcao";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  ativo: boolean;
  restaurante_id?: string;
}

export interface MesaComandaResumo {
  id: string;
  total: number;
  opened_at: string;
}

export interface Mesa {
  id: string;
  numero: number;
  capacidade?: number;
  status: TableStatus;
  /* Resumo da comanda aberta, embutido pelo backend — evita uma chamada
     extra só pra saber se a mesa tem conta em aberto e o valor (caixa
     problema #2: ver valor da conta assim que clica na mesa). */
  active_command?: MesaComandaResumo | null;
}

export interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  ativo: boolean;
  exibir_na_vitrine?: boolean;
  categoria_id?: string | null;
  foto_url?: string | null;
  ordem?: number;
}

export interface ItemComanda {
  id: string;
  comanda_id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  status: ItemComandaStatus;
  observacao?: string | null;
  /* Embutidos só na listagem da cozinha (GET /api/kitchen/orders) */
  produto?: { nome: string; descricao?: string };
  comanda?: { mesa_id: string | null };
  created_at?: string;
  updated_at?: string;
}

/* Confirmado ao vivo (GET /api/delivery_orders): endereco_entrega é
   objeto, não string — {"cep","bairro","cidade","numero","logradouro",
   "complemento"} são as chaves persistidas de verdade pelo backend. */
export interface EnderecoEntrega {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
}

export interface Comanda {
  id: string;
  mesa_id?: string | null;
  status: string;
  total: number;
  tipo: ComandaTipo;
  numero?: string;
  nome_cliente?: string | null;
  telefone_cliente?: string | null;
  endereco_entrega?: EnderecoEntrega | null;
  codigo_rastreio?: string | null;
  observacao?: string | null;
  forma_pagamento?: string | null;
  created_at: string;
  updated_at?: string;
  item_comandas?: ItemComanda[];
}

export interface SalesReportProduct {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  revenue: number;
}

export interface SalesReport {
  period: { start_date: string; end_date: string };
  total_revenue: number;
  products_ranking: SalesReportProduct[];
}

/* Rastreio público real (GET /api/public/orders/:codigo_rastreio) —
   confirmado ao vivo. Só existe pra pedidos criados via checkout público
   de delivery; pedido de mesa/balcão continua simulado (ver
   lib/store/pedidoLocal.ts). */
export interface ItemPedidoPublico {
  id: string;
  produto_id: string;
  quantidade: number;
  status: string;
  observacao?: string | null;
  preco_unitario: number;
  created_at?: string;
  produto?: { nome: string };
}

export interface PedidoPublico {
  codigo_rastreio: string;
  nome_cliente: string;
  status: string;
  total: number;
  items: ItemPedidoPublico[];
}

/* ───────────────────────── Módulo de caixa ─────────────────────────────
   Sem endpoint no backend ainda (sessão de caixa, split de pagamento,
   rateio) — simulado 100% no front (Zustand + localStorage), desenhado
   pra plugar numa API real depois sem mudar as telas. Ver INTEGRACAO_API.md. */

export type FormaPagamento = "dinheiro" | "credito" | "debito" | "pix";

export interface PagamentoRegistrado {
  id: string;
  forma: FormaPagamento;
  valor: number;
  recusado?: boolean;
}

export interface VendaRegistrada {
  id: string;
  comanda_id: string;
  mesa_numero?: number;
  subtotal: number;
  descontos: number;
  acrescimos: number;
  taxa_servico: number;
  total: number;
  pagamentos: PagamentoRegistrado[];
  registrada_em: string;
  cancelada?: boolean;
}

export interface SessaoCaixa {
  id: string;
  usuario_id: string;
  usuario_nome: string;
  fundo_troco: number;
  aberta_em: string;
  fechada_em?: string;
  vendas: VendaRegistrada[];
  contagem_final?: Partial<Record<FormaPagamento, number>>;
}

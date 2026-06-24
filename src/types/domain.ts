export type UserRole = "garcom" | "caixa" | "admin" | "superadmin";

export type OrderStatus =
  | "pendente"
  | "confirmado"
  | "em_preparo"
  | "pronto"
  | "entregue"
  | "cancelado";

export type OrderType = "mesa" | "delivery" | "balcao";

export type TableStatus = "livre" | "ocupada" | "conta_pedida" | "reservada";

export interface Restaurante {
  id: string;
  slug: string;
  nome: string;
  logo_url?: string;
  cor_primaria?: string;
  ativo: boolean;
}

export interface Categoria {
  id: string;
  nome: string;
  descricao?: string;
  ordem: number;
  ativa: boolean;
  restaurante_id: string;
}

export interface Variacao {
  id: string;
  nome: string;
  preco_adicional: number;
}

export interface GrupoProduto {
  id: string;
  nome: string;
  obrigatorio: boolean;
  maximo: number;
  variacoes: Variacao[];
}

export interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  foto_url?: string;
  ativo: boolean;
  ordem: number;
  categoria_id: string;
  restaurante_id: string;
  grupos: GrupoProduto[];
}

export interface ItemPedido {
  id: string;
  produto_id: string;
  produto_nome: string;
  produto_foto?: string;
  quantidade: number;
  preco_unitario: number;
  preco_total: number;
  observacao?: string;
  variacoes: { nome: string; preco_adicional: number }[];
}

export interface Pedido {
  id: string;
  numero: string;
  tipo: OrderType;
  status: OrderStatus;
  mesa_id?: string;
  mesa_numero?: number;
  restaurante_id: string;
  itens: ItemPedido[];
  total: number;
  observacao?: string;
  endereco_entrega?: EnderecoEntrega;
  criado_em: string;
  atualizado_em: string;
}

export interface Mesa {
  id: string;
  numero: number;
  capacidade: number;
  status: TableStatus;
  restaurante_id: string;
  pedido_aberto_id?: string;
  qr_code_url?: string;
}

export interface EnderecoEntrega {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  cep: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  restaurante_id: string;
  ativo: boolean;
}

export interface DashboardKPI {
  vendas_hoje: number;
  ticket_medio: number;
  pedidos_hoje: number;
  pedidos_em_aberto: number;
  grafico_7dias: { data: string; total: number }[];
  pedidos_recentes: Pedido[];
}

/* Item na sacola local (não salvo na API ainda) */
export interface ItemSacola {
  produto: Produto;
  quantidade: number;
  observacao?: string;
  variacoes_selecionadas: Variacao[];
  preco_total: number;
}

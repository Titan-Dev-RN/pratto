/* Modelo de domínio "legado" — usado SOMENTE pelas páginas públicas do
   cliente ([slug]/*), pelo dashboard mock e por src/lib/mock.ts, que
   continuam em cima de dados fake até terem contrato de API real
   (checkout do cliente pausado, multi-tenant/categorias/dashboard sem
   endpoint — ver Fase 7 do plano). Não importar este arquivo em nenhuma
   página já conectada à API real — use @/types/domain para isso. */

export type UserRoleLegacy = "garcom" | "caixa" | "admin" | "superadmin";

export type OrderStatusLegacy =
  | "pendente"
  | "confirmado"
  | "em_preparo"
  | "pronto"
  | "entregue"
  | "cancelado";

export type OrderTypeLegacy = "mesa" | "delivery" | "balcao";

export type TableStatusLegacy = "livre" | "ocupada" | "conta_pedida" | "reservada";

export interface RestauranteLegacy {
  id: string;
  slug: string;
  nome: string;
  logo_url?: string;
  cor_primaria?: string;
  chave_pix?: string;
  ativo: boolean;
}

export interface CategoriaLegacy {
  id: string;
  nome: string;
  descricao?: string;
  ordem: number;
  ativa: boolean;
  restaurante_id: string;
}

export interface VariacaoLegacy {
  id: string;
  nome: string;
  preco_adicional: number;
}

export interface GrupoProdutoLegacy {
  id: string;
  nome: string;
  obrigatorio: boolean;
  maximo: number;
  variacoes: VariacaoLegacy[];
}

export interface ProdutoLegacy {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  foto_url?: string;
  ativo: boolean;
  ordem: number;
  categoria_id: string;
  restaurante_id: string;
  grupos: GrupoProdutoLegacy[];
}

export interface ItemPedidoLegacy {
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

export interface PedidoLegacy {
  id: string;
  numero: string;
  tipo: OrderTypeLegacy;
  status: OrderStatusLegacy;
  mesa_id?: string;
  mesa_numero?: number;
  restaurante_id: string;
  itens: ItemPedidoLegacy[];
  total: number;
  observacao?: string;
  endereco_entrega?: EnderecoEntregaLegacy;
  criado_em: string;
  atualizado_em: string;
}

export interface MesaLegacy {
  id: string;
  numero: number;
  capacidade: number;
  status: TableStatusLegacy;
  restaurante_id: string;
  pedido_aberto_id?: string;
  qr_code_url?: string;
}

export interface EnderecoEntregaLegacy {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  cep: string;
}

export interface UsuarioLegacy {
  id: string;
  nome: string;
  email: string;
  role: UserRoleLegacy;
  restaurante_id: string;
  ativo: boolean;
}

export interface DashboardKPILegacy {
  vendas_hoje: number;
  ticket_medio: number;
  pedidos_hoje: number;
  pedidos_em_aberto: number;
  grafico_7dias: { data: string; total: number }[];
  pedidos_recentes: PedidoLegacy[];
}

/* Item na sacola local (não salvo na API ainda) */
export interface ItemSacolaLegacy {
  produto: ProdutoLegacy;
  quantidade: number;
  observacao?: string;
  variacoes_selecionadas: VariacaoLegacy[];
  preco_total: number;
}

import { Categoria, DashboardKPI, Mesa, Pedido, Produto, Restaurante } from "@/types/domain";

export const mockRestaurante: Restaurante = {
  id: "r1",
  slug: "tacos",
  nome: "Tacos & Co",
  logo_url: undefined,
  ativo: true,
};

export const mockCategorias: Categoria[] = [
  { id: "c1", nome: "Tacos", descricao: "Nossos tacos artesanais", ordem: 1, ativa: true, restaurante_id: "r1" },
  { id: "c2", nome: "Burritos", descricao: "Burritos generosos", ordem: 2, ativa: true, restaurante_id: "r1" },
  { id: "c3", nome: "Bebidas", descricao: "Refrescantes", ordem: 3, ativa: true, restaurante_id: "r1" },
  { id: "c4", nome: "Sobremesas", descricao: "Para adoçar o dia", ordem: 4, ativa: true, restaurante_id: "r1" },
];

export const mockProdutos: Produto[] = [
  {
    id: "p1",
    nome: "Taco de Carnitas",
    descricao: "Carne suína desfiada, cebola, coentro e salsa verde",
    preco: 18.9,
    foto_url: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400",
    ativo: true,
    ordem: 1,
    categoria_id: "c1",
    restaurante_id: "r1",
    grupos: [
      {
        id: "g1",
        nome: "Molho",
        obrigatorio: false,
        maximo: 1,
        variacoes: [
          { id: "v1", nome: "Salsa verde", preco_adicional: 0 },
          { id: "v2", nome: "Pico de gallo", preco_adicional: 0 },
          { id: "v3", nome: "Chipotle", preco_adicional: 2 },
        ],
      },
    ],
  },
  {
    id: "p2",
    nome: "Taco de Camarão",
    descricao: "Camarões grelhados, coleslaw e chipotle mayo",
    preco: 24.9,
    foto_url: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400",
    ativo: true,
    ordem: 2,
    categoria_id: "c1",
    restaurante_id: "r1",
    grupos: [],
  },
  {
    id: "p3",
    nome: "Taco de Veggie",
    descricao: "Mix de legumes grelhados, queijo feta e pesto",
    preco: 16.9,
    foto_url: "https://images.unsplash.com/photo-1592415499556-74fcb9f18667?w=400",
    ativo: true,
    ordem: 3,
    categoria_id: "c1",
    restaurante_id: "r1",
    grupos: [],
  },
  {
    id: "p4",
    nome: "Burrito Supreme",
    descricao: "Frango, arroz, feijão, cheddar, creme azedo e guacamole",
    preco: 34.9,
    foto_url: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400",
    ativo: true,
    ordem: 1,
    categoria_id: "c2",
    restaurante_id: "r1",
    grupos: [],
  },
  {
    id: "p5",
    nome: "Agua de Jamaica",
    descricao: "Chá gelado de hibisco com limão",
    preco: 9.9,
    foto_url: undefined,
    ativo: true,
    ordem: 1,
    categoria_id: "c3",
    restaurante_id: "r1",
    grupos: [],
  },
  {
    id: "p6",
    nome: "Churros com Doce de Leite",
    descricao: "3 churros crocantes com doce de leite artesanal",
    preco: 19.9,
    foto_url: "https://images.unsplash.com/photo-1624354862826-0ec92b4f6a32?w=400",
    ativo: true,
    ordem: 1,
    categoria_id: "c4",
    restaurante_id: "r1",
    grupos: [],
  },
];

export const mockMesas: Mesa[] = Array.from({ length: 12 }, (_, i) => ({
  id: `m${i + 1}`,
  numero: i + 1,
  capacidade: i % 3 === 0 ? 6 : 4,
  status: (["livre", "ocupada", "livre", "livre", "ocupada", "conta_pedida", "livre", "ocupada", "livre", "livre", "livre", "ocupada"] as const)[i],
  restaurante_id: "r1",
  pedido_aberto_id: ["ocupada", "conta_pedida"].includes(
    ["livre", "ocupada", "livre", "livre", "ocupada", "conta_pedida", "livre", "ocupada", "livre", "livre", "livre", "ocupada"][i]
  )
    ? `ped${i + 1}`
    : undefined,
  qr_code_url: `/qr/mesa-${i + 1}.png`,
}));

export const mockPedidos: Pedido[] = [
  {
    id: "ped1",
    numero: "001",
    tipo: "mesa",
    status: "em_preparo",
    mesa_id: "m2",
    mesa_numero: 2,
    restaurante_id: "r1",
    itens: [
      {
        id: "i1",
        produto_id: "p1",
        produto_nome: "Taco de Carnitas",
        quantidade: 2,
        preco_unitario: 18.9,
        preco_total: 37.8,
        variacoes: [],
      },
      {
        id: "i2",
        produto_id: "p5",
        produto_nome: "Agua de Jamaica",
        quantidade: 2,
        preco_unitario: 9.9,
        preco_total: 19.8,
        variacoes: [],
      },
    ],
    total: 57.6,
    criado_em: new Date(Date.now() - 12 * 60000).toISOString(),
    atualizado_em: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: "ped2",
    numero: "002",
    tipo: "mesa",
    status: "pendente",
    mesa_id: "m5",
    mesa_numero: 5,
    restaurante_id: "r1",
    itens: [
      {
        id: "i3",
        produto_id: "p4",
        produto_nome: "Burrito Supreme",
        quantidade: 1,
        preco_unitario: 34.9,
        preco_total: 34.9,
        variacoes: [],
      },
    ],
    total: 34.9,
    criado_em: new Date(Date.now() - 3 * 60000).toISOString(),
    atualizado_em: new Date(Date.now() - 3 * 60000).toISOString(),
  },
];

export const mockDashboard: DashboardKPI = {
  vendas_hoje: 1847.5,
  ticket_medio: 52.8,
  pedidos_hoje: 35,
  pedidos_em_aberto: 4,
  grafico_7dias: [
    { data: "Seg", total: 980 },
    { data: "Ter", total: 1240 },
    { data: "Qua", total: 890 },
    { data: "Qui", total: 1560 },
    { data: "Sex", total: 2100 },
    { data: "Sáb", total: 2800 },
    { data: "Dom", total: 1847 },
  ],
  pedidos_recentes: mockPedidos,
};

import { TableStatus, UserRole } from "@/types/domain";

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    per_page?: number;
  };
}

/* A API roda com `consider_all_requests_local` (modo dev) — dois formatos
   de erro coexistem:
   - validação de verdade, tratada pelo controller: `{ errors: string[] }`
   - erro de framework não tratado (parâmetro faltando, enum inválido...):
     a página de debug inteira do Rails, serializada em JSON
     (`{ status, error, exception, traces }`).
   `extractErrorMessage()` em `lib/api/client.ts` trata os dois. */
export interface ApiErroValidacao {
  errors: string[];
}
export interface ApiErroDebug {
  status: number;
  error: string;
  exception?: string;
}
export type ApiError =
  | ApiErroValidacao
  | ApiErroDebug
  | { erro: string }
  | { error: string; message: string; status: number };

/* Login — único endpoint de auth do app inteiro, fora do prefixo /api
   (fica em /api/v1/cliente/autenticacao/login). Payload em português. */
export interface LoginPayload {
  email: string;
  senha: string;
}

export interface AuthResponse {
  token: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    role: UserRole;
    restaurante_id: string;
    ativo: boolean;
  };
}

/* Usuários (/api/users) — payload de escrita em inglês, leitura em
   português (`nome/perfil/loja_id`) — normalizado em queries/usuarios.ts. */
export interface CriarUsuarioPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
export type AtualizarUsuarioPayload = Partial<Omit<CriarUsuarioPayload, "password">>;

/* Mesas (/api/tables) */
/* Payload real confirmado ao vivo — o exemplo do Insomnia
   (number/description) dá 422 "Numero can't be blank": o campo certo é
   `numero` (bate com a leitura), `description`/`descricao` não existe
   no modelo (não persiste em lugar nenhum), e `loja_id` é obrigatório
   na criação (não é inferido do token, mesmo padrão de /api/commands).
   No PATCH de status/numero o `loja_id` não é necessário. */
export interface CriarMesaPayload {
  numero: number;
  loja_id: string;
  capacidade?: number;
}
export interface AtualizarMesaPayload {
  numero?: number;
  capacidade?: number;
  status?: TableStatus;
}

/* Produtos (/api/products) */
export interface CriarProdutoPayload {
  name: string;
  description?: string;
  price: number;
  active?: boolean;
  exibir_na_vitrine?: boolean;
  /* Sem confirmação se o controller aceita URL direta (o app tem rotas de
     Active Storage pra upload de arquivo) — mandado best-effort, ignorado
     pelo backend se não for um campo aceito. */
  foto_url?: string;
}
export type AtualizarProdutoPayload = Partial<CriarProdutoPayload>;

/* Comandas (/api/commands) — nascem vazias, só com mesa + atendente;
   itens entram um a um. Sem endpoint de listar nem de fechar/pagar ainda. */
/* Payload real confirmado ao vivo — o exemplo do Insomnia
   (table_id/attendant_id) está errado: dá 422 "Mesa can't be blank"
   mesmo com um id de mesa válido. O nome certo do campo é `mesa_id`
   (bate com a resposta, que usa nomes em português), e `loja_id` é
   obrigatório e NÃO é inferido do token — sem ele dá "Loja must exist".
   `attendant_id`/`atendente_id` não existe: não é parâmetro aceito nem
   aparece na resposta, então não tem como registrar quem abriu a
   comanda por aqui. */
export interface AbrirComandaPayload {
  mesa_id: string;
  loja_id: string;
}
/* Payload real confirmado ao vivo — o exemplo do Insomnia
   (product_id/quantity/notes solto) dá 400 "param is missing: item":
   o corpo precisa vir dentro de uma chave `item`, e os campos internos
   são em português (bate com o resto do modelo, não com a escrita em
   inglês usada por tables/products/commands). */
export interface AdicionarItemComandaPayload {
  produto_id: string;
  quantidade: number;
  observacao?: string;
}

/* Cozinha — status por item, não por comanda inteira */
export interface AtualizarStatusItemPayload {
  status: "pendente" | "em_andamento" | "pronto";
}

/* Delivery */
export interface AtualizarStatusDeliveryPayload {
  status_delivery: string;
}

/* Checkout público real (/api/public/storefront/:slug/orders) — único
   endpoint de criação de pedido que não exige login. Confirmado ao vivo:
   só aceita pedido de delivery (endereco_entrega é obrigatório; sem ele
   dá 422 "can't be blank" — não dá pra criar pedido de mesa/balcão por
   aqui). `endereco_entrega` precisa ser objeto, não string.
   Campos aceitos e persistidos, confirmados por teste: logradouro,
   numero, complemento, bairro, cidade, cep. */
export interface EnderecoEntregaPayload {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  cep: string;
}

/* ═══════════════════════════════════════════════════════════════════════
   SUPERFÍCIE V1  (`/api/v1/cliente/*` e `/api/v1/publico/*`)

   ⚠️ NÃO CONFIRMADO AO VIVO. Toda esta seção foi derivada dos corpos de
   exemplo do arquivo Insomnia `insomnia-api-atendimento.json`, não de
   teste real contra o backend. A sessão de 2026-08-24 documentou que os
   exemplos do Insomnia erraram vários payloads na superfície antiga
   (`/api/*`) — o mesmo risco vale aqui. Ao validar rodando, ajuste os
   nomes/tipos de campo conforme o controller reclamar.

   Convenção da v1: nomes de campo em português tanto na leitura quanto
   na escrita (ao contrário da `/api/*`, que lê em pt e escreve em en).
   ═══════════════════════════════════════════════════════════════════════ */

/* Login — mesmo endpoint já em uso pelo app (queries/auth.ts). Repetido
   aqui só pra deixar a superfície v1 completa e coesa. */
export interface V1LoginPayload {
  email: string;
  senha: string;
}

/* Restaurante — GET/PUT /api/v1/cliente/restaurante (restaurante único
   do token; sem :id na rota). */
export interface V1AtualizarRestaurantePayload {
  nome?: string;
  descricao?: string;
  telefone?: string;
  taxa_servico?: number;
  cor_primaria?: string;
  logo_url?: string;
  chave_pix?: string;
  ativo?: boolean;
  /* Mapa dia→faixa de horário, ex: { "segunda": "18:00-23:00" }. Shape
     exato não confirmado. */
  horarios?: Record<string, string>;
}

/* Categorias — CRUD /api/v1/cliente/categorias (não existe na `/api/*`). */
export interface V1CriarCategoriaPayload {
  nome: string;
  descricao?: string;
  ordem?: number;
  ativa?: boolean;
}
export type V1AtualizarCategoriaPayload = Partial<V1CriarCategoriaPayload>;

/* Produtos — CRUD /api/v1/cliente/produtos. Diferente da `/api/products`:
   escrita também em português e com categoria_id/ordem/exibir_na_vitrine. */
export interface V1CriarProdutoPayload {
  nome: string;
  descricao?: string;
  preco: number;
  ativo?: boolean;
  exibir_na_vitrine?: boolean;
  categoria_id?: string | null;
  foto_url?: string;
  ordem?: number;
}
export type V1AtualizarProdutoPayload = Partial<V1CriarProdutoPayload>;

/* Usuários — /api/v1/cliente/usuarios. Campo do papel é `perfil` (não
   `role` como na escrita da `/api/users`). */
export interface V1CriarUsuarioPayload {
  nome: string;
  email: string;
  senha: string;
  perfil: UserRole;
}
export interface V1AtualizarUsuarioPayload {
  nome?: string;
  email?: string;
  perfil?: UserRole;
  ativo?: boolean;
}

/* Mesas — /api/v1/cliente/mesas. Campos em português (numero/capacidade/
   status) e ações dedicadas abrir/fechar (a `/api/tables` não tem). */
export interface V1CriarMesaPayload {
  numero: number;
  capacidade?: number;
  status?: string;
}
export interface V1AtualizarMesaPayload {
  numero?: number;
  capacidade?: number;
}
/* PATCH /api/v1/cliente/mesas/:id/fechar — corpo com a forma de pagamento
   do fechamento da conta. */
export interface V1FecharMesaPayload {
  forma_pagamento: string;
}

/* Pedidos — /api/v1/cliente/pedidos. Ao contrário da `/api/commands` (que
   nasce vazia e recebe itens um a um), aqui o pedido é criado JÁ com a
   lista de itens no mesmo corpo. */
export interface V1ItemPedidoPayload {
  produto_id: string;
  quantidade: number;
  observacao?: string;
}
export interface V1CriarPedidoPayload {
  tipo: string;
  mesa_id?: string | number | null;
  observacao?: string;
  itens: V1ItemPedidoPayload[];
}
export interface V1AtualizarStatusPedidoPayload {
  status: string;
}

/* Impressão — POST /api/v1/cliente/impressao. Enfileira a impressão de um
   pedido no backend (a `/api/*` não tem isso — o app simula com
   window.print). */
export interface V1ImpressaoPayload {
  pedido_id: string | number;
}

/* Vitrine pública v1 — POST /api/v1/publico/restaurantes/:slug/pedidos.
   Aceita pedido de qualquer `tipo` (o checkout público da `/api/*` só
   aceitava delivery). endereco_entrega segue sendo objeto. */
export interface V1CriarPedidoPublicoPayload {
  tipo: string;
  nome_cliente: string;
  telefone_cliente: string;
  observacao?: string;
  endereco_entrega?: EnderecoEntregaPayload;
  itens: V1ItemPedidoPayload[];
}

/* ═══════════════════════════════════════════════════════════════════════
   CONTA DE CLIENTE  (`/api/public/storefront/:slug/customers*` e `/me`)

   ⚠️ NÃO CONFIRMADO AO VIVO. Derivado dos exemplos do Insomnia. Hoje o
   app fingia isso 100% local (lib/store/clienteCadastro.ts +
   historicoPedidos.ts). Usa um token PRÓPRIO (`<token_cliente>`),
   separado do token de staff.
   ═══════════════════════════════════════════════════════════════════════ */
export interface CriarClientePayload {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
}
export interface LoginClientePayload {
  email: string;
  senha: string;
}

/* Resposta do cadastro/login do cliente. Nem o nome do campo do token
   (`token`? `jwt`?) nem o do objeto do cliente (`customer`? `cliente`?)
   estão confirmados — o parsing em queries/customers.ts tolera as duas
   formas. */
export interface ClienteAuthResponse {
  token?: string;
  jwt?: string;
  customer?: ClienteContaBruta;
  cliente?: ClienteContaBruta;
}
export interface ClienteContaBruta {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
}

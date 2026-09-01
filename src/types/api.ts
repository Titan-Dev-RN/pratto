import { TableStatus, UserRole } from "@/types/domain";

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
export type ApiError = ApiErroValidacao | ApiErroDebug | { erro: string };

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
export interface CriarPedidoPublicoPayload {
  nome_cliente?: string;
  telefone_cliente?: string;
  endereco_entrega: EnderecoEntregaPayload;
  items: { product_id: string; quantity: number; observacao?: string }[];
}
export interface PedidoPublicoConfirmacao {
  message: string;
  codigo_rastreio: string;
  total: number | string;
}

/* Conta do cliente final (delivery) — cadastro obrigatório antes do
   checkout, é o que vincula o pedido ao histórico do cliente (cliente_id
   no backend). Rotas: POST .../customers (cadastro), POST
   .../customers/login, GET .../me — todas em
   /api/public/storefront/:slug/. */
export interface RegistrarClientePayload {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
}
export interface LoginClientePayload {
  email: string;
  senha: string;
}
<<<<<<< HEAD

export interface CriarPedidoPayload {
  mesa_id?: string;
  tipo: "mesa" | "delivery" | "balcao";
  itens: {
    produto_id: string;
    quantidade: number;
    observacao?: string;
    variacoes_ids?: string[];
  }[];
  observacao?: string;
  nome_cliente?: string;
  telefone_cliente?: string;
  endereco_entrega?: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    cep: string;
  };
=======
export interface ClienteFinal {
  id: string;
  nome: string;
  email: string;
  telefone: string;
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
}
export interface ClienteAuthResponse {
  token: string;
  customer: ClienteFinal;
}

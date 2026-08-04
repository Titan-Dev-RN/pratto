export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    per_page?: number;
  };
}

export interface ApiError {
  error: string;
  message: string;
  status: number;
}

export interface AuthResponse {
  token: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    role: string;
    restaurante_id: string;
  };
}

export interface LoginPayload {
  email: string;
  senha: string;
}

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
}

export interface AtualizarStatusPayload {
  status: string;
}

export interface ImprimirPayload {
  pedido_id: string;
  impressora_id?: string;
}

export interface ImprimirResponse {
  sucesso: boolean;
  mensagem: string;
  job_id?: string;
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
<<<<<<< HEAD
import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import { Usuario } from "@/types/domain";
=======
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { AtualizarUsuarioPayload, CriarUsuarioPayload } from "@/types/api";
import { UserRole, Usuario } from "@/types/domain";

/* GET /api/users devolve os campos do model Rails (nome/perfil/loja_id),
   diferente do payload de escrita (name/role) e da resposta de login
   (nome/role/restaurante_id). Normaliza tudo pro shape único `Usuario`.
   Também vem `senha_digest` no JSON — ignorado aqui de propósito, nunca
   deve ser exibido em lugar nenhum. */
interface UsuarioBruto {
  id: string;
  nome: string;
  email: string;
  perfil: UserRole;
  loja_id?: string;
  ativo: boolean;
}

function normalizarUsuario(raw: UsuarioBruto): Usuario {
  return { id: raw.id, nome: raw.nome, email: raw.email, role: raw.perfil, ativo: raw.ativo, restaurante_id: raw.loja_id };
}
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59

export function useUsuarios() {
  return useQuery({
    queryKey: ["usuarios"],
<<<<<<< HEAD
    queryFn: () => apiGet<ApiResponse<Usuario[]>>("/cliente/usuarios", true),
=======
    queryFn: async () => (await apiGet<UsuarioBruto[]>("/users")).map(normalizarUsuario),
    staleTime: 30_000,
  });
}

export function useUsuario(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["usuario", id],
    queryFn: async () => normalizarUsuario(await apiGet<UsuarioBruto>(`/users/${id}`)),
    enabled: options?.enabled ?? true,
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
  });
}

export function useCriarUsuario() {
  const qc = useQueryClient();
  return useMutation({
<<<<<<< HEAD
    mutationFn: (dados: { nome: string; email: string; senha: string; perfil: string }) =>
      apiPost<ApiResponse<Usuario>>("/cliente/usuarios", dados, true),
=======
    mutationFn: (payload: CriarUsuarioPayload) => apiPost<UsuarioBruto>("/users", payload),
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
    onSuccess: () => qc.invalidateQueries({ queryKey: ["usuarios"] }),
  });
}

export function useAtualizarUsuario() {
  const qc = useQueryClient();
  return useMutation({
<<<<<<< HEAD
    mutationFn: ({ id, dados }: { id: string; dados: Partial<{ nome: string; email: string; perfil: string; ativo: boolean }> }) =>
      apiPatch<ApiResponse<Usuario>>(`/cliente/usuarios/${id}`, dados),
=======
    mutationFn: ({ id, payload }: { id: string; payload: AtualizarUsuarioPayload }) =>
      apiPatch<UsuarioBruto>(`/users/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["usuarios"] }),
  });
}

/* DELETE = "inativar" no backend (soft delete, ver Insomnia) — não some
   da lista, só marca ativo:false. */
export function useInativarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete<void>(`/users/${id}`),
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
    onSuccess: () => qc.invalidateQueries({ queryKey: ["usuarios"] }),
  });
}

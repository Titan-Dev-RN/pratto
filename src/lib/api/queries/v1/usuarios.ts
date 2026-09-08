import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut } from "@/lib/api/client";
import { V1AtualizarUsuarioPayload, V1CriarUsuarioPayload } from "@/types/api";
import { UserRole, Usuario } from "@/types/domain";

/* Superfície V1 — GET/POST/PUT /api/v1/cliente/usuarios.

   ⚠️ NÃO CONFIRMADO AO VIVO. O Insomnia não documenta DELETE aqui (a
   `/api/users` tem — soft delete). Campo do papel é `perfil` na v1 (a
   `/api/users` escreve `role`). Normaliza pro shape único `Usuario`
   (que usa `role`). */

const KEY = ["v1", "usuarios"];

interface UsuarioV1Bruto {
  id: string;
  nome: string;
  email: string;
  perfil: UserRole;
  ativo: boolean;
}

function normalizar(raw: UsuarioV1Bruto): Usuario {
  return { id: raw.id, nome: raw.nome, email: raw.email, role: raw.perfil, ativo: raw.ativo };
}

export function useUsuariosV1() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => (await apiGet<UsuarioV1Bruto[]>("/v1/cliente/usuarios")).map(normalizar),
    staleTime: 30_000,
  });
}

export function useCriarUsuarioV1() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: V1CriarUsuarioPayload) => apiPost<UsuarioV1Bruto>("/v1/cliente/usuarios", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useAtualizarUsuarioV1() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: V1AtualizarUsuarioPayload }) =>
      apiPut<UsuarioV1Bruto>(`/v1/cliente/usuarios/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

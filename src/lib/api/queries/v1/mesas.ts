import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/api/client";
import { V1AtualizarMesaPayload, V1CriarMesaPayload, V1FecharMesaPayload } from "@/types/api";
import { MesaV1 } from "@/types/domain";

/* Superfície V1 — CRUD /api/v1/cliente/mesas + ações dedicadas
   PATCH /mesas/:id/abrir e PATCH /mesas/:id/fechar.

   ⚠️ NÃO CONFIRMADO AO VIVO. A `/api/tables` não tem abrir/fechar (lá o
   status muda por PATCH direto) nem exige `loja_id` na v1 (o token já
   identifica o restaurante — provável, não confirmado). `abrir` não tem
   corpo; `fechar` recebe `{ forma_pagamento }`. */

const KEY = ["v1", "mesas"];

export function useMesasV1() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => apiGet<MesaV1[]>("/v1/cliente/mesas"),
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}

export function useMesaV1(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["v1", "mesa", id],
    queryFn: () => apiGet<MesaV1>(`/v1/cliente/mesas/${id}`),
    enabled: (options?.enabled ?? true) && !!id,
  });
}

export function useCriarMesaV1() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: V1CriarMesaPayload) => apiPost<MesaV1>("/v1/cliente/mesas", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useAtualizarMesaV1() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: V1AtualizarMesaPayload }) =>
      apiPut<MesaV1>(`/v1/cliente/mesas/${id}`, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["v1", "mesa", id] });
    },
  });
}

export function useExcluirMesaV1() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete<void>(`/v1/cliente/mesas/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useAbrirMesaV1() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPatch<MesaV1>(`/v1/cliente/mesas/${id}/abrir`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useFecharMesaV1() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: V1FecharMesaPayload }) =>
      apiPatch<MesaV1>(`/v1/cliente/mesas/${id}/fechar`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

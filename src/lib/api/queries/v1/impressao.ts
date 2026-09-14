import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/api/client";
import { V1ImpressaoPayload } from "@/types/api";

/* Superfície V1 — POST /api/v1/cliente/impressao.

   ⚠️ NÃO CONFIRMADO AO VIVO. Enfileira a impressão de um pedido no
   backend (provavelmente numa impressora térmica configurada no
   restaurante). A `/api/*` não tem isso — o app usa window.print() via
   components/ui/Imprimivel.tsx. Resposta assumida `{ message }`. */
export function useEnviarImpressao() {
  return useMutation({
    mutationFn: (payload: V1ImpressaoPayload) => apiPost<{ message?: string }>("/v1/cliente/impressao", payload),
  });
}

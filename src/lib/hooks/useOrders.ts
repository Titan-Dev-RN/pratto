"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

/* Canal de tempo real (Action Cable) — não confirmado no contrato de API
   recebido do backend. O hook tenta conectar de forma best-effort; se não
   houver servidor de WebSocket, ele falha silenciosamente e tenta de novo
   a cada 5s. A lista de pedidos/mesas já se mantém atualizada via
   refetchInterval e invalidação após mutações, então esse hook é só um
   "bônus" de atualização mais rápida quando/se o backend oferecer o canal. */

interface UseOrdersOptions {
  onNovoPedido?: (pedido: unknown) => void;
  onStatusAtualizado?: (pedido: unknown) => void;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001/cable";

export function useOrders({ onNovoPedido, onStatusAtualizado }: UseOrdersOptions = {}) {
  const qc = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /* Guarda a versão mais recente de `connect` num ref pra poder chamá-la
     recursivamente (reconexão) sem referenciar a própria const antes de
     ela ser declarada. */
  const connectRef = useRef<() => void>(() => {});

  const invalidate = useCallback(() => {
    /* Chaves da superfície V1 (em uso) + as antigas (fallback/telas
       ainda não migradas). */
    qc.invalidateQueries({ queryKey: ["v1", "pedidos"] });
    qc.invalidateQueries({ queryKey: ["v1", "mesas"] });
    qc.invalidateQueries({ queryKey: ["kitchen-orders"] });
    qc.invalidateQueries({ queryKey: ["mesas"] });
    qc.invalidateQueries({ queryKey: ["comanda"] });
  }, [qc]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("pratto_token") : null;
    if (!token) return; // sem sessão, não tenta conectar

    const url = `${WS_URL}?token=${token}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      /* Assina o canal de pedidos, caso exista no backend */
      ws.send(
        JSON.stringify({
          command: "subscribe",
          identifier: JSON.stringify({ channel: "PedidosChannel" }),
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string);
        if (msg.type === "ping" || msg.type === "welcome" || msg.type === "confirm_subscription") return;

        const payload = msg.message;
        if (!payload) return;

        if (payload.event === "novo_pedido") {
          invalidate();
          onNovoPedido?.(payload.pedido);
        } else if (payload.event === "status_atualizado") {
          invalidate();
          qc.invalidateQueries({ queryKey: ["comanda", payload.pedido?.id] });
          onStatusAtualizado?.(payload.pedido);
        }
      } catch {
        /* mensagem não-JSON — ignora */
      }
    };

    ws.onclose = () => {
      reconnectTimer.current = setTimeout(() => connectRef.current(), 5_000);
    };

    ws.onerror = () => ws.close();
  }, [invalidate, onNovoPedido, onStatusAtualizado, qc]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const isConnected = () => wsRef.current?.readyState === WebSocket.OPEN;

  return { isConnected };
}

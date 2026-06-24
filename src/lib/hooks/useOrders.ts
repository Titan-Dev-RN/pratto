"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface UseOrdersOptions {
  restauranteId: string;
  onNovoPedido?: (pedido: unknown) => void;
  onStatusAtualizado?: (pedido: unknown) => void;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001/cable";

export function useOrders({ restauranteId, onNovoPedido, onStatusAtualizado }: UseOrdersOptions) {
  const qc = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["pedidos", restauranteId] });
    qc.invalidateQueries({ queryKey: ["mesas", restauranteId] });
  }, [qc, restauranteId]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("pratto_token") : null;
    const url = token ? `${WS_URL}?token=${token}` : WS_URL;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      /* Assina o canal de pedidos do restaurante via Action Cable */
      ws.send(
        JSON.stringify({
          command: "subscribe",
          identifier: JSON.stringify({
            channel: "PedidosChannel",
            restaurante_id: restauranteId,
          }),
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
          qc.invalidateQueries({ queryKey: ["pedido", payload.pedido?.id] });
          onStatusAtualizado?.(payload.pedido);
        }
      } catch {
        /* mensagem não-JSON — ignora */
      }
    };

    ws.onclose = () => {
      /* Reconecta em 5s se fechou inesperadamente */
      reconnectTimer.current = setTimeout(connect, 5_000);
    };

    ws.onerror = () => ws.close();
  }, [restauranteId, invalidate, onNovoPedido, onStatusAtualizado, qc]);

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

"use client";

import { create } from "zustand";
import { useEffect } from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  add: (toast: Omit<Toast, "id">) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  add: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    if (toast.duration !== 0) {
      setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), toast.duration ?? 5000);
    }
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (title: string, message?: string) =>
    useToastStore.getState().add({ type: "success", title, message }),
  error: (title: string, message?: string, action?: Toast["action"]) =>
    useToastStore.getState().add({ type: "error", title, message, action, duration: 0 }),
  warning: (title: string, message?: string) =>
    useToastStore.getState().add({ type: "warning", title, message }),
  info: (title: string, message?: string) =>
    useToastStore.getState().add({ type: "info", title, message }),
};

const icons: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

const colors: Record<ToastType, string> = {
  success: "bg-green-50 border-green-400 text-green-800",
  error: "bg-red-50 border-red-400 text-red-800",
  warning: "bg-amber-50 border-amber-400 text-amber-800",
  info: "bg-blue-50 border-blue-400 text-blue-800",
};

const iconColors: Record<ToastType, string> = {
  success: "bg-green-500 text-white",
  error: "bg-red-500 text-white",
  warning: "bg-amber-500 text-white",
  info: "bg-blue-500 text-white",
};

function ToastItem({ toast: t }: { toast: Toast }) {
  const remove = useToastStore((s) => s.remove);
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg max-w-sm w-full animate-in slide-in-from-right-5 ${colors[t.type]}`}
      role="alert"
    >
      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${iconColors[t.type]}`}>
        {icons[t.type]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{t.title}</p>
        {t.message && <p className="text-xs mt-0.5 opacity-80">{t.message}</p>}
        {t.action && (
          <button
            className="text-xs font-semibold underline mt-1 hover:no-underline"
            onClick={() => { t.action!.onClick(); remove(t.id); }}
          >
            {t.action.label}
          </button>
        )}
      </div>
      <button
        className="flex-shrink-0 opacity-60 hover:opacity-100 text-lg leading-none"
        onClick={() => remove(t.id)}
        aria-label="Fechar"
      >
        ×
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  );
}

export function useConnectionStatus() {
  useEffect(() => {
    const handleOffline = () =>
      toast.error("Sem conexão", "Verifique sua internet e tente novamente.");
    const handleOnline = () =>
      toast.success("Conexão restabelecida", "Você está online novamente.");

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);
}

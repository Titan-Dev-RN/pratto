"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserRole } from "@/types/domain";

interface SessionUser {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  restaurante_id: string;
}

interface SessionState {
  token: string | null;
  usuario: SessionUser | null;
  setSession: (token: string, usuario: SessionUser) => void;
  clearSession: () => void;
  isAuthed: () => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      token: null,
      usuario: null,

      setSession: (token, usuario) => {
        if (typeof window !== "undefined") localStorage.setItem("pratto_token", token);
        set({ token, usuario });
      },

      clearSession: () => {
        if (typeof window !== "undefined") localStorage.removeItem("pratto_token");
        set({ token: null, usuario: null });
      },

      isAuthed: () => !!get().token,

      hasRole: (role) => {
        const u = get().usuario;
        if (!u) return false;
        return Array.isArray(role) ? role.includes(u.role) : u.role === role;
      },
    }),
    { name: "pratto-session" }
  )
);

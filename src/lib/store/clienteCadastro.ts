"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/* Cadastro do cliente pra delivery — simulado de propósito (sem
   endpoint de conta de cliente na API; o checkout de delivery em si já
   é real, mas criar "conta" não). Serve só pra: (1) deixar a exigência
   de "cadastro antes de pedir" visível e (2) evitar pedir nome/telefone
   de novo na tela de endereço, já que o checkout real exige os dois. */
interface ClienteCadastroState {
  nome: string;
  telefone: string;
  email: string;
  cadastrado: boolean;
  salvar: (dados: { nome: string; telefone: string; email: string }) => void;
}

export const useClienteCadastroStore = create<ClienteCadastroState>()(
  persist(
    (set) => ({
      nome: "",
      telefone: "",
      email: "",
      cadastrado: false,
      salvar: (dados) => set({ ...dados, cadastrado: true }),
    }),
    { name: "pratto-cliente-cadastro" }
  )
);

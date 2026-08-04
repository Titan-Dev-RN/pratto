export type MetodoPagamento = "pix" | "cartao" | "dinheiro";

export const metodosPagamento: { key: MetodoPagamento; label: string }[] = [
  { key: "pix", label: "Pix" },
  { key: "cartao", label: "Cartão" },
  { key: "dinheiro", label: "Dinheiro" },
];

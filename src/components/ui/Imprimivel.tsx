"use client";

/* Impressão real (cozinha #1) — o conteúdo só aparece na folha impressa
   (ver regra @media print em globals.css); na tela fica sempre oculto.
   `imprimir()` abre o diálogo nativo do navegador: o usuário escolhe a
   impressora configurada ou "Salvar como PDF". */
export function Imprimivel({ children }: { children: React.ReactNode }) {
  return (
    <div id="pratto-print-area" className="hidden print:block">
      {children}
    </div>
  );
}

export function imprimir() {
  window.print();
}

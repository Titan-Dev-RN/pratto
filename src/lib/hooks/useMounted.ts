import { useSyncExternalStore } from "react";

/* Protege contra hydration mismatch quando o render depende de estado que
   só existe no cliente (ex.: sessão vinda de localStorage via zustand
   persist) — no servidor esse estado começa sempre vazio, então qualquer
   JSX condicionado a ele precisa esperar o componente montar antes de
   usar o valor real, senão o HTML do SSR diverge do primeiro render do
   cliente.

   useSyncExternalStore com getServerSnapshot é o jeito oficial do React
   de resolver isso: no SSR e na primeira passada de hydration ele usa
   getServerSnapshot (false); só depois de montar passa a usar getSnapshot
   (true) — sem precisar de setState dentro de useEffect. */
function subscribe() {
  return () => {};
}

export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}

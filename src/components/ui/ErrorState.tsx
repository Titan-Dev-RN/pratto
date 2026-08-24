import { Button } from "@/components/ui/Button";

interface ErrorStateProps {
  titulo?: string;
  mensagem?: string;
  onRetry?: () => void;
}

/* Estado de erro padrão pra quando um GET falha (ex: API fora do ar).
   Usar dentro do mesmo container onde o conteúdo normal apareceria. */
export function ErrorState({
  titulo = "Não foi possível carregar",
  mensagem = "Verifique sua conexão e tente novamente.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="text-center py-16 text-neutral-400">
      <p className="text-4xl mb-3">⚠️</p>
      <p className="font-semibold text-sm text-neutral-600">{titulo}</p>
      <p className="text-sm mt-1">{mensagem}</p>
      {onRetry && (
        <Button theme="team" variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

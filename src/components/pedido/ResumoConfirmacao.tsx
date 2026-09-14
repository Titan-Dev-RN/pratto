import { ItemSacola } from "@/types/domain";
import { formatBRL } from "@/lib/utils";

interface ResumoConfirmacaoProps {
  previsao: string;
  itens: ItemSacola[];
  total: number;
  metodoPagamento: string;
  localLabel: string;
  localDetalhe: string;
  /* Sem chave Pix real pra pedido de delivery (sem endpoint de dados do
     restaurante na API pública) — só mostra a seção quando fornecida. */
  chavePix?: string;
}

export function ResumoConfirmacao({
  previsao,
  itens,
  total,
  metodoPagamento,
  localLabel,
  localDetalhe,
  chavePix,
}: ResumoConfirmacaoProps) {
  return (
    <div className="bg-white rounded-2xl p-5 w-full max-w-xs border border-neutral-100 text-left text-sm flex flex-col gap-3.5">
      <div>
        <p className="font-semibold text-neutral-700 mb-0.5">⏱ Previsão média</p>
        <p className="text-neutral-500">{previsao}</p>
      </div>

      <div>
        <p className="font-semibold text-neutral-700 mb-0.5">🧾 Descrição</p>
        <ul className="text-neutral-500 flex flex-col gap-0.5">
          {itens.map((item, i) => (
            <li key={i}>
              {item.quantidade}× {item.produto.nome}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="font-semibold text-neutral-700 mb-0.5">💰 Valor</p>
        <p className="text-neutral-500">{formatBRL(total)}</p>
      </div>

      <div>
        <p className="font-semibold text-neutral-700 mb-0.5">💳 Método de pagamento</p>
        <p className="text-neutral-500">{metodoPagamento}</p>
      </div>

      <div>
        <p className="font-semibold text-neutral-700 mb-0.5">📍 {localLabel}</p>
        <p className="text-neutral-500">{localDetalhe}</p>
      </div>

      {chavePix && (
        <div className="border-t border-neutral-100 pt-3">
          <p className="font-semibold text-neutral-700 mb-0.5">🔑 Chave Pix da loja</p>
          <p className="text-neutral-500">{chavePix}</p>
          <p className="text-neutral-400 text-xs mt-1.5">
            Guarde esses dados: mesmo que o pedido já esteja no sistema da loja, use-os para conferir com o atendimento online antes de pagar, seja qual for o método escolhido.
          </p>
        </div>
      )}
    </div>
  );
}

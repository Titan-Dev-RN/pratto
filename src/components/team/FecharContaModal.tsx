"use client";

import { useMemo, useState } from "react";
import { Mesa } from "@/types/domain";
import { useComanda } from "@/lib/api/queries/comandas";
import { useAtualizarMesa } from "@/lib/api/queries/mesas";
import { useProdutos } from "@/lib/api/queries/menu";
import { useSessionStore } from "@/lib/store/session";
import { useCaixaStore } from "@/lib/store/caixa";
import { FormaPagamento, PagamentoRegistrado } from "@/types/domain";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { formatBRL, formatarHora } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import { useFecharMesa } from "@/lib/api/queries/mesas";
import { useImprimir } from "@/lib/api/queries/orders";
import { apiErrorMessage } from "@/lib/api/client";

/* Módulo de caixa (funções 2, 3 e 5 + FA-01/FA-02) — sem endpoint de
   fechar comanda/pagamento no backend ainda: a "consolidação da venda"
   (desconto/acréscimo por item, taxa de serviço), o split de pagamento,
   o rateio e a recusa de cartão são simulados 100% no front e registrados
   na sessão de caixa local (ver lib/store/caixa.ts). O único efeito real
   no backend é liberar a mesa (PATCH /api/tables/:id status=livre) quando
   a venda inteira estiver paga. */

const formasPagamento: { key: FormaPagamento; label: string; icon: string }[] = [
  { key: "dinheiro", label: "Dinheiro", icon: "💵" },
  { key: "credito", label: "Crédito", icon: "💳" },
  { key: "debito", label: "Débito", icon: "💳" },
  { key: "pix", label: "PIX", icon: "⚡" },
];

const TOLERANCIA = 0.02;

interface AjusteItem {
  desconto: number;
  acrescimo: number;
}

interface Grupo {
  id: string;
  nome: string;
  subtotal: number;
  itemIds: string[];
}

interface Tentativa {
  id: string;
  forma: FormaPagamento;
  valor: number;
  recusada: boolean;
}

type Step = "revisao" | "rateio" | "pagamento" | "resumo";
type ModoRateio = "nenhum" | "igual" | "itens";

interface Props {
  mesa: Mesa;
  comandaId: string;
  onFechar: () => void;
  onContaFechada: (mesaId: string) => void;
}

export function FecharContaModal({ mesa, comandaId, onFechar, onContaFechada }: Props) {
  const { usuario } = useSessionStore();
  const { data: comanda, isLoading } = useComanda(comandaId);
  const { data: produtos } = useProdutos();
  const atualizarMesa = useAtualizarMesa();
  const registrarVenda = useCaixaStore((s) => s.registrarVenda);
  const sessaoAberta = useCaixaStore((s) => (usuario ? s.sessaoAberta(usuario.id) : null));

<<<<<<< HEAD
export function FecharContaModal({ mesa, pedido, restauranteNome, onFechar, onContaFechada }: Props) {
  const [step, setStep] = useState<Step>("pagamento");
  const [formaPagamento, setFormaPagamento] = useState<Pagamento | null>(null);
  const [valorRecebido, setValorRecebido] = useState("");
  const cupomRef = useRef<HTMLDivElement>(null);

  const fecharMesa = useFecharMesa();
  const imprimir = useImprimir();

  const total = pedido.total;
  const troco =
    formaPagamento === "dinheiro" && valorRecebido
      ? Math.max(0, parseFloat(valorRecebido.replace(",", ".")) - total)
      : null;

  async function confirmarFechamento() {
    if (!formaPagamento) return;
    try {
      await fecharMesa.mutateAsync({ id: mesa.id, forma_pagamento: formaPagamento });
      setStep("cupom");
    } catch (err) {
      toast.error("Erro ao fechar conta", apiErrorMessage(err));
    }
  }

  async function imprimirCupom() {
    try {
      await imprimir.mutateAsync({ pedido_id: pedido.id });
      toast.success("Enviado para impressão!", "Cupom impresso com sucesso.");
    } catch (err) {
      toast.error("Não foi possível imprimir", apiErrorMessage(err));
    }
=======
  const [step, setStep] = useState<Step>("revisao");
  const [ajustes, setAjustes] = useState<Record<string, AjusteItem>>({});
  const [taxaServicoPct, setTaxaServicoPct] = useState(10);
  const [modoRateio, setModoRateio] = useState<ModoRateio>("nenhum");
  const [nPessoas, setNPessoas] = useState(2);
  const [grupoPorItem, setGrupoPorItem] = useState<Record<string, string>>({});
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoAtualIndex, setGrupoAtualIndex] = useState(0);
  const [tentativasPorGrupo, setTentativasPorGrupo] = useState<Record<string, Tentativa[]>>({});
  const [formaEmEdicao, setFormaEmEdicao] = useState<FormaPagamento | null>(null);
  const [valorEmEdicao, setValorEmEdicao] = useState("");
  const [finalizando, setFinalizando] = useState(false);
  const [fechado, setFechado] = useState(false);

  const nomeProduto = (produtoId: string) => produtos?.find((p) => p.id === produtoId)?.nome ?? "Produto";

  const itens = useMemo(() => comanda?.item_comandas ?? [], [comanda]);

  const totais = useMemo(() => {
    let subtotal = 0;
    let descontos = 0;
    let acrescimos = 0;
    for (const item of itens) {
      const bruto = item.preco_unitario * item.quantidade;
      const ajuste = ajustes[item.id] ?? { desconto: 0, acrescimo: 0 };
      subtotal += bruto;
      descontos += ajuste.desconto;
      acrescimos += ajuste.acrescimo;
    }
    const base = Math.max(0, subtotal - descontos + acrescimos);
    const taxaServico = (base * taxaServicoPct) / 100;
    return { subtotal, descontos, acrescimos, taxaServico, total: base + taxaServico };
  }, [itens, ajustes, taxaServicoPct]);

  function valorAjustadoItem(itemId: string): number {
    const item = itens.find((i) => i.id === itemId);
    if (!item) return 0;
    const ajuste = ajustes[itemId] ?? { desconto: 0, acrescimo: 0 };
    return item.preco_unitario * item.quantidade - ajuste.desconto + ajuste.acrescimo;
  }

  function montarGrupos() {
    if (modoRateio === "nenhum") {
      setGrupos([{ id: "unico", nome: "Conta inteira", subtotal: totais.total, itemIds: itens.map((i) => i.id) }]);
    } else if (modoRateio === "igual") {
      const porPessoa = totais.total / nPessoas;
      const lista: Grupo[] = Array.from({ length: nPessoas }, (_, i) => ({
        id: `p${i + 1}`,
        nome: `Pessoa ${i + 1}`,
        subtotal: i === nPessoas - 1 ? totais.total - porPessoa * (nPessoas - 1) : porPessoa,
        itemIds: [],
      }));
      setGrupos(lista);
    } else {
      const letras = Array.from(new Set(itens.map((i) => grupoPorItem[i.id] ?? "A"))).sort();
      const lista: Grupo[] = letras.map((letra) => {
        const idsDoGrupo = itens.filter((i) => (grupoPorItem[i.id] ?? "A") === letra).map((i) => i.id);
        const subtotalBruto = idsDoGrupo.reduce((acc, id) => acc + valorAjustadoItem(id), 0);
        const taxaDoGrupo = totais.subtotal - totais.descontos + totais.acrescimos > 0
          ? (subtotalBruto / (totais.subtotal - totais.descontos + totais.acrescimos)) * totais.taxaServico
          : 0;
        return { id: letra, nome: `Grupo ${letra}`, subtotal: subtotalBruto + taxaDoGrupo, itemIds: idsDoGrupo };
      });
      setGrupos(lista);
    }
    setGrupoAtualIndex(0);
    setTentativasPorGrupo({});
    setStep("pagamento");
  }

  const grupoAtual = grupos[grupoAtualIndex];
  const tentativasAtual = grupoAtual ? tentativasPorGrupo[grupoAtual.id] ?? [] : [];
  const pagoAtual = tentativasAtual.filter((t) => !t.recusada).reduce((acc, t) => acc + t.valor, 0);
  const restanteAtual = grupoAtual ? Math.max(0, grupoAtual.subtotal - pagoAtual) : 0;
  const grupoQuitado = grupoAtual ? restanteAtual <= TOLERANCIA : false;

  function abrirEdicaoPagamento(forma: FormaPagamento) {
    setFormaEmEdicao(forma);
    setValorEmEdicao(restanteAtual > 0 ? restanteAtual.toFixed(2).replace(".", ",") : "");
  }

  /* FA-02: cartão recusado. Sem gateway real, simula o resultado — a
     tentativa recusada fica registrada (auditável) mas não conta pro
     total pago; a mesa continua "fechando" até uma forma ser aprovada. */
  function confirmarPagamento(aprovado: boolean) {
    if (!formaEmEdicao || !grupoAtual) return;
    const valor = parseFloat(valorEmEdicao.replace(",", ".")) || 0;
    if (valor <= 0) return;

    const tentativa: Tentativa = { id: crypto.randomUUID(), forma: formaEmEdicao, valor, recusada: !aprovado };
    setTentativasPorGrupo((s) => ({ ...s, [grupoAtual.id]: [...(s[grupoAtual.id] ?? []), tentativa] }));
    setFormaEmEdicao(null);
    setValorEmEdicao("");

    if (!aprovado) {
      toast.error("Pagamento recusado", "Peça outra forma de pagamento ao cliente.");
    }
  }

  function proximoGrupoOuFinalizar() {
    if (grupoAtualIndex < grupos.length - 1) {
      setGrupoAtualIndex((i) => i + 1);
    } else {
      finalizarFechamento();
    }
  }

  async function finalizarFechamento() {
    if (!usuario) return;
    setFinalizando(true);
    try {
      /* Registra a venda consolidada na sessão de caixa (função 2/3) */
      const pagamentos: PagamentoRegistrado[] = grupos.flatMap((g) =>
        (tentativasPorGrupo[g.id] ?? [])
          .filter((t) => !t.recusada)
          .map((t) => ({ id: t.id, forma: t.forma, valor: t.valor }))
      );
      registrarVenda(usuario.id, {
        comanda_id: comandaId,
        mesa_numero: mesa.numero,
        subtotal: totais.subtotal,
        descontos: totais.descontos,
        acrescimos: totais.acrescimos,
        taxa_servico: totais.taxaServico,
        total: totais.total,
        pagamentos,
      });

      /* Único efeito real no backend: libera a mesa. Ainda não existe
         endpoint pra marcar a comanda como paga — ver INTEGRACAO_API.md. */
      await atualizarMesa.mutateAsync({ id: mesa.id, payload: { status: "livre" } });
      setFechado(true);
      setStep("resumo");
    } catch {
      toast.error("Erro ao liberar a mesa", "A venda foi registrada, mas tente liberar a mesa de novo.");
    } finally {
      setFinalizando(false);
    }
  }

  function imprimirCupom() {
    toast.success("Enviado para impressão!", "Cupom impresso com sucesso.");
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
    onContaFechada(mesa.id);
  }

  const troco =
    formaEmEdicao === "dinheiro" && valorEmEdicao
      ? Math.max(0, (parseFloat(valorEmEdicao.replace(",", ".")) || 0) - restanteAtual)
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={fechado ? undefined : onFechar}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      <div
        className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {!sessaoAberta ? (
          <div className="p-6 text-center">
            <p className="text-3xl mb-2">🔒</p>
            <h2 className="font-bold text-neutral-900 mb-1">Abra o caixa primeiro</h2>
            <p className="text-sm text-neutral-500 mb-5">
              É preciso ter uma sessão de caixa aberta (com fundo de troco) pra receber pagamentos.
            </p>
            <Button theme="team" fullWidth onClick={onFechar}>Entendi</Button>
          </div>
        ) : isLoading || !comanda ? (
          <div className="p-10 flex justify-center"><Spinner /></div>
        ) : step === "revisao" ? (
          <>
            <div className="p-5 border-b border-neutral-100">
              <h2 className="font-bold text-neutral-900 text-lg">Fechar conta</h2>
              <p className="text-sm text-neutral-500">Mesa {mesa.numero} · Comanda #{comanda.numero ?? comanda.id.slice(0, 8)}</p>
            </div>

            <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-4">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                Itens consumidos — toque pra ajustar desconto/acréscimo
              </p>
              <ul className="flex flex-col gap-2">
                {itens.map((item) => {
                  const ajuste = ajustes[item.id] ?? { desconto: 0, acrescimo: 0 };
                  return (
                    <li key={item.id} className="border border-neutral-100 rounded-xl p-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-700">
                          <span className="font-semibold text-team-600">{item.quantidade}×</span>{" "}
                          {nomeProduto(item.produto_id)}
                        </span>
                        <span className="font-medium text-neutral-800">
                          {formatBRL(item.quantidade * item.preco_unitario)}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="Desconto R$"
                          value={ajuste.desconto || ""}
                          onChange={(e) =>
                            setAjustes((a) => ({
                              ...a,
                              [item.id]: { ...ajuste, desconto: parseFloat(e.target.value) || 0 },
                            }))
                          }
                          className="w-1/2 px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs focus:outline-none focus:ring-1 focus:ring-team-400"
                        />
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="Acréscimo R$"
                          value={ajuste.acrescimo || ""}
                          onChange={(e) =>
                            setAjustes((a) => ({
                              ...a,
                              [item.id]: { ...ajuste, acrescimo: parseFloat(e.target.value) || 0 },
                            }))
                          }
                          className="w-1/2 px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs focus:outline-none focus:ring-1 focus:ring-team-400"
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Taxa de serviço</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={taxaServicoPct}
                    onChange={(e) => setTaxaServicoPct(parseFloat(e.target.value) || 0)}
                    className="w-14 px-2 py-1 rounded-lg border border-neutral-200 text-xs text-right"
                  />
                  <span className="text-neutral-400">%</span>
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-3 flex flex-col gap-1 text-sm">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span><span>{formatBRL(totais.subtotal)}</span>
                </div>
                {totais.descontos > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Descontos</span><span>-{formatBRL(totais.descontos)}</span>
                  </div>
                )}
                {totais.acrescimos > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Acréscimos</span><span>+{formatBRL(totais.acrescimos)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-500">
                  <span>Taxa de serviço</span><span>+{formatBRL(totais.taxaServico)}</span>
                </div>
                <div className="flex justify-between font-bold text-neutral-900 text-base pt-1">
                  <span>Total</span><span>{formatBRL(totais.total)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-neutral-100 flex flex-col gap-2">
              <Button
                theme="team"
                variant="secondary"
                fullWidth
                onClick={() => toast.success("Enviado para impressão!", "Conta de conferência impressa.")}
              >
                🖨️ Imprimir conta
              </Button>
              <Button theme="team" fullWidth size="lg" onClick={() => setStep("rateio")}>
                Continuar · {formatBRL(totais.total)}
              </Button>
              <button onClick={onFechar} className="text-sm text-neutral-400 hover:text-neutral-600 py-1.5 text-center">
                Cancelar
              </button>
            </div>
          </>
        ) : step === "rateio" ? (
          <>
            <div className="p-5 border-b border-neutral-100">
              <h2 className="font-bold text-neutral-900 text-lg">Dividir a conta?</h2>
              <p className="text-sm text-neutral-500">Total {formatBRL(totais.total)}</p>
            </div>
            <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-2">
                {[
                  { key: "nenhum" as ModoRateio, label: "Não dividir", desc: "Uma única cobrança do valor total" },
                  { key: "igual" as ModoRateio, label: "Divisão igualitária", desc: "Valor total ÷ número de pessoas" },
                  { key: "itens" as ModoRateio, label: "Divisão por itens", desc: "Escolha quais itens vão pra cada pessoa" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setModoRateio(opt.key)}
                    className={`text-left p-3 rounded-xl border-2 transition-colors ${
                      modoRateio === opt.key ? "border-team-500 bg-team-50" : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <p className="text-sm font-semibold text-neutral-800">{opt.label}</p>
                    <p className="text-xs text-neutral-500">{opt.desc}</p>
                  </button>
                ))}
              </div>

              {modoRateio === "igual" && (
                <div>
                  <label className="text-sm font-medium text-neutral-700">Número de pessoas</label>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => setNPessoas((n) => Math.max(2, n - 1))}
                      className="w-9 h-9 rounded-full bg-neutral-100 font-bold text-neutral-600"
                    >
                      −
                    </button>
                    <span className="font-bold text-lg w-8 text-center">{nPessoas}</span>
                    <button
                      onClick={() => setNPessoas((n) => n + 1)}
                      className="w-9 h-9 rounded-full bg-neutral-100 font-bold text-neutral-600"
                    >
                      +
                    </button>
                    <span className="text-sm text-neutral-500 ml-2">
                      {formatBRL(totais.total / nPessoas)} cada
                    </span>
                  </div>
                </div>
              )}

              {modoRateio === "itens" && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-neutral-500">Toque nas letras pra atribuir cada item a uma pessoa.</p>
                  {itens.map((item) => {
                    const letraAtual = grupoPorItem[item.id] ?? "A";
                    return (
                      <div key={item.id} className="flex items-center justify-between border border-neutral-100 rounded-xl p-2.5">
                        <span className="text-sm text-neutral-700">
                          {item.quantidade}× {nomeProduto(item.produto_id)}
                        </span>
                        <div className="flex gap-1">
                          {["A", "B", "C", "D"].map((letra) => (
                            <button
                              key={letra}
                              onClick={() => setGrupoPorItem((g) => ({ ...g, [item.id]: letra }))}
                              className={`w-7 h-7 rounded-lg text-xs font-bold ${
                                letraAtual === letra ? "bg-team-500 text-white" : "bg-neutral-100 text-neutral-500"
                              }`}
                            >
                              {letra}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-neutral-100 flex flex-col gap-2">
              <Button theme="team" fullWidth size="lg" onClick={montarGrupos}>Continuar</Button>
              <button onClick={() => setStep("revisao")} className="text-sm text-neutral-400 hover:text-neutral-600 py-1.5 text-center">
                Voltar
              </button>
            </div>
          </>
        ) : step === "pagamento" && grupoAtual ? (
          <>
            <div className="p-5 border-b border-neutral-100">
              <h2 className="font-bold text-neutral-900 text-lg">Pagamento</h2>
              <p className="text-sm text-neutral-500">
                {grupos.length > 1 ? `${grupoAtual.nome} (${grupoAtualIndex + 1}/${grupos.length}) · ` : ""}
                Mesa {mesa.numero}
              </p>
            </div>

            <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-4">
              <div className="bg-neutral-50 rounded-xl p-4 flex justify-between font-bold text-neutral-900">
                <span>Total do grupo</span>
                <span>{formatBRL(grupoAtual.subtotal)}</span>
              </div>

              {tentativasAtual.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                  {tentativasAtual.map((t) => (
                    <li
                      key={t.id}
                      className={`flex justify-between text-sm px-3 py-2 rounded-lg ${
                        t.recusada ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
                      }`}
                    >
                      <span>
                        {formasPagamento.find((f) => f.key === t.forma)?.icon}{" "}
                        {formasPagamento.find((f) => f.key === t.forma)?.label}
                        {t.recusada ? " (recusado)" : ""}
                      </span>
                      <span className="font-semibold">{formatBRL(t.valor)}</span>
                    </li>
                  ))}
                </ul>
              )}

              {!grupoQuitado && (
                <div className="flex justify-between text-sm font-semibold text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                  <span>Restante</span>
                  <span>{formatBRL(restanteAtual)}</span>
                </div>
              )}

              {formaEmEdicao ? (
                <div className="border border-neutral-200 rounded-xl p-3 flex flex-col gap-2">
                  <p className="text-sm font-semibold text-neutral-700">
                    {formasPagamento.find((f) => f.key === formaEmEdicao)?.icon}{" "}
                    {formasPagamento.find((f) => f.key === formaEmEdicao)?.label}
                  </p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">R$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      autoFocus
                      value={valorEmEdicao}
                      onChange={(e) => setValorEmEdicao(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-team-500"
                    />
                  </div>
                  {troco !== null && troco > 0 && (
                    <p className="text-xs text-green-700 font-semibold">Troco: {formatBRL(troco)}</p>
                  )}

                  {formaEmEdicao === "credito" || formaEmEdicao === "debito" ? (
                    <>
                      <p className="text-xs text-neutral-400">Simular resultado da maquininha:</p>
                      <div className="flex gap-2">
                        <Button theme="team" fullWidth size="sm" onClick={() => confirmarPagamento(true)}>
                          ✓ Aprovado
                        </Button>
                        <Button theme="team" variant="danger" fullWidth size="sm" onClick={() => confirmarPagamento(false)}>
                          ✕ Recusado
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button theme="team" fullWidth size="sm" onClick={() => confirmarPagamento(true)}>
                      Confirmar
                    </Button>
                  )}
                  <button onClick={() => setFormaEmEdicao(null)} className="text-xs text-neutral-400 hover:text-neutral-600">
                    Cancelar
                  </button>
                </div>
              ) : (
                !grupoQuitado && (
                  <div className="grid grid-cols-2 gap-2">
                    {formasPagamento.map((f) => (
                      <button
                        key={f.key}
                        onClick={() => abrirEdicaoPagamento(f.key)}
                        className="flex items-center gap-2 p-3 rounded-xl border-2 border-neutral-200 text-sm font-semibold text-neutral-600 hover:border-neutral-300"
                      >
                        <span>{f.icon}</span>
                        {f.label}
                      </button>
                    ))}
                  </div>
                )
              )}
            </div>

            <div className="p-4 border-t border-neutral-100 flex flex-col gap-2">
              <Button
                theme="team"
                fullWidth
                size="lg"
<<<<<<< HEAD
                loading={fecharMesa.isPending}
                disabled={
                  !formaPagamento ||
                  (formaPagamento === "dinheiro" && troco !== null && troco < 0)
                }
                onClick={confirmarFechamento}
=======
                disabled={!grupoQuitado || !!formaEmEdicao}
                loading={finalizando}
                onClick={proximoGrupoOuFinalizar}
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
              >
                {grupoAtualIndex < grupos.length - 1 ? "Próximo grupo" : "Finalizar e liberar mesa"}
              </Button>
              {!fechado && (
                <button onClick={onFechar} className="text-sm text-neutral-400 hover:text-neutral-600 py-1.5 text-center">
                  Cancelar
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="p-5 border-b border-neutral-100 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl mx-auto mb-2">✓</div>
              <h2 className="font-bold text-neutral-900">Conta fechada!</h2>
              <p className="text-sm text-neutral-500">Mesa {mesa.numero} liberada</p>
            </div>
            <div className="overflow-y-auto flex-1 p-5">
              <div className="font-mono text-xs bg-neutral-50 border border-dashed border-neutral-300 rounded-xl p-4">
                <div className="text-center mb-3">
                  <p className="font-bold text-sm">PRATTO</p>
                  <p className="text-neutral-500">────────────────</p>
                  <p>Mesa {mesa.numero} · Comanda #{comanda?.numero ?? comanda?.id.slice(0, 8)}</p>
                  <p>{formatarHora(new Date().toISOString())}</p>
                  <p className="text-neutral-500">────────────────</p>
                </div>
                <div className="flex justify-between font-bold text-sm">
                  <span>TOTAL</span><span>{formatBRL(totais.total)}</span>
                </div>
                <p className="text-neutral-500 my-2">────────────────</p>
                <p className="text-center text-neutral-400 mt-2">Obrigado pela preferência!</p>
              </div>
            </div>
            <div className="p-4 border-t border-neutral-100 flex flex-col gap-2">
              <Button theme="team" fullWidth onClick={imprimirCupom}>🖨️ Imprimir cupom</Button>
              <Button theme="team" variant="secondary" fullWidth onClick={() => onContaFechada(mesa.id)}>
                Fechar sem imprimir
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

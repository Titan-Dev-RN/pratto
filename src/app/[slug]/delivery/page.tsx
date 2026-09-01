"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCartStore } from "@/lib/store/cart";
import { useClienteCadastroStore } from "@/lib/store/clienteCadastro";
import { useMounted } from "@/lib/hooks/useMounted";
import { PageLoader } from "@/components/ui/Spinner";
import { useCriarPedidoPublico } from "@/lib/api/queries/publicOrders";
import { extractErrorMessage } from "@/lib/api/client";
import { formatBRL } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import { MetodoPagamento, metodosPagamento } from "@/lib/pagamento";
import { ResumoConfirmacao } from "@/components/pedido/ResumoConfirmacao";
<<<<<<< HEAD
import { useRestaurante } from "@/lib/api/queries/menu";
import { useCriarPedido } from "@/lib/api/queries/orders";
import { apiErrorMessage } from "@/lib/api/client";
import { ItemSacola } from "@/types/domain";
=======
import { ItemSacolaLegacy as ItemSacola } from "@/types/domain.legacy";

/* Delivery é checkout real: POST /api/public/storefront/:slug/orders exige
   cliente autenticado (cadastro real feito em [slug]/page.tsx, token em
   lib/store/clienteCadastro.ts) e cria o pedido vinculado ao cliente_id —
   é isso que alimenta "Meus pedidos" (ver [slug]/pedidos/page.tsx). Nome e
   telefone já vêm do cadastro, não precisam ser digitados de novo aqui.
   Pedido de mesa/balcão (sem endereço) continua simulado em
   sacola/page.tsx — esse endpoint só aceita delivery. */
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59

type Step = "endereco" | "sacola" | "confirmado";

interface Endereco {
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  cep: string;
}

export default function DeliveryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [step, setStep] = useState<Step>("endereco");
<<<<<<< HEAD
  const [numeroPedido, setNumeroPedido] = useState<string | null>(null);
=======
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
  const [pedidoId, setPedidoId] = useState<string | null>(null);
  const [pagamento, setPagamento] = useState<MetodoPagamento>("pix");
  const [nomeCliente, setNomeCliente] = useState("");
  const [telefoneCliente, setTelefoneCliente] = useState("");
  const [pedidoConfirmado, setPedidoConfirmado] = useState<{
    itens: ItemSacola[];
    total: number;
    pagamento: MetodoPagamento;
  } | null>(null);

  const cadastro = useClienteCadastroStore();
  /* cadastro vem de localStorage (zustand persist) — só decide se
     redireciona pra tela de cadastro depois de montar no cliente, senão
     diverge do HTML do servidor. */
  const mounted = useMounted();
  useEffect(() => {
    if (mounted && !cadastro.cadastrado) router.replace(`/${slug}`);
  }, [mounted, cadastro.cadastrado, router, slug]);

  const [endereco, setEndereco] = useState<Endereco>({
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    cep: "",
  });

  const { itens, total: getTotal, quantidadeTotal, removerItem, atualizarQuantidade, limparSacola } = useCartStore();
  const criarPedido = useCriarPedidoPublico(slug);
  const totalSacola = getTotal();
  const qtd = quantidadeTotal();

  const { data: restauranteData } = useRestaurante(slug);
  const restaurante = restauranteData?.data;
  const criarPedido = useCriarPedido(slug);
  const loading = criarPedido.isPending;

  const setField = (k: keyof Endereco) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setEndereco((f) => ({ ...f, [k]: e.target.value }));

<<<<<<< HEAD
  const enderecoOk =
    nomeCliente.trim() &&
    telefoneCliente.trim() &&
=======
  const dadosOk =
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
    endereco.logradouro.trim() &&
    endereco.numero.trim() &&
    endereco.bairro.trim() &&
    endereco.cidade.trim() &&
    endereco.cep.length === 8;

  async function confirmarPedido() {
    if (!itens.length) return;
    const itensPedido = itens;
<<<<<<< HEAD
    const totalPedido = itensPedido.reduce((acc, item) => acc + item.preco_total, 0);
    try {
      const { data: pedido } = await criarPedido.mutateAsync({
        tipo: "delivery",
        nome_cliente: nomeCliente,
        telefone_cliente: telefoneCliente,
        endereco_entrega: endereco,
        itens: itensPedido.map((item) => ({
          produto_id: item.produto.id,
          quantidade: item.quantidade,
          observacao: item.observacao,
        })),
      });
      setNumeroPedido(pedido.numero);
      setPedidoId(pedido.id);
      setPedidoConfirmado({ itens: itensPedido, total: totalPedido, pagamento });
      limparSacola();
      setStep("confirmado");
    } catch (err) {
      toast.error("Erro ao enviar pedido", apiErrorMessage(err), {
=======
    try {
      const resposta = await criarPedido.mutateAsync({
        endereco_entrega: {
          logradouro: endereco.logradouro.trim(),
          numero: endereco.numero.trim(),
          complemento: endereco.complemento.trim() || undefined,
          bairro: endereco.bairro.trim(),
          cidade: endereco.cidade.trim(),
          cep: endereco.cep.trim(),
        },
        items: itensPedido.map((item) => ({
          product_id: item.produto.id,
          quantity: item.quantidade,
          observacao: item.observacao,
        })),
      });

      setPedidoId(resposta.codigo_rastreio);
      setPedidoConfirmado({ itens: itensPedido, total: Number(resposta.total), pagamento });
      limparSacola();
      setStep("confirmado");
    } catch (err) {
      toast.error("Erro ao enviar pedido", extractErrorMessage(err), {
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
        label: "Tentar novamente",
        onClick: confirmarPedido,
      });
    }
  }

  if (!mounted || !cadastro.cadastrado) return <PageLoader />;

  /* ─── Tela de confirmação ─── */
  if (step === "confirmado") {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col">
        <header className="bg-white border-b border-neutral-100 px-4 py-4">
          <h1 className="font-bold text-neutral-900 text-lg text-center">Pedido enviado!</h1>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl">
            🎉
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900">Pedido #{pedidoId}</p>
            <p className="text-neutral-500 mt-2 text-sm">
              Recebemos seu pedido! Você pode acompanhar o status abaixo.
            </p>
          </div>
          {pedidoConfirmado && (
            <ResumoConfirmacao
              previsao="Entrega em até 45 min"
              itens={pedidoConfirmado.itens}
              total={pedidoConfirmado.total}
              metodoPagamento={metodosPagamento.find((m) => m.key === pedidoConfirmado.pagamento)?.label ?? ""}
              localLabel="Endereço de entrega"
              localDetalhe={`${endereco.logradouro}, ${endereco.numero}${
                endereco.complemento ? ` - ${endereco.complemento}` : ""
              } — ${endereco.bairro}, ${endereco.cidade} — CEP ${endereco.cep}`}
<<<<<<< HEAD
              chavePix={restaurante?.chave_pix ?? ""}
=======
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
            />
          )}
          <div className="flex flex-col gap-3 w-full max-w-xs">
            {pedidoId && (
              <Link href={`/${slug}/pedido/${pedidoId}`}>
                <Button theme="coral" fullWidth size="lg">
                  Acompanhar pedido
                </Button>
              </Link>
            )}
            <Link href={`/${slug}/menu?modo=delivery`}>
              <Button theme="coral" variant="secondary" fullWidth>
                Voltar ao cardápio
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-100 px-4 py-4 flex items-center gap-3">
        {step === "sacola" ? (
          <button
            onClick={() => setStep("endereco")}
            className="text-neutral-500 hover:text-neutral-700 text-lg"
          >
            ←
          </button>
        ) : (
          <Link href={`/${slug}/menu?modo=delivery`} className="text-neutral-500 hover:text-neutral-700 text-lg">
            ←
          </Link>
        )}
        <h1 className="font-bold text-neutral-900 text-lg">Delivery</h1>
        {/* Stepper */}
        <div className="ml-auto flex items-center gap-1.5 text-xs text-neutral-400">
          <span className={step === "endereco" ? "text-coral-500 font-semibold" : ""}>
            1. Endereço
          </span>
          <span>›</span>
          <span className={step === "sacola" ? "text-coral-500 font-semibold" : ""}>
            2. Sacola
          </span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-5 pb-28">
        {/* ─── Step 1: Dados + Endereço ─── */}
        {step === "endereco" && (
          <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4">
<<<<<<< HEAD
            <h2 className="font-semibold text-neutral-900">Seus dados</h2>
            <Input
              label="Nome"
              placeholder="Seu nome completo"
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
              theme="coral"
            />
            <Input
              label="Telefone / WhatsApp"
              placeholder="(11) 99999-9999"
              value={telefoneCliente}
              onChange={(e) => setTelefoneCliente(e.target.value)}
              inputMode="tel"
              theme="coral"
            />
            <h2 className="font-semibold text-neutral-900 pt-2 border-t border-neutral-100">Endereço de entrega</h2>
=======
            <h2 className="font-semibold text-neutral-900">Endereço de entrega</h2>
            <p className="text-xs text-neutral-400 -mt-2">
              Pedindo como <span className="font-medium text-neutral-600">{cadastro.cliente?.nome}</span> ·{" "}
              {cadastro.cliente?.telefone}
            </p>
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
            <Input
              label="CEP"
              placeholder="00000000"
              value={endereco.cep}
              onChange={setField("cep")}
              maxLength={8}
              inputMode="numeric"
              theme="coral"
            />
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Input
                  label="Logradouro"
                  placeholder="Rua, Av..."
                  value={endereco.logradouro}
                  onChange={setField("logradouro")}
                  theme="coral"
                />
              </div>
              <Input
                label="Número"
                placeholder="123"
                value={endereco.numero}
                onChange={setField("numero")}
                theme="coral"
              />
            </div>
            <Input
              label="Complemento"
              placeholder="Apto, bloco..."
              value={endereco.complemento}
              onChange={setField("complemento")}
              theme="coral"
            />
            <Input
              label="Bairro"
              placeholder="Bairro"
              value={endereco.bairro}
              onChange={setField("bairro")}
              theme="coral"
            />
            <Input
              label="Cidade"
              placeholder="Cidade"
              value={endereco.cidade}
              onChange={setField("cidade")}
              theme="coral"
            />
          </div>
        )}

        {/* ─── Step 2: Sacola ─── */}
        {step === "sacola" && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-neutral-900">Sua sacola</h2>
              <button
                className="text-xs text-coral-500 font-medium"
                onClick={() => setStep("endereco")}
              >
                Alterar dados
              </button>
            </div>

            <p className="text-xs text-neutral-500 bg-neutral-50 rounded-xl p-3 mb-4">
              📍 {endereco.logradouro}, {endereco.numero}
              {endereco.complemento ? ` — ${endereco.complemento}` : ""} ·{" "}
              {endereco.bairro}, {endereco.cidade}
            </p>

            {itens.length === 0 ? (
              <div className="text-center py-8 text-neutral-400">
                <p className="text-3xl mb-2">🛒</p>
                <p className="text-sm">Sacola vazia</p>
                <Link href={`/${slug}/menu?modo=delivery`}>
                  <Button theme="coral" variant="secondary" size="sm" className="mt-3">
                    Ir ao cardápio
                  </Button>
                </Link>
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {itens.map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    {/* Controle de quantidade */}
                    <div className="flex items-center gap-2 bg-neutral-100 rounded-full px-1.5 py-1">
                      <button
                        className="w-6 h-6 rounded-full bg-white shadow flex items-center justify-center font-bold text-neutral-700 text-sm disabled:opacity-40"
                        onClick={() =>
                          item.quantidade > 1
                            ? atualizarQuantidade(i, item.quantidade - 1)
                            : removerItem(i)
                        }
                      >
                        {item.quantidade > 1 ? "−" : "🗑"}
                      </button>
                      <span className="w-4 text-center text-sm font-semibold">
                        {item.quantidade}
                      </span>
                      <button
                        className="w-6 h-6 rounded-full bg-white shadow flex items-center justify-center font-bold text-neutral-700 text-sm"
                        onClick={() => atualizarQuantidade(i, item.quantidade + 1)}
                      >
                        +
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {item.produto.nome}
                      </p>
                      {item.observacao && (
                        <p className="text-xs text-neutral-400 truncate">{item.observacao}</p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-neutral-900 flex-shrink-0">
                      {formatBRL(item.preco_total)}
                    </span>
                  </li>
                ))}
                <li className="border-t border-neutral-100 pt-3 flex justify-between font-bold text-neutral-900">
                  <span>Total</span>
                  <span>{formatBRL(totalSacola)}</span>
                </li>
              </ul>
            )}

            {/* Método de pagamento */}
            {itens.length > 0 && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-100">
                {metodosPagamento.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setPagamento(m.key)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                      pagamento === m.key
                        ? "border-coral-500 text-coral-600 bg-coral-50"
                        : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Botão de adicionar mais */}
        {step === "sacola" && itens.length > 0 && (
          <Link href={`/${slug}/menu?modo=delivery`}>
            <Button theme="coral" variant="secondary" fullWidth>
              + Adicionar mais itens
            </Button>
          </Link>
        )}
      </main>

      {/* CTA flutuante */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
        <div className="max-w-lg mx-auto pointer-events-auto">
          {step === "endereco" && (
            <Button
              theme="coral"
              size="lg"
              fullWidth
              disabled={!dadosOk}
              onClick={() => setStep("sacola")}
            >
              {qtd > 0 ? `Continuar com ${qtd} item${qtd > 1 ? "s" : ""}` : "Continuar"}
            </Button>
          )}
          {step === "sacola" && itens.length > 0 && (
            <Button
              theme="coral"
              size="lg"
              fullWidth
              loading={criarPedido.isPending}
              onClick={confirmarPedido}
            >
              Confirmar pedido · {formatBRL(totalSacola)}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

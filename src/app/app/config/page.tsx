"use client";

import { useEffect, useState } from "react";
import { useRestauranteAdmin, useAtualizarRestaurante } from "@/lib/api/queries/restaurante";
import { useMesas } from "@/lib/api/queries/mesas";
import { useUsuarios, useCriarUsuario, useAtualizarUsuario } from "@/lib/api/queries/usuarios";
import { apiErrorMessage } from "@/lib/api/client";
import { toast } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui/Spinner";
import { HorarioDia } from "@/types/domain";

type Tab = "restaurante" | "mesas" | "equipe";

const diasSemana = [
  { dia: "Segunda", chave: "segunda" },
  { dia: "Terça", chave: "terca" },
  { dia: "Quarta", chave: "quarta" },
  { dia: "Quinta", chave: "quinta" },
  { dia: "Sexta", chave: "sexta" },
  { dia: "Sábado", chave: "sabado" },
  { dia: "Domingo", chave: "domingo" },
];

const horarioPadrao: HorarioDia = { abertura: "11:00", fechamento: "22:00", aberto: true };

const roleBadge: Record<string, string> = {
  garcom: "bg-blue-100 text-blue-700",
  caixa: "bg-amber-100 text-amber-700",
  admin: "bg-team-100 text-team-700",
  cozinha: "bg-purple-100 text-purple-700",
};

const roleLabel: Record<string, string> = {
  garcom: "Garçom",
  caixa: "Caixa",
  admin: "Administrador",
  cozinha: "Cozinha",
};

export default function ConfigPage() {
  const [tab, setTab] = useState<Tab>("restaurante");

  const tabs: { key: Tab; label: string }[] = [
    { key: "restaurante", label: "Restaurante" },
    { key: "mesas", label: "Mesas & QR" },
    { key: "equipe", label: "Equipe" },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-5">
      <h1 className="text-xl font-bold text-neutral-900 mb-5">Configurações</h1>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-neutral-100 rounded-xl mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
              tab === t.key ? "bg-white text-team-700 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "restaurante" && <TabRestaurante />}
      {tab === "mesas" && <TabMesas />}
      {tab === "equipe" && <TabEquipe />}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-neutral-700">{label}</label>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────
   Tab: Restaurante
───────────────────────────────────────── */
function TabRestaurante() {
  const { data, isLoading } = useRestauranteAdmin();
  const atualizar = useAtualizarRestaurante();
  const restaurante = data?.data;

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [telefone, setTelefone] = useState("");
  const [taxaServico, setTaxaServico] = useState("0");
  const [horarios, setHorarios] = useState<Record<string, HorarioDia>>({});

  useEffect(() => {
    if (!restaurante) return;
    setNome(restaurante.nome ?? "");
    setDescricao(restaurante.descricao ?? "");
    setTelefone(restaurante.telefone ?? "");
    setTaxaServico(String(restaurante.taxa_servico ?? 0));
    setHorarios(restaurante.horarios ?? {});
  }, [restaurante]);

  function horarioDoDia(chave: string): HorarioDia {
    return horarios[chave] ?? horarioPadrao;
  }

  function atualizarHorario(chave: string, patch: Partial<HorarioDia>) {
    setHorarios((prev) => ({ ...prev, [chave]: { ...horarioDoDia(chave), ...patch } }));
  }

  async function salvar() {
    try {
      await atualizar.mutateAsync({
        nome,
        descricao,
        telefone,
        taxa_servico: parseFloat(taxaServico.replace(",", ".")) || 0,
        horarios,
      });
      toast.success("Configurações salvas!");
    } catch (err) {
      toast.error("Erro ao salvar", apiErrorMessage(err));
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100">
        <h2 className="font-semibold text-neutral-800 text-sm mb-4">Informações gerais</h2>
        <div className="flex flex-col gap-4">
          <Field label="Nome do restaurante">
            <input className="input-field" value={nome} onChange={(e) => setNome(e.target.value)} />
          </Field>
          <Field label="Descrição">
            <textarea
              className="input-field resize-none"
              rows={2}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </Field>
          <Field label="Telefone / WhatsApp">
            <input className="input-field" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
          </Field>
          <Field label="Taxa de serviço (%)">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="20"
                className="input-field w-24"
                value={taxaServico}
                onChange={(e) => setTaxaServico(e.target.value)}
              />
              <span className="text-sm text-neutral-500">% sobre o total do pedido</span>
            </div>
          </Field>
        </div>
      </div>

      {/* Horários */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100">
        <h2 className="font-semibold text-neutral-800 text-sm mb-4">Horários de funcionamento</h2>
        <div className="flex flex-col gap-3">
          {diasSemana.map(({ dia, chave }) => {
            const h = horarioDoDia(chave);
            return (
              <div key={chave} className="flex items-center gap-3">
                <button
                  onClick={() => atualizarHorario(chave, { aberto: !h.aberto })}
                  className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${h.aberto ? "bg-green-400" : "bg-neutral-200"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${h.aberto ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
                <span className={`text-sm font-medium w-20 flex-shrink-0 ${h.aberto ? "text-neutral-800" : "text-neutral-400"}`}>
                  {dia}
                </span>
                {h.aberto ? (
                  <div className="flex items-center gap-1.5 text-sm text-neutral-700">
                    <input
                      type="time"
                      className="border border-neutral-200 rounded-lg px-2 py-1 text-xs"
                      value={h.abertura}
                      onChange={(e) => atualizarHorario(chave, { abertura: e.target.value })}
                    />
                    <span className="text-neutral-400">–</span>
                    <input
                      type="time"
                      className="border border-neutral-200 rounded-lg px-2 py-1 text-xs"
                      value={h.fechamento}
                      onChange={(e) => atualizarHorario(chave, { fechamento: e.target.value })}
                    />
                  </div>
                ) : (
                  <span className="text-sm text-neutral-400">Fechado</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={salvar}
        disabled={atualizar.isPending}
        className="w-full bg-team-500 text-white rounded-2xl py-4 font-semibold text-base hover:bg-team-600 active:bg-team-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {atualizar.isPending && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        Salvar alterações
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   Tab: Mesas & QR
───────────────────────────────────────── */
function TabMesas() {
  const { data: restauranteData } = useRestauranteAdmin();
  const { data: mesasData, isLoading } = useMesas();
  const slug = restauranteData?.data.slug ?? "";
  const mesas = mesasData?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-neutral-800 text-sm">Mesas cadastradas</h2>
          <span className="text-xs text-neutral-400">{mesas.length} mesas</span>
        </div>
        <div className="flex flex-col gap-2">
          {mesas.map((mesa) => {
            const qrUrl = `/${slug}/mesa/${mesa.numero}`;
            return (
              <div
                key={mesa.id}
                className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-100"
              >
                <div>
                  <p className="font-semibold text-sm text-neutral-900">Mesa {mesa.numero}</p>
                  <p className="text-xs text-neutral-400">{mesa.capacidade} lugares</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={qrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-team-50 text-team-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-team-100 transition-colors"
                  >
                    Testar link
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(`${window.location.origin}${qrUrl}`);
                      toast.success(`Link da Mesa ${mesa.numero} copiado!`);
                    }}
                    className="text-xs bg-neutral-100 text-neutral-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-neutral-200 transition-colors"
                  >
                    Copiar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-team-50 border border-team-100 rounded-2xl p-4">
        <p className="text-sm font-semibold text-team-800 mb-1">Como funciona o QR Code?</p>
        <p className="text-xs text-team-600">
          Cada mesa tem um link único. Imprima o QR Code ou coloque o link numa etiqueta na mesa.
          Quando o cliente escanear, ele vai direto para o cardápio com o número da mesa já preenchido.
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Tab: Equipe
───────────────────────────────────────── */
function TabEquipe() {
  const { data, isLoading } = useUsuarios();
  const criar = useCriarUsuario();
  const atualizar = useAtualizarUsuario();
  const equipe = data?.data ?? [];

  const [novoMembro, setNovoMembro] = useState({ nome: "", email: "", senha: "", role: "garcom" });

  async function adicionarMembro() {
    if (!novoMembro.nome || !novoMembro.email || !novoMembro.senha) return;
    try {
      await criar.mutateAsync({
        nome: novoMembro.nome,
        email: novoMembro.email,
        senha: novoMembro.senha,
        perfil: novoMembro.role,
      });
      setNovoMembro({ nome: "", email: "", senha: "", role: "garcom" });
      toast.success("Membro adicionado!");
    } catch (err) {
      toast.error("Erro ao adicionar membro", apiErrorMessage(err));
    }
  }

  function toggleMembro(id: string, ativo: boolean) {
    atualizar.mutate(
      { id, dados: { ativo: !ativo } },
      { onError: (err) => toast.error("Erro ao atualizar membro", apiErrorMessage(err)) }
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Lista da equipe */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-neutral-800 text-sm">Membros da equipe</h2>
          <span className="text-xs text-neutral-400">{equipe.filter((m) => m.ativo).length} ativos</span>
        </div>
        <div className="flex flex-col gap-2">
          {equipe.map((membro) => (
            <div
              key={membro.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-opacity ${
                membro.ativo ? "bg-white border-neutral-100" : "bg-neutral-50 border-neutral-100 opacity-60"
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-team-100 flex items-center justify-center text-team-600 font-bold text-sm flex-shrink-0">
                {membro.nome.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-neutral-900 truncate">{membro.nome}</p>
                <p className="text-xs text-neutral-400 truncate">{membro.email}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleBadge[membro.role] ?? "bg-neutral-100 text-neutral-600"}`}>
                  {roleLabel[membro.role] ?? membro.role}
                </span>
                <button
                  onClick={() => toggleMembro(membro.id, membro.ativo)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${membro.ativo ? "bg-green-400" : "bg-neutral-200"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${membro.ativo ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Adicionar membro */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100">
        <h2 className="font-semibold text-neutral-800 text-sm mb-4">Adicionar membro</h2>
        <div className="flex flex-col gap-3">
          <Field label="Nome">
            <input
              className="input-field"
              placeholder="Nome completo"
              value={novoMembro.nome}
              onChange={(e) => setNovoMembro((m) => ({ ...m, nome: e.target.value }))}
            />
          </Field>
          <Field label="E-mail">
            <input
              type="email"
              className="input-field"
              placeholder="email@exemplo.com"
              value={novoMembro.email}
              onChange={(e) => setNovoMembro((m) => ({ ...m, email: e.target.value }))}
            />
          </Field>
          <Field label="Senha temporária">
            <input
              type="password"
              className="input-field"
              placeholder="Mínimo 6 caracteres"
              value={novoMembro.senha}
              onChange={(e) => setNovoMembro((m) => ({ ...m, senha: e.target.value }))}
            />
          </Field>
          <Field label="Função">
            <select
              className="input-field"
              value={novoMembro.role}
              onChange={(e) => setNovoMembro((m) => ({ ...m, role: e.target.value }))}
            >
              <option value="garcom">Garçom</option>
              <option value="caixa">Caixa</option>
              <option value="cozinha">Cozinha</option>
              <option value="admin">Administrador</option>
            </select>
          </Field>
          <button
            onClick={adicionarMembro}
            disabled={!novoMembro.nome || !novoMembro.email || !novoMembro.senha || criar.isPending}
            className="w-full bg-team-500 text-white rounded-xl py-3 font-semibold text-sm hover:bg-team-600 transition-colors disabled:opacity-50"
          >
            Adicionar à equipe
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

<<<<<<< HEAD
import { useEffect, useState } from "react";
import { useRestauranteAdmin, useAtualizarRestaurante } from "@/lib/api/queries/restaurante";
import { useMesas } from "@/lib/api/queries/mesas";
import { useUsuarios, useCriarUsuario, useAtualizarUsuario } from "@/lib/api/queries/usuarios";
import { apiErrorMessage } from "@/lib/api/client";
=======
import { useState } from "react";
import { useMesas, useMesa, useCriarMesa, useAtualizarMesa, useExcluirMesa } from "@/lib/api/queries/mesas";
import { useUsuarios, useUsuario, useCriarUsuario, useAtualizarUsuario, useInativarUsuario } from "@/lib/api/queries/usuarios";
import { useSessionStore } from "@/lib/store/session";
import { Mesa, Usuario, UserRole } from "@/types/domain";
import { extractErrorMessage } from "@/lib/api/client";
import { PageLoader, Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { TableStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
import { toast } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui/Spinner";
import { HorarioDia } from "@/types/domain";

/* A aba "Restaurante" foi removida — a API usada (/api/*) não tem essa
   entidade. "Mesas" usa dados reais (sem capacidade/lugares exibido —
   Admin #1). "Equipe" agora é real: /api/users tem CRUD completo,
   inclusive editar papel e inativar (Admin #3). */

<<<<<<< HEAD
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
=======
type Tab = "mesas" | "equipe";

const roleBadge: Record<UserRole, string> = {
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
  garcom: "bg-blue-100 text-blue-700",
  caixa: "bg-amber-100 text-amber-700",
  cozinha: "bg-orange-100 text-orange-700",
  admin: "bg-team-100 text-team-700",
<<<<<<< HEAD
  cozinha: "bg-purple-100 text-purple-700",
=======
  entregador: "bg-purple-100 text-purple-700",
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
};

const roleLabel: Record<UserRole, string> = {
  garcom: "Garçom",
  caixa: "Caixa",
<<<<<<< HEAD
  admin: "Administrador",
  cozinha: "Cozinha",
};

export default function ConfigPage() {
  const [tab, setTab] = useState<Tab>("restaurante");
=======
  cozinha: "Cozinha",
  admin: "Admin",
  entregador: "Entregador",
};

export default function ConfigPage() {
  const [tab, setTab] = useState<Tab>("equipe");
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59

  const tabs: { key: Tab; label: string }[] = [
    { key: "equipe", label: "Equipe" },
    { key: "mesas", label: "Mesas" },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-5">
      <h1 className="text-xl font-bold text-neutral-900 mb-5">Configurações</h1>

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

<<<<<<< HEAD
      {tab === "restaurante" && <TabRestaurante />}
      {tab === "mesas" && <TabMesas />}
      {tab === "equipe" && <TabEquipe />}
=======
      {tab === "equipe" ? <EquipeTab /> : <MesasTab />}
    </div>
  );
}

function MesasTab() {
  const { usuario } = useSessionStore();
  const { data: mesas, isLoading, isError, refetch } = useMesas();
  const criarMesa = useCriarMesa();

  const [modal, setModal] = useState<Mesa | null | "nova">(null);

  if (isLoading) return <PageLoader />;
  if (isError || !mesas) return <ErrorState onRetry={() => refetch()} />;

  function salvarNova(numero: number, capacidade?: number) {
    if (!usuario?.restaurante_id) {
      toast.error("Erro ao criar mesa", "Sessão sem loja associada — faça login de novo.");
      return;
    }
    criarMesa.mutate(
      { numero, loja_id: usuario.restaurante_id, capacidade },
      {
        onSuccess: () => {
          toast.success(`Mesa ${numero} criada!`);
          setModal(null);
        },
        onError: (err) => toast.error("Erro ao criar mesa", extractErrorMessage(err)),
      }
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
          {mesas.map((mesa) => (
            <button
              key={mesa.id}
              onClick={() => setModal(mesa)}
              className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-100 hover:bg-neutral-100 transition-colors text-left"
            >
              <p className="font-semibold text-sm text-neutral-900">Mesa {mesa.numero}</p>
              <TableStatusBadge status={mesa.status} />
            </button>
          ))}
        </div>
      </div>

      <Button theme="team" fullWidth onClick={() => setModal("nova")}>
        + Nova mesa
      </Button>

      {modal !== null && (
        modal === "nova" ? (
          <MesaFormModal salvando={criarMesa.isPending} onSalvar={salvarNova} onFechar={() => setModal(null)} />
        ) : (
          <EditarMesaModal mesaId={modal.id} onFechar={() => setModal(null)} />
        )
      )}
    </div>
  );
}

/* Criação — POST /api/tables (payload real: numero/loja_id, confirmado
   ao vivo; o exemplo antigo com number/description dava 422). */
function MesaFormModal({
  salvando,
  onSalvar,
  onFechar,
}: {
  salvando: boolean;
  onSalvar: (numero: number, capacidade?: number) => void;
  onFechar: () => void;
}) {
  const [numero, setNumero] = useState("");
  const [capacidade, setCapacidade] = useState("");

  const numeroValido = parseInt(numero, 10);
  const valido = numero.trim() && !isNaN(numeroValido) && numeroValido > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onFechar}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-neutral-900 mb-5">Nova mesa</h2>
        <div className="flex flex-col gap-3">
          <Field label="Número">
            <input
              className="input-field"
              type="number"
              inputMode="numeric"
              placeholder="Ex: 13"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              autoFocus
            />
          </Field>
          <Field label="Capacidade (opcional)">
            <input
              className="input-field"
              type="number"
              inputMode="numeric"
              placeholder="4"
              value={capacidade}
              onChange={(e) => setCapacidade(e.target.value)}
            />
          </Field>
        </div>
        <div className="flex flex-col gap-2 mt-6">
          <Button
            theme="team"
            fullWidth
            disabled={!valido}
            loading={salvando}
            onClick={() => onSalvar(numeroValido, capacidade.trim() ? parseInt(capacidade, 10) : undefined)}
          >
            Criar mesa
          </Button>
          <button onClick={onFechar} className="text-sm text-neutral-400 hover:text-neutral-600 py-2 text-center">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

/* Edição/inativação — busca a mesa de novo por id ao abrir (dado mais
   fresco que o da lista, mesmo sendo pouca diferença na prática) e usa
   PATCH (numero/capacidade) e DELETE (inativar — some da listagem de
   verdade, confirmado ao vivo; sem endpoint pra desfazer). */
function EditarMesaModal({ mesaId, onFechar }: { mesaId: string; onFechar: () => void }) {
  const { data: mesa, isLoading } = useMesa(mesaId);
  const atualizarMesa = useAtualizarMesa();
  const excluirMesa = useExcluirMesa();

  const [numero, setNumero] = useState<string | null>(null);
  const [capacidade, setCapacidade] = useState<string | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  const numeroValor = numero ?? String(mesa?.numero ?? "");
  const capacidadeValor = capacidade ?? String(mesa?.capacidade ?? "");
  const numeroValido = parseInt(numeroValor, 10);
  const valido = numeroValor.trim() && !isNaN(numeroValido) && numeroValido > 0;

  function salvar() {
    atualizarMesa.mutate(
      {
        id: mesaId,
        payload: {
          numero: numeroValido,
          capacidade: capacidadeValor.trim() ? parseInt(capacidadeValor, 10) : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Mesa atualizada!");
          onFechar();
        },
        onError: (err) => toast.error("Erro ao atualizar mesa", extractErrorMessage(err)),
      }
    );
  }

  function inativar() {
    excluirMesa.mutate(mesaId, {
      onSuccess: () => {
        toast.success("Mesa inativada.");
        onFechar();
      },
      onError: (err) => toast.error("Erro ao inativar mesa", extractErrorMessage(err)),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onFechar}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-neutral-900 mb-5">Editar mesa</h2>

        {isLoading || !mesa ? (
          <div className="flex justify-center py-6"><Spinner /></div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              <Field label="Número">
                <input
                  className="input-field"
                  type="number"
                  inputMode="numeric"
                  value={numeroValor}
                  onChange={(e) => setNumero(e.target.value)}
                />
              </Field>
              <Field label="Capacidade">
                <input
                  className="input-field"
                  type="number"
                  inputMode="numeric"
                  value={capacidadeValor}
                  onChange={(e) => setCapacidade(e.target.value)}
                />
              </Field>
            </div>

            <div className="flex flex-col gap-2 mt-6">
              <Button theme="team" fullWidth disabled={!valido} loading={atualizarMesa.isPending} onClick={salvar}>
                Salvar alterações
              </Button>

              {confirmarExclusao ? (
                <div className="flex gap-2">
                  <Button theme="team" variant="danger" fullWidth loading={excluirMesa.isPending} onClick={inativar}>
                    Confirmar exclusão
                  </Button>
                  <Button theme="team" variant="ghost" fullWidth onClick={() => setConfirmarExclusao(false)}>
                    Voltar
                  </Button>
                </div>
              ) : (
                <Button theme="team" variant="ghost" fullWidth onClick={() => setConfirmarExclusao(true)}>
                  Inativar mesa
                </Button>
              )}
              {confirmarExclusao && (
                <p className="text-xs text-red-500 text-center">
                  Some da lista pra sempre — sem endpoint pra desfazer.
                </p>
              )}
            </div>
          </>
        )}

        <button onClick={onFechar} className="mt-2 w-full text-sm text-neutral-400 hover:text-neutral-600 py-2 text-center">
          Cancelar
        </button>
      </div>
    </div>
  );
}

function EquipeTab() {
  const { data: usuarios, isLoading, isError, refetch } = useUsuarios();
  const criarUsuario = useCriarUsuario();
  const atualizarUsuario = useAtualizarUsuario();
  const inativarUsuario = useInativarUsuario();

  const [modal, setModal] = useState<Usuario | null | "novo">(null);

  /* Busca o usuário de novo por id ao abrir a edição — dado mais fresco
     que o da lista. */
  const editandoId = modal && modal !== "novo" ? modal.id : "";
  const { data: usuarioFresco } = useUsuario(editandoId, { enabled: !!editandoId });
  const usuarioParaEditar = modal !== "novo" ? (usuarioFresco ?? modal) : null;

  if (isLoading) return <PageLoader />;
  if (isError || !usuarios) return <ErrorState onRetry={() => refetch()} />;

  /* DELETE /api/users/:id inativa de verdade (soft delete). Não existe
     endpoint confirmado pra reativar — só mostramos a ação quando o
     usuário está ativo. */
  function inativar(usuario: Usuario) {
    inativarUsuario.mutate(usuario.id, {
      onSuccess: () => toast.success("Usuário inativado."),
      onError: (err) => toast.error("Erro ao inativar usuário", extractErrorMessage(err)),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-neutral-800 text-sm">Membros da equipe</h2>
          <span className="text-xs text-neutral-400">{usuarios.filter((u) => u.ativo).length} ativos</span>
        </div>
        <div className="flex flex-col gap-2">
          {usuarios.map((membro) => (
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
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleBadge[membro.role]}`}>
                  {roleLabel[membro.role]}
                </span>
                <button onClick={() => setModal(membro)} className="text-xs font-medium text-team-600 hover:text-team-700">
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button theme="team" fullWidth onClick={() => setModal("novo")}>
        + Adicionar membro
      </Button>

      {modal !== null && (
        <MembroModal
          key={modal === "novo" ? "novo" : modal.id}
          usuario={usuarioParaEditar}
          salvando={criarUsuario.isPending || atualizarUsuario.isPending}
          onFechar={() => setModal(null)}
          onInativar={usuarioParaEditar?.ativo ? () => inativar(usuarioParaEditar) : undefined}
          onSalvar={(dados) => {
            if (modal === "novo") {
              criarUsuario.mutate(dados, {
                onSuccess: () => {
                  toast.success("Membro adicionado!");
                  setModal(null);
                },
                onError: (err) => toast.error("Erro ao criar usuário", extractErrorMessage(err)),
              });
            } else if (modal) {
              atualizarUsuario.mutate(
                { id: modal.id, payload: { name: dados.name, email: dados.email, role: dados.role } },
                {
                  onSuccess: () => {
                    toast.success("Membro atualizado!");
                    setModal(null);
                  },
                  onError: (err) => toast.error("Erro ao atualizar usuário", extractErrorMessage(err)),
                }
              );
            }
          }}
        />
      )}
>>>>>>> c4bfebad0726f88fb025f476af8a10e3dfd65f59
    </div>
  );
}

function MembroModal({
  usuario,
  salvando,
  onSalvar,
  onFechar,
  onInativar,
}: {
  usuario: Usuario | null;
  salvando: boolean;
  onSalvar: (dados: { name: string; email: string; password: string; role: UserRole }) => void;
  onFechar: () => void;
  onInativar?: () => void;
}) {
  const isEditing = !!usuario;
  const [nome, setNome] = useState(usuario?.nome ?? "");
  const [email, setEmail] = useState(usuario?.email ?? "");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState<UserRole>(usuario?.role ?? "garcom");

  const valido = nome.trim() && email.trim() && (isEditing || senha.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onFechar}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-neutral-900 mb-5">{isEditing ? "Editar membro" : "Novo membro"}</h2>

        <div className="flex flex-col gap-3">
          <Field label="Nome">
            <input className="input-field" value={nome} onChange={(e) => setNome(e.target.value)} />
          </Field>
          <Field label="E-mail">
            <input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          {!isEditing && (
            <Field label="Senha">
              <input className="input-field" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
            </Field>
          )}
          <Field label="Função">
            <select className="input-field" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              <option value="garcom">Garçom</option>
              <option value="caixa">Caixa</option>
              <option value="cozinha">Cozinha</option>
              <option value="entregador">Entregador</option>
              <option value="admin">Administrador</option>
            </select>
          </Field>
        </div>

        <div className="flex flex-col gap-2 mt-6">
          <Button
            theme="team"
            fullWidth
            disabled={!valido}
            loading={salvando}
            onClick={() => onSalvar({ name: nome.trim(), email: email.trim(), password: senha, role })}
          >
            {isEditing ? "Salvar alterações" : "Adicionar à equipe"}
          </Button>
          {onInativar && (
            <Button theme="team" variant="danger" fullWidth onClick={onInativar}>
              Inativar usuário
            </Button>
          )}
          {usuario && !usuario.ativo && (
            <p className="text-xs text-neutral-400 text-center">
              Usuário inativo — sem endpoint pra reativar ainda.
            </p>
          )}
          <button onClick={onFechar} className="text-sm text-neutral-400 hover:text-neutral-600 py-2 text-center">
            Cancelar
          </button>
        </div>
      </div>
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

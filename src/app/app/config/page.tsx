"use client";

import { useState } from "react";
import {
  useMesasV1 as useMesas,
  useMesaV1 as useMesa,
  useCriarMesaV1 as useCriarMesa,
  useAtualizarMesaV1 as useAtualizarMesa,
  useExcluirMesaV1 as useExcluirMesa,
} from "@/lib/api/queries/v1/mesas";
import {
  useUsuariosV1 as useUsuarios,
  useCriarUsuarioV1 as useCriarUsuario,
  useAtualizarUsuarioV1 as useAtualizarUsuario,
} from "@/lib/api/queries/v1/usuarios";
import { RestauranteTab } from "@/app/app/config/RestauranteTab";
import { MesaV1 as Mesa, Usuario, UserRole } from "@/types/domain";
import { extractErrorMessage } from "@/lib/api/client";
import { PageLoader, Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { TableStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

/* Migrado pra superfície V1 (/api/v1/cliente/*). A aba "Restaurante"
   voltou — a v1 expõe GET/PUT /restaurante (a `/api/*` não tinha). "Mesas"
   e "Equipe" usam os endpoints v1. Inativar usuário virou PUT
   { ativo:false } (a v1 não documenta DELETE de usuário).
   ⚠️ V1 não confirmada ao vivo — ver AGENTS/SESSAO. */

type Tab = "restaurante" | "mesas" | "equipe";

const roleBadge: Record<UserRole, string> = {
  garcom: "bg-blue-100 text-blue-700",
  caixa: "bg-amber-100 text-amber-700",
  cozinha: "bg-orange-100 text-orange-700",
  admin: "bg-team-100 text-team-700",
  entregador: "bg-purple-100 text-purple-700",
};

const roleLabel: Record<UserRole, string> = {
  garcom: "Garçom",
  caixa: "Caixa",
  cozinha: "Cozinha",
  admin: "Admin",
  entregador: "Entregador",
};

export default function ConfigPage() {
  const [tab, setTab] = useState<Tab>("equipe");

  const tabs: { key: Tab; label: string }[] = [
    { key: "equipe", label: "Equipe" },
    { key: "mesas", label: "Mesas" },
    { key: "restaurante", label: "Restaurante" },
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

      {tab === "equipe" ? <EquipeTab /> : tab === "mesas" ? <MesasTab /> : <RestauranteTab />}
    </div>
  );
}

function MesasTab() {
  const { data: mesas, isLoading, isError, refetch } = useMesas();
  const criarMesa = useCriarMesa();

  const [modal, setModal] = useState<Mesa | null | "nova">(null);

  if (isLoading) return <PageLoader />;
  if (isError || !mesas) return <ErrorState onRetry={() => refetch()} />;

  /* V1 (/api/v1/cliente/mesas) não exige `loja_id` — o token identifica o
     restaurante. ⚠️ Não confirmado ao vivo. */
  function salvarNova(numero: number, capacidade?: number) {
    criarMesa.mutate(
      { numero, capacidade },
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

  const [modal, setModal] = useState<Usuario | null | "novo">(null);

  /* A v1 não documenta GET /usuarios/:id — edita direto com o item da
     lista. */
  const usuarioParaEditar = modal !== "novo" ? modal : null;

  if (isLoading) return <PageLoader />;
  if (isError || !usuarios) return <ErrorState onRetry={() => refetch()} />;

  /* A v1 não documenta DELETE de usuário — "inativar" é PUT
     { ativo:false } (o payload de atualização aceita `ativo`).
     ⚠️ Não confirmado ao vivo. */
  function inativar(usuario: Usuario) {
    atualizarUsuario.mutate(
      { id: usuario.id, payload: { ativo: false } },
      {
        onSuccess: () => toast.success("Usuário inativado."),
        onError: (err) => toast.error("Erro ao inativar usuário", extractErrorMessage(err)),
      }
    );
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
                { id: modal.id, payload: { nome: dados.nome, email: dados.email, perfil: dados.perfil } },
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
  onSalvar: (dados: { nome: string; email: string; senha: string; perfil: UserRole }) => void;
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
            onClick={() => onSalvar({ nome: nome.trim(), email: email.trim(), senha, perfil: role })}
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

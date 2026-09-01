# Integração com a API real (Rails)

Registro do que foi feito para conectar o Pratto a um backend Rails real, substituindo os dados mock que o app usava até então. Ver histórico de commits para o diff completo; este documento é o resumo executivo + pontos em aberto.

## Contexto

O front tinha uma camada de API "pronta para uso" (`src/lib/api/*`, hooks TanStack Query) desenhada com base em suposições — multi-tenant por `slug`, categorias, envelope `{ data }` etc. O contrato real do backend Rails passado pelo usuário diverge bastante disso:

- **Sem multi-tenant**: não há `/restaurantes`, `slug` nem `chave_pix`. É um restaurante único. Base URL: `http://localhost:3000` (sem prefixo `/api`, sem versionamento).
- **Sem categorias**: `/produtos` só tem `nome, descricao, preco, ativo, imagem`.
- **Pedido é criado vazio**: `POST /pedidos` só aceita `{ mesa_id }`; itens entram depois, um a um, via `POST /pedidos/:id/item_pedidos`.
- **Criar pedido exige papel de staff** (`garcom/admin/caixa`) — cliente final não pode criar pedido sozinho.
- **Delivery sempre pendurado num pedido com mesa_id** — não existe pedido "solto".
- **Papéis**: `admin/garcom/caixa/entregador` no backend (sem `superadmin`); o front tinha `garcom/caixa/admin/superadmin` (sem `entregador`).
- **Sem envelope `{ data }`**: respostas vêm cruas (`POST /login` → `{token, usuario}` direto). Erros vêm como `{ "erro": "..." }` (401/403) ou objeto cru do ActiveModel::Errors no 422 (`{ "campo": ["mensagem"] }`).
- **Cupons** e **Entregas** são entidades novas, sem equivalente anterior no domínio do front.
- Não há endpoint de dashboard/KPI, nem de impressão.

### Decisões de produto confirmadas com o usuário

1. **Checkout do cliente final (sacola/delivery) ficou pausado** — como toda rota exige login (inclusive `GET /produtos`) e criar pedido exige papel de staff, as páginas públicas `[slug]/*` continuam em mock.
2. **Cardápio virou lista única, sem categorias** (o backend não tem esse conceito).
3. **Delivery ficou fora de escopo** (pedido sempre exige `mesa_id`).
4. **Papéis**: mantido `superadmin` no front como conceito futuro (sem página nova), adicionado `entregador` com tela própria de entregas.

O escopo desta etapa ficou **focado na aplicação de staff** (`/app/...` + `/login`).

## O que foi implementado

### Fase 0 — Fundação (cliente HTTP e tipos)
- `src/lib/api/client.ts`: `BASE_URL` sem prefixo/versionamento; `apiGet/apiPost/apiPatch/apiDelete` retornam `T` direto (sem `.data`); `extractErrorMessage()` normaliza `{erro}` (401/403) e o objeto cru do ActiveModel::Errors (422) numa string única; 204 tratado sem tentar `.json()`.
- `src/types/api.ts` e `src/types/domain.ts`: reescritos para bater com o contrato real (`LoginPayload {login, password}`, `Produto` sem categoria, `Mesa {numero, nome_cliente, status}`, `Pedido {mesa_id, usuario_id, status, valor_total}`, `ItemPedido {produto_id, quantidade, preco_unitario}`, `Cupom`, `Entrega`, `UserRole` com `entregador`). Ids são `number`.
- `src/types/domain.legacy.ts` (novo): guarda o modelo antigo completo (`Restaurante`, `Categoria`, `Produto` com grupos/variações, `Pedido` com itens embutidos etc.), usado só por `src/lib/mock.ts` e pelas páginas públicas do cliente, que continuam mock.
- `src/lib/store/session.ts`: sessão sem `restaurante_id`; bump de versão do `persist` (sessões antigas em localStorage são descartadas).

### Fase 1 — Autenticação
- `src/lib/api/queries/auth.ts` (novo): `useLogin()` → `POST /login`.
- `src/app/login/page.tsx`: abas de demo removidas, formulário único login/senha, redireciona por papel real vindo da API (`admin/superadmin` → dashboard, `entregador` → entregas, resto → pedidos).
- `src/proxy.ts`: nova constante `SALAO_ONLY_APP_PATHS` (mesas, PDV) bloqueada para `entregador`.
- `src/app/app/layout.tsx`: nav com item "Entregas" (papel `entregador`/admin) e "Cupons" (admin).

### Fase 2 — Mesas
- `src/lib/api/queries/mesas.ts`: `useMesas`, `useMesa`, `useCriarMesa`, `useAtualizarMesa`, `useExcluirMesa` (sem mais `abrir`/`fechar` como ações próprias — status muda por `PATCH` direto).
- `src/app/app/mesas/page.tsx`: dados reais; removido o status "conta pedida"/"reservada" (enum real é só `livre/ocupada/fechada`); pedido em aberto da mesa é resolvido filtrando `usePedidos()` por `mesa_id`.

### Fase 3 — Pedidos (KDS, PDV, fechamento)
- `src/lib/api/queries/orders.ts`: `usePedidos`, `usePedido`, `useCriarPedido`, `useAtualizarStatus`, `useFecharPedido` (sem payload — backend não aceita forma de pagamento), `useItensPedido`, `useAdicionarItem`, `useAtualizarItem`, `useRemoverItem`.
- `src/app/app/pedidos/page.tsx` (KDS): vocabulário de status remapeado (`aberto→preparando→pronto→entregue`, um passo a menos que antes).
- `src/app/app/pedidos/novo/page.tsx` (PDV): carrinho local como antes; só no "Enviar para cozinha" é que cria o pedido (`POST /pedidos`) e depois os itens em sequência (`POST .../item_pedidos` um a um).
- `src/components/team/FecharContaModal.tsx`: forma de pagamento só é usada pro cupom exibido (não é enviada à API); `confirmarFechamento` chama só `POST /pedidos/:id/fechar`.

### Fase 4 — Cardápio
- `src/lib/api/queries/menu.ts`: CRUD de produtos sem categoria.
- `src/app/app/cardapio/page.tsx` + `ProdutoFormModal.tsx`: lista única, sem abas de categoria nem drag-reorder (sem campo `ordem` no backend). `CategoriaFormModal.tsx` removido.

### Fase 5 — Cupons (nova)
- `src/lib/api/queries/cupons.ts` + `src/app/app/cupons/page.tsx` (admin-only): CRUD completo (código, desconto %, validade, ativo).

### Fase 6 — Entregas (nova)
- `src/lib/api/queries/entregas.ts` + `src/app/app/entregas/page.tsx`: lista de entregas (backend já filtra por papel — entregador só vê as suas), avança status `pendente → em_transporte → entregue`.

### Fase 7 — Deixado como mock (sem contrato de API ainda)
- **Páginas públicas do cliente** (`[slug]/page`, `menu`, `sacola`, `delivery`, `pedido/[id]`) — checkout pausado, seguem 100% mock via `types/domain.legacy.ts`.
- **Dashboard** (`/app/dashboard`) — sem endpoint de KPI.
- **Impressão de cupom/comanda** — sem endpoint, simulada com `setTimeout`.
- **Config → aba "Equipe"** — sem endpoint de gestão de usuários, mock local.
- **Config → aba "Restaurante"** — removida (entidade não existe mais no backend).

## Pontos a confirmar com o backend rodando de verdade

1. Se `item_pedidos` vem embutido no JSON de `GET /pedidos/:id` ou só via endpoint separado (o front sempre busca via `GET /pedidos/:id/item_pedidos`, que funciona nos dois casos, mas dá pra evitar uma chamada extra se vier embutido).
2. Shape exato de `usuario` retornado por `POST /login` (assumido `{id, nome?, login?, role}`).
3. Se `POST /pedidos/:id/fechar` já muda o status da mesa para `livre` sozinho (o front não faz nenhuma chamada extra de mesa depois de fechar o pedido, assumindo que sim).
4. Se `Pedido`/outros recursos têm `created_at`/`updated_at` no JSON (usado pro "há quanto tempo" no KDS — se não vier, esse campo some da UI silenciosamente).

## Verificação

- `npx tsc --noEmit`, `npm run lint`, `npm run build` — todos passando.
- Sem backend real disponível neste ambiente para teste end-to-end; falta validar manualmente: login → mesas → PDV → KDS → fechar conta → cardápio/cupons (CRUD admin) → entregas (papel entregador).

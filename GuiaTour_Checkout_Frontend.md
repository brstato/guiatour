# GuiaTour — Checkout de assinatura no painel React

## Objetivo

Criar no painel React uma tela de **assinatura** onde o comerciante:

1. escolhe o **plano**;
2. escolhe a **forma de pagamento** (Pix, cartão de crédito ou boleto);
3. paga (Pix aparece na própria tela; cartão e boleto abrem a fatura do Asaas);
4. vê a situação da assinatura e a data até quando a página fica no ar.

O **vendedor** usa a mesma tela para gerar a cobrança de um comerciante dele e enviar o link por WhatsApp.

Comerciante com mensalidade **vencida continua entrando no painel** e é levado direto para a assinatura.

## Regras

- Alteração **aditiva**: não refatorar o que já existe. Os arquivos existentes recebem só os trechos descritos na seção 4.
- **Nenhuma dependência nova.** Já existem: `axios`, `@tanstack/react-query`, `react-router-dom`, `lucide-react`, componentes em `src/components/ui` (`Button`, `buttonVariants`, `Card`, `Input`).
- **Nunca** pedir nem guardar número de cartão. O cartão é digitado na página do Asaas (`invoice_url`).
- **Nunca** enviar valor do plano pelo front. O valor vem do servidor.
- Padrão do projeto: `Página → Hook (controller) → Service → API`. Services como singleton. Alias `@/` para `src/`.
- TypeScript estrito do projeto: usar `import type` para tipos, sem `enum`, sem variáveis não usadas.
- Textos da interface em português.

---

## 1. Contrato da API

Base: `api/v1/` (a instância `api` de `@/services/api` já tem a base e injeta o token).
Erros vêm como `{ "success": false, "error": "mensagem" }`.

| Método | Rota | Quem | Para quê |
|---|---|---|---|
| GET | `assinatura/planos` | logado | lista de planos |
| GET | `assinatura` | logado | situação, validade, últimas cobranças |
| POST | `assinatura/checkout` | logado | cria assinatura |
| GET | `assinatura/pix` | logado | QR Code Pix da cobrança em aberto |
| POST | `assinatura/cancelar` | logado | cancela a assinatura |

**Vendedor:** em todas as chamadas acima (exceto `planos`), enviar `id_loja` = UUID do comerciante (query nos GET, corpo nos POST). **Comerciante:** não enviar `id_loja`.

### GET `assinatura/planos`

```json
{ "itens": [
  { "codigo": "BASICO_MENSAL", "nome": "Básico",
    "descricao": "Página própria|Presença no catálogo|Métricas",
    "valor": 49.9, "ciclo": "MONTHLY" } ] }
```

`descricao` são itens separados por `|` (mostrar como lista com check).
`ciclo`: `WEEKLY | BIWEEKLY | MONTHLY | BIMONTHLY | QUARTERLY | SEMIANNUALLY | YEARLY`.

### GET `assinatura`

```json
{ "validade": "2026-11-18",
  "assinatura": "sub_xxx",
  "status": "PENDENTE",
  "valor": 49.9, "ciclo": "MONTHLY",
  "forma_pagamento": "PIX",
  "plano": "BASICO_MENSAL", "plano_nome": "Básico",
  "precisa_documento": true,
  "cobrancas": [
    { "id": "pay_xxx", "valor": 49.9, "vencimento": "2026-10-04",
      "pago_em": null, "status": "PENDING", "invoice_url": "https://..." } ] }
```

- `status`: `SEM_ASSINATURA | PENDENTE | ATIVA | INADIMPLENTE | CANCELADA`.
- Sem assinatura: `assinatura: null`, `status: "SEM_ASSINATURA"` e sem `cobrancas`.
- `validade` pode ser `null`. Datas são `yyyy-mm-dd`.
- `precisa_documento: true` = ainda não existe cliente no Asaas, então pedir CPF/CNPJ.
- `status` de cobrança: `PENDING`, `CONFIRMED`, `RECEIVED`, `OVERDUE`, `REFUNDED`.

### POST `assinatura/checkout`

Corpo:

```json
{ "plano": "BASICO_MENSAL", "forma_pagamento": "PIX",
  "cpf_cnpj": "12345678909", "id_loja": "uuid-so-vendedor" }
```

- `forma_pagamento`: `PIX | BOLETO | CREDIT_CARD`.
- `cpf_cnpj`: só dígitos, **só enviar quando `precisa_documento` for true**.
- `id_loja`: só o vendedor envia.

Resposta `201`:

```json
{ "assinatura": "sub_xxx", "status": "PENDENTE", "forma_pagamento": "PIX",
  "invoice_url": "https://...",
  "plano": { "codigo": "BASICO_MENSAL", "nome": "Básico", "valor": 49.9, "ciclo": "MONTHLY" },
  "pix": { "payload": "000201...", "qr_base64": "iVBOR...", "expira_em": "2026-10-05" } }
```

`pix` só vem quando a forma é `PIX`. `invoice_url` pode vir vazio logo após criar. Nesse caso a tela espera pelo polling do `GET assinatura`.

Erros: `400` dados inválidos, `409` já existe assinatura em andamento, `502` erro do Asaas (mostrar `error`).

### GET `assinatura/pix`

Resposta: `{ "payload": "...", "qr_base64": "...", "expira_em": "..." }`. `404` se não há cobrança em aberto.

### Mudança no login (já feita no backend)

As respostas de **login Google** e **renovação de token** passaram a trazer:

```json
{ "tipo": "loja", "vencida": true }
```

`vencida: true` = mensalidade vencida (o login funciona normalmente; antes dava 403).

---

## 2. Arquivos a CRIAR

```text
src/features/billing/
  types.ts
  services/billingService.ts
  hooks/useBilling.ts
  lib/documento.ts
  lib/format.ts
  components/PlanCard.tsx
  components/PaymentMethodPicker.tsx
  components/PixPayment.tsx
  components/SubscriptionStatusCard.tsx
  pages/BillingPage.tsx
src/features/vendor/pages/VendorBillingPage.tsx
```

## 3. Arquivos a ALTERAR

```text
src/types/api.ts                              (campo vencida)
src/features/auth/services/authService.ts     (ler vencida)
src/features/auth/hooks/useAuthController.ts  (redirecionar)
src/routes/index.tsx                          (2 rotas novas)
src/components/TabBar.tsx                     (aba Assinatura)
src/features/vendor/pages/VendorDashboardPage.tsx  (botão Cobrança)
```

---

## 4. Código por seção

### 4.1 `features/billing/types.ts`

```ts
export type FormaPagamento = "PIX" | "BOLETO" | "CREDIT_CARD";
export type StatusAssinatura = "SEM_ASSINATURA" | "PENDENTE" | "ATIVA" | "INADIMPLENTE" | "CANCELADA";
export type CicloPlano =
  | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "BIMONTHLY" | "QUARTERLY" | "SEMIANNUALLY" | "YEARLY";

export interface Plano {
  codigo: string;
  nome: string;
  descricao: string; // itens separados por "|"
  valor: number;
  ciclo: CicloPlano;
}

export interface Cobranca {
  id: string;
  valor: number;
  vencimento: string | null;
  pago_em: string | null;
  status: string;
  invoice_url: string;
}

export interface AssinaturaStatus {
  validade: string | null;
  assinatura: string | null;
  status: StatusAssinatura;
  valor?: number;
  ciclo?: CicloPlano;
  forma_pagamento?: FormaPagamento | "UNDEFINED";
  plano?: string;
  plano_nome?: string;
  cobrancas?: Cobranca[];
  precisa_documento?: boolean;
}

export interface PixData {
  payload: string;
  qr_base64: string;
  expira_em: string;
}

export interface CheckoutPayload {
  plano: string;
  forma_pagamento: FormaPagamento;
  cpf_cnpj?: string;
  id_loja?: string; // só vendedor
}

export interface CheckoutResponse {
  assinatura: string;
  status: StatusAssinatura;
  forma_pagamento: FormaPagamento;
  invoice_url: string;
  plano: { codigo: string; nome: string; valor: number; ciclo: CicloPlano };
  pix?: PixData;
}
```

### 4.2 `features/billing/services/billingService.ts`

Singleton, mesmo padrão dos outros services.

```ts
import { api } from "@/services/api";
import type { AssinaturaStatus, CheckoutPayload, CheckoutResponse, PixData, Plano } from "../types";

class BillingService {
  async listPlans(): Promise<Plano[]> {
    const response = await api.get("assinatura/planos");
    return response.data.itens ?? [];
  }
  async getStatus(lojaId?: string): Promise<AssinaturaStatus> {
    const response = await api.get("assinatura", { params: lojaId ? { id_loja: lojaId } : undefined });
    return response.data;
  }
  async getPix(lojaId?: string): Promise<PixData> {
    const response = await api.get("assinatura/pix", { params: lojaId ? { id_loja: lojaId } : undefined });
    return response.data;
  }
  async checkout(payload: CheckoutPayload): Promise<CheckoutResponse> {
    const response = await api.post("assinatura/checkout", payload);
    return response.data;
  }
  async cancel(lojaId?: string): Promise<void> {
    await api.post("assinatura/cancelar", lojaId ? { id_loja: lojaId } : {});
  }
}

export const billingService = new BillingService();
```

### 4.3 `features/billing/hooks/useBilling.ts`

Regra central: **enquanto a assinatura estiver `PENDENTE` ou `INADIMPLENTE`, consultar o status a cada 5 s.** É assim que a tela vira "Assinatura ativa" sozinha quando o webhook confirma o pagamento.

```ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { billingService } from "../services/billingService";
import type { CheckoutPayload } from "../types";

const WAITING_PAYMENT = ["PENDENTE", "INADIMPLENTE"];

export function useBilling(lojaId?: string) {
  const queryClient = useQueryClient();
  const scope = lojaId ?? "me";

  const plans = useQuery({
    queryKey: ["billing", "plans"],
    queryFn: () => billingService.listPlans(),
    staleTime: 1000 * 60 * 10,
  });

  const status = useQuery({
    queryKey: ["billing", "status", scope],
    queryFn: () => billingService.getStatus(lojaId),
    staleTime: 0,
    refetchInterval: (query) =>
      query.state.data && WAITING_PAYMENT.includes(query.state.data.status) ? 5000 : false,
  });

  const checkout = useMutation({
    mutationFn: (payload: Omit<CheckoutPayload, "id_loja">) =>
      billingService.checkout({ ...payload, id_loja: lojaId }),
    onSuccess: (data) => {
      if (data.pix) queryClient.setQueryData(["billing", "pix", scope], data.pix);
      queryClient.invalidateQueries({ queryKey: ["billing", "status", scope] });
    },
  });

  const cancel = useMutation({
    mutationFn: () => billingService.cancel(lojaId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["billing", "pix", scope] });
      queryClient.invalidateQueries({ queryKey: ["billing", "status", scope] });
    },
  });

  return { plans, status, checkout, cancel };
}

export function usePix(lojaId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["billing", "pix", lojaId ?? "me"],
    queryFn: () => billingService.getPix(lojaId),
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: 0,
  });
}
```

### 4.4 `features/billing/lib/documento.ts`

Funções puras:

- `onlyDigits(value): string`
- `isValidCpf(value): boolean` e `isValidCnpj(value): boolean` (dígitos verificadores; rejeitar sequências repetidas como `11111111111`)
- `isValidDocumento(value): boolean` (11 dígitos = CPF, 14 = CNPJ)
- `maskDocumento(value): string`: máscara enquanto digita. Até 11 dígitos `000.000.000-00`, de 12 a 14 `00.000.000/0000-00`.

### 4.5 `features/billing/lib/format.ts`

Funções puras:

- `formatMoney(n)`: `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })`.
- `formatDate("2026-02-18") → "18/02/2026"`. **Não usar `new Date()` para isso** (dá erro de fuso). Quebrar a string. Vazio retorna `"—"`.
- `daysUntil(iso): number | null`: dias entre hoje e a data, usando `Date.UTC` nos dois lados.
- `cycleSuffix(ciclo)`: `MONTHLY → "/mês"`, `YEARLY → "/ano"`, `WEEKLY → "/semana"`, `BIWEEKLY → "/quinzena"`, `BIMONTHLY → "/bimestre"`, `QUARTERLY → "/trimestre"`, `SEMIANNUALLY → "/semestre"`.
- `FORMA_LABEL`: `PIX → "Pix"`, `BOLETO → "Boleto"`, `CREDIT_CARD → "Cartão de crédito"`, `UNDEFINED → "A escolher na fatura"`.
- `STATUS_LABEL`: `PENDENTE → "Aguardando pagamento"`, `ATIVA → "Assinatura ativa"`, `INADIMPLENTE → "Pagamento em atraso"`, `CANCELADA → "Cancelada"`, `SEM_ASSINATURA → "Sem assinatura"`.
- `cobrancaLabel(status)`: `PENDING → "Aguardando"`, `CONFIRMED → "Confirmada"`, `RECEIVED → "Paga"`, `OVERDUE → "Vencida"`, `REFUNDED → "Estornada"`. Desconhecido devolve o próprio texto.
- `copyText(text): Promise<boolean>`: `navigator.clipboard.writeText` em try/catch.
- `errorMessage(error, fallback)`: lê `error.response.data.error`, depois `.message`, depois `fallback`.

### 4.6 Componentes (`features/billing/components/`)

Estilo: o do painel (azul `#2563eb`, slate, cantos `rounded-2xl`, mesmo visual dos cards de `MetricasPage`). Selecionado = `border-[#2563eb] ring-2 ring-[#2563eb]/20`.

**`PlanCard`**: props `{ plano, selected, onSelect(codigo) }`. É um `<button type="button" role="radio" aria-checked>`. Mostra nome, preço (`formatMoney` + `cycleSuffix`), bolinha de seleção com check e a lista de itens (`descricao.split("|")`, cada um com ícone `Check` verde).

**`PaymentMethodPicker`**: props `{ value: FormaPagamento | null, onChange }`. Três botões `role="radio"` num `role="radiogroup"` (grid de 3 colunas no desktop, empilhado no celular):

- Pix, "Aprovação na hora", ícone `QrCode`
- Cartão de crédito, "Renova sozinho todo ciclo", ícone `CreditCard`
- Boleto, "Compensa em dias úteis", ícone `Barcode`

Começa **sem seleção**.

**`PixPayment`**: props `{ pix, isLoading, isError, onRetry, invoiceUrl? }`.

- Carregando: spinner e "Gerando o QR Code…".
- Erro ou sem dados: aviso, botão "Tentar de novo" e, se houver `invoiceUrl`, botão "Pagar pela fatura" (abre em nova aba com `rel="noopener noreferrer"`).
- Normal: `<img src={`data:image/png;base64,${pix.qr_base64}`}>`, campo `readOnly` com o `payload`, botão "Copiar" (vira "Copiado" por 2,5 s), texto "Aguardando o pagamento. Esta tela atualiza sozinha." e "QR Code válido até {formatDate(expira_em)}".

**`SubscriptionStatusCard`**: props `{ data: AssinaturaStatus }`. Card com ícone e selo coloridos pelo status (`ATIVA` verde, `PENDENTE` âmbar, `INADIMPLENTE` vermelho), nome do plano, `valor + cycleSuffix · forma`, "Página no ar até {validade}" e, abaixo, "Últimas cobranças" (valor, "Paga em…" ou "Vence em…", selo do status da cobrança).

### 4.7 `features/billing/pages/BillingPage.tsx` (principal)

Exportar `BillingPage` (nomeado). Container `mx-auto max-w-2xl space-y-6 p-6 pb-12`.

**Quem é o alvo (lojaId):**

```ts
const { id, uuid } = useParams<{ id?: string; uuid?: string }>();
const isVendor = localStorage.getItem("role")?.trim().toLowerCase() === "vendedor";
const lojaId = isVendor ? (uuid ?? (id && id !== "me" ? id : undefined)) : undefined;
```

Vendedor sem `lojaId`: mostrar erro "Comerciante não identificado. Volte ao painel e escolha um comércio."

**Derivados do status:**

```ts
const emAndamento = ["PENDENTE", "ATIVA", "INADIMPLENTE"].includes(data.status);
const aguardando  = data.status === "PENDENTE" || data.status === "INADIMPLENTE";
const cobrancaAberta = data.cobrancas?.find(c => c.status === "PENDING" || c.status === "OVERDUE");
const invoiceUrl = cobrancaAberta?.invoice_url ?? "";
const usaPix = aguardando && data.forma_pagamento === "PIX";
const pix = usePix(lojaId, usaPix);
```

**A) Sem assinatura em andamento** (`SEM_ASSINATURA` ou `CANCELADA`):

1. Faixa de validade no topo (azul normal; âmbar se faltam 7 dias ou menos; vermelha se já passou: "A página saiu do ar em {data}. Assine para voltar ao catálogo."). Se `CANCELADA`, acrescentar "A assinatura anterior foi cancelada.".
2. **Passo 1, "Escolha o plano":** grid de `PlanCard`. Plano selecionado por padrão = o primeiro da lista.
3. **Passo 2, "Como prefere pagar?":** `PaymentMethodPicker`. Com cartão selecionado, mostrar a nota "Os dados do cartão são digitados na página segura do Asaas e não passam pelo Guia Tour."
4. **Passo 3, CPF/CNPJ**: **só se `precisa_documento`**. `Input` com `maskDocumento`, `inputMode="numeric"`, erro "Confira o número informado." quando inválido.
5. Botão "Continuar para o pagamento": desabilitado até ter plano, forma e (se exigido) documento válido; durante o envio mostra spinner e "Gerando pagamento…". No clique:

```ts
checkout.mutate({
  plano, forma_pagamento: forma,
  cpf_cnpj: precisaDocumento ? onlyDigits(documento) : undefined,
});
```

Erro do checkout aparece abaixo do botão (`role="alert"`, texto de `errorMessage`).

**B) Assinatura em andamento:**

1. `SubscriptionStatusCard`.
2. Se `aguardando`, um card "Falta só o pagamento" (ou "Regularize o pagamento" se `INADIMPLENTE`):
   - Pix: `PixPayment`.
   - Cartão: botão "Pagar com cartão" que abre `invoiceUrl` em nova aba.
   - Boleto: botão "Abrir fatura" que abre `invoiceUrl` em nova aba.
   - `invoiceUrl` vazio: "Gerando a fatura…" com spinner.
   - Com `invoiceUrl`: botão "Copiar link de pagamento" e, **só para vendedor**, "Enviar por WhatsApp" abrindo `https://wa.me/?text=` + `encodeURIComponent("Olá! Segue o link para pagar a mensalidade do Guia Tour (<plano_nome>): <invoiceUrl>")`.
3. Ações:
   - `PENDENTE`: botão "Trocar plano ou forma de pagamento" (chama `cancel`; ao terminar o status vira `CANCELADA` e o checkout reaparece).
   - `ATIVA` ou `INADIMPLENTE`: "Cancelar assinatura" com confirmação em linha ("Ao cancelar, não haverá novas cobranças. A página continua no ar até {validade}." com "Sim, cancelar" e "Voltar").

Estados gerais: `status.isLoading` mostra skeleton; `status.isError` mostra o erro com "Tentar novamente".

### 4.8 `features/vendor/pages/VendorBillingPage.tsx`

Casca para o vendedor: `VendorHeader` no topo, botão "Voltar ao painel" (`navigate("/vendedor")`) e `<BillingPage />` dentro. Mesmo layout de `VendorDashboardPage` (`min-h-screen bg-slate-50 flex flex-col`). Export default.

### 4.9 `src/routes/index.tsx`

Importar:

```tsx
import VendorBillingPage from "../features/vendor/pages/VendorBillingPage";
import { BillingPage } from "../features/billing/pages/BillingPage";
```

Dentro dos `children` de `/vendedor` (ao lado de `pontos/novo`):

```tsx
{ path: "comerciantes/:uuid/assinatura", element: <VendorBillingPage /> },
```

Dentro dos `children` de `/loja/:id` (ao lado de `metricas`):

```tsx
{ path: "assinatura", element: <BillingPage /> },
```

### 4.10 `src/components/TabBar.tsx`

Importar `CreditCard` de `lucide-react` e acrescentar à lista:

```ts
{ to: "assinatura", label: "Assinatura", icon: CreditCard },
```

### 4.11 `src/features/vendor/pages/VendorDashboardPage.tsx`

Na lista "Comércios Criados", ao lado do botão "Visualizar", acrescentar o botão **Cobrança** (ícone `CreditCard`; o texto some no celular com `hidden sm:inline`) que faz:

```ts
navigate(`/vendedor/comerciantes/${item.uuid}/assinatura`)
```

Agrupar os dois botões num `div` `flex shrink-0 items-center gap-2`.

### 4.12 Login: levar o comerciante vencido para a assinatura

**`src/types/api.ts`:** acrescentar `vencida?: boolean;` em `LoginResult` e em `RefreshResult`.

**`authService.ts`:** em `refreshToken(...)` (retorno de sucesso) e em `parseLoginResponse(...)` (retorno 200), acrescentar:

```ts
vencida: response.data.vencida === true,
```

**`useAuthController.ts`:** criar o helper acima do hook e usá-lo nos **três** pontos que hoje decidem o destino (auto-login, login por e-mail, login Google):

```ts
function destinoPosLogin(role: string | undefined, vencida: boolean | undefined, fallback: string): string {
  if (role === "vendedor") return "/vendedor";
  if (vencida) return "/loja/me/assinatura";
  return fallback;
}
```

- auto-login: `navigate(destinoPosLogin(role, result.vencida, '/portfolio'))`
- login e-mail e login Google: `navigate(destinoPosLogin(role, result.vencida, '/dashboard'))`

Substitui os `if (role === 'vendedor') {...} else {...}` atuais. `LoginPage` não muda.

---

## 5. Fora do escopo

- Travar as outras abas para quem está vencido. Hoje o comerciante vencido é **levado** à assinatura, mas ainda pode abrir Editar e Métricas.
- Formulário de cartão dentro do painel.
- Tela para cadastrar ou editar planos (os planos ficam numa tabela do banco).

## 6. Como testar

1. `npx tsc -b`, `npx oxlint` e `npx vite build` sem erros.
2. Comerciante sem assinatura: aba **Assinatura** mostra planos; botão desabilitado até escolher a forma de pagamento.
3. Primeira vez: aparece o campo CPF/CNPJ; um número inválido mostra erro e bloqueia o botão.
4. Pix: QR Code e "copia e cola" aparecem sem sair da tela; ao pagar no sandbox, a tela vira "Assinatura ativa" sozinha em até 5 s.
5. Cartão e boleto: o botão abre a fatura do Asaas em nova aba.
6. Duplo clique em "Continuar": só uma assinatura é criada (o servidor devolve `409` na segunda).
7. Vendedor: botão **Cobrança** abre a tela do comerciante certo; "Enviar por WhatsApp" aparece só para ele.
8. Comerciante vencido: ao entrar (login Google, entrada automática com sessão salva) cai em `/loja/me/assinatura`.
9. Vendedor sempre cai em `/vendedor`, inclusive na entrada automática.

# Navbar de abas + Dashboard de métricas — instruções de construção

Stack de referência: React 19 + TypeScript, Tailwind CSS 4, shadcn/ui + @base-ui/react, React Router 7, TanStack Query, Axios, Lucide React.

---

## 1. Navbar (bottom tab bar)

Substitui o botão fixo único "Ver página pública" no rodapé por uma barra de abas com dois destinos: **Editar** e **Métricas**. As duas abas trocam o conteúdo da tela, não empilham conteúdo — cada uma mantém seu próprio scroll curto.

### 1.1 Estrutura de rotas

Usar duas rotas filhas dentro do layout do perfil, para preservar histórico de navegação e permitir deep-link direto (ex: abrir o app já na aba de métricas via notificação):

```
/tatuador/:id/editar     -> tela atual (acordeão de seções)
/tatuador/:id/metricas   -> nova tela (dashboard)
```

O componente de layout (`PerfilLayout`) renderiza o cabeçalho compacto + `<Outlet />` do React Router 7 + a tab bar fixa. As duas rotas viram `children` dessa rota de layout.

### 1.2 Componente da tab bar

- Fixar com `position: sticky; bottom: 0` (não `fixed`, para não sobrepor o teclado virtual ao abrir campos de texto na aba Editar em iOS/Android).
- Dois itens, cada um com ícone (Lucide `Pencil` e `BarChart3`) + label, ativo em laranja (`text-orange-500` / cor de marca), inativo em cinza-azulado (`text-slate-400`).
- Indicador de aba ativa: barra fina de 2px acima do ícone ativo (`absolute top-0 h-0.5 bg-orange-500 rounded-full`), não preencher o fundo do item inteiro — mantém a barra discreta sobre o fundo escuro.
- Usar `NavLink` do React Router para estado ativo automático via `isActive`, evitando gerenciar estado de aba manualmente.
- Altura fixa de 56–60px, área de toque mínima de 44px por item (acessibilidade mobile).

```tsx
// components/TabBar.tsx
import { NavLink } from "react-router-dom";
import { Pencil, BarChart3 } from "lucide-react";

const tabs = [
  { to: "editar", label: "Editar", icon: Pencil },
  { to: "metricas", label: "Métricas", icon: BarChart3 },
];

export function TabBar() {
  return (
    <nav className="sticky bottom-0 flex border-t border-slate-800 bg-[#0f1428]">
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `relative flex flex-1 flex-col items-center gap-1 py-2.5 ${
              isActive ? "text-orange-500" : "text-slate-400"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute top-0 left-[30%] right-[30%] h-0.5 rounded-full bg-orange-500" />
              )}
              <Icon size={19} />
              <span className="text-[11px] font-medium">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
```

### 1.3 Cabeçalho compacto (comum às duas abas)

Substitui o card grande de perfil (foto + nome + bio) que hoje existe só na aba Editar. No layout novo, ele vira uma faixa fina, comum às duas abas:

- Avatar pequeno (36px), nome, e o link do subdomínio (`<slug>.guiatour.online` / subdomínio público) como texto secundário.
- Badge de progresso de preenchimento (ex: "100%") alinhado à direita, cor de sucesso (`text-emerald-400 bg-emerald-400/10`).
- Esse cabeçalho fica fora do `<Outlet />`, direto no `PerfilLayout`, para não ser recriado ao trocar de aba.

---

## 2. Botão "Ver página pública" — fica fixo só na aba Editar

Não é mais um botão de largura total no rodapé (esse espaço agora é da tab bar). Duas opções, escolher uma:

**Opção recomendada — ícone no app bar superior:**
Ícone `ExternalLink` (Lucide) no cabeçalho superior fixo (ao lado de "Sair"), visível em **ambas** as abas — útil também na aba de métricas, quando o tatuador quiser conferir a página enquanto olha os números.

**Alternativa — botão sticky só na aba Editar:**
Se preferir manter o comportamento de "só aparece durante a edição", usar um botão sticky logo abaixo do último card do acordeão (não fixo na viewport inteira, para não competir visualmente com a tab bar):

```tsx
// dentro da rota /editar, após o último AccordionItem
<div className="sticky bottom-[64px] px-4 pb-3 bg-gradient-to-t from-[#0f1428] pt-4">
  <Button asChild className="w-full bg-orange-500 hover:bg-orange-600 text-[#2c1400]">
    <a href={publicUrl} target="_blank" rel="noopener noreferrer">
      <ExternalLink className="mr-2 h-4 w-4" /> Ver página pública
    </a>
  </Button>
</div>
```

Note o `bottom-[64px]`: precisa ficar **acima** da tab bar (que tem ~60px de altura), nunca sobreposto a ela.

---

## 3. Dashboard de métricas (aba "Métricas")

### 3.1 Fonte dos dados (backend)

O front não chama a Search Console API nem a Business Profile Performance API diretamente — ambas exigem credenciais server-side (conta de serviço / OAuth). Criar um endpoint agregador no backend que já devolve os números prontos para o componente, por exemplo:

```
GET /api/tatuadores/:id/metricas?periodo=28d
```

Resposta sugerida:

```json
{
  "visibilidade": { "total": 337, "variacao_pct": 18, "busca": 249, "perfil_maps": 88 },
  "acoes": { "cliques_site": 16, "ligacoes": 4, "pedidos_rota": 7 },
  "termos": [
    { "consulta": "tatuagem angra dos reis", "posicao": 4 },
    { "consulta": "piercing angra dos reis", "posicao": 8 }
  ]
}
```

### 3.2 Data fetching (TanStack Query)

```tsx
// hooks/useMetricas.ts
export function useMetricas(tatuadorId: string) {
  return useQuery({
    queryKey: ["metricas", tatuadorId],
    queryFn: () => api.get(`/tatuadores/${tatuadorId}/metricas`).then(r => r.data),
    staleTime: 1000 * 60 * 30, // 30 min — esses dados não mudam a cada segundo
  });
}
```

### 3.3 Composição de componentes

```
MetricasPage
 ├── ResumoVisibilidadeCard   (número grande + variação + 2 sub-métricas)
 ├── AcoesGeradasCard         (grid 2 colunas: cliques, ligações, rotas)
 └── TermosPosicaoCard        (lista de consultas + badge de posição)
```

- **Cores dos badges de posição**: verde (`emerald`) para posição ≤5, laranja (`orange`) para posição 6–10, cinza para >10 — reaproveitar os tokens de cor semântica já usados no resto do app, não introduzir uma paleta nova só para isso.
- **Cards**: reaproveitar o componente `Card` do shadcn já usado no acordeão de edição, só trocando o conteúdo interno — mantém consistência visual sem esforço extra de estilização.
- Ícones sugeridos (Lucide): `Search` (busca), `MapPin` (perfil Maps), `Globe` (cliques no site), `Phone` (ligações), `Navigation` (pedidos de rota), `TrendingUp` (variação).

### 3.4 Estados a tratar

- **Loading**: skeleton nos 3 cards (não spinner central) — mantém o layout estável enquanto carrega, evita "pulo" de conteúdo.
- **Vazio (tatuador novo, sem dados ainda)**: em vez de mostrar zeros secos, mensagem contextual tipo "Ainda coletando dados — normalmente os primeiros números aparecem em alguns dias." Evita transmitir que o recurso está quebrado.
- **Erro de API**: mensagem curta + botão "Tentar novamente" (`refetch()` do TanStack Query), nunca mostrar stack trace ou erro técnico cru.

### 3.5 Acessibilidade e performance

- Números formatados com `Intl.NumberFormat("pt-BR")` para separador de milhar correto.
- `staleTime` alto (30 min+) evita refetch a cada troca de aba — esses dados não precisam de tempo real.
- Testar com dados reais de um tatuador com volume baixo (como o Bruno hoje) para validar que o layout não quebra com números pequenos ou ausentes.

# Melhorias de design — Dashboard em cards expansíveis (Inkers)

> Este documento usa a tela de login como design system de referência (ver tokens abaixo). O objetivo desta mudança é reestruturar o dashboard atual — hoje um bloco único e corrido (identidade + Apresentação + Contato + Portfólio) — em **cards independentes e expansíveis**, com sinalização clara de progresso de preenchimento.

## Tokens de referência (definidos no login)

| Token | Valor |
|---|---|
| Fundo | Navy escuro (`#0f1420`) |
| Cor de destaque única | Laranja da marca (`#F7931E`) |
| Botão primário | Fundo laranja sólido, texto escuro, `border-radius` grande, altura ~48px |
| Botão/estado desabilitado | Mesma forma do botão primário, porém com opacidade reduzida (~40%) e sem interação — nunca trocar de cor, só de opacidade/estado |
| Texto primário | Branco/quase branco, peso médio |
| Texto secundário | Cinza-azulado claro (`#8a94a6`) |
| Cor de sucesso (status "completo") | Verde discreto (`#4ADE80` em navy escuro, ou equivalente com bom contraste) — reservado exclusivamente para indicar preenchimento completo, nunca usado como cor de ação/clique |

## Estrutura geral da tela (topo → rodapé)

1. Card de identidade + progresso (foto, nome, @usuário, % preenchido)
2. Card expansível — Apresentação
3. Card expansível — Contato & Localização
4. Card expansível — Trabalhos (portfólio)
5. Rodapé fixo com o botão "Ver página pública" (habilitado/desabilitado conforme progresso)

## Instruções de melhoria

### 1. Card de identidade com indicador de progresso
- Envolver a foto de perfil (e o bloco nome/@usuário) em um **card único**, distinto dos cards de seção abaixo — sinaliza que é a "capa" da página, não uma seção de conteúdo.
- Adicionar um indicador de progresso (percentual) diretamente associado a essa foto: por exemplo, um anel de progresso (`progress ring`) contornando a foto de perfil, com a cor laranja preenchendo proporcionalmente ao percentual, e o número (`%`) exibido de forma discreta (ex: badge pequeno no canto do avatar ou texto logo abaixo do nome).
- Esse percentual deve ser calculado a partir do preenchimento agregado das três seções abaixo (Apresentação, Contato & Localização, Trabalhos).
- Remover o botão "Ver página pública" desse card — ele passa a viver no rodapé (ver item 5).

### 2. Cards de seção expansíveis (Apresentação, Contato & Localização, Trabalhos)
Cada seção vira um card independente, recolhido por padrão (exceto talvez a primeira, se fizer sentido abrir por padrão na primeira visita). Cada cabeçalho de card deve conter, da esquerda para a direita:

- **Ícone temático da seção**: um ícone que represente o conteúdo (ex: documento/texto para Apresentação, telefone ou pin de mapa para Contato & Localização, imagem/galeria para Trabalhos).
- **Título da seção** (ex: "Apresentação"), em laranja — mesmo tratamento já usado hoje.
- **Ícone de status de preenchimento**, alinhado à direita do cabeçalho:
  - Seção completa: ícone de check (✓) usando o token **cor de sucesso** (verde discreto) — distinto do laranja de destaque para não confundir "isso está pronto" com "clique aqui".
  - Seção incompleta: ícone de alerta/aviso (ex: círculo vazio ou ponto de exclamação) em tom neutro/cinza — não deve parecer erro grave, apenas "pendente".
- **Ícone de expandir/recolher** (chevron), ao final do cabeçalho, indicando que o card é clicável/expansível.

Ao expandir, o conteúdo da seção aparece com a mesma hierarquia já definida anteriormente (rótulo em texto secundário, valor em texto primário, espaçamento de 12–16px entre pares).

### 3. Card "Trabalhos" (portfólio)
- Segue o mesmo padrão de cabeçalho expansível dos demais (ícone temático + título + status + chevron).
- Ao expandir, mostra a grade de fotos already definida (proporções padronizadas, `object-fit: cover`) e o botão "+ Adicionar Foto" no token de botão secundário.
- Regra de negócio: seção considerada **completa** a partir de **4 fotos ou mais** no portfólio. Abaixo disso, status permanece "pendente", mesmo com 1–3 fotos já adicionadas.

### 4. Rodapé fixo com o botão "Ver página pública"
- Botão fixado na parte inferior da tela (`sticky`/`fixed bottom`), sempre visível durante o scroll.
- Estado **desabilitado** (token de botão desabilitado) enquanto o progresso for menor que 100% — manter visível, mas sem interação, para o artista entender que precisa completar as seções.
- Estado **habilitado** (token de botão primário) assim que todas as seções estiverem completas.
- Considerar adicionar um texto de apoio pequeno acima do botão quando desabilitado (ex: "Complete todas as seções para publicar sua página"), em texto secundário — orienta o que falta sem precisar abrir cada card.

## Exemplo de componente (Accordion shadcn/base-ui + Lucide)

Exemplo de um card de seção expansível, usando `Accordion` do shadcn/ui (base-ui) e ícones do `lucide-react`. Mostra o padrão de cabeçalho (ícone temático + título + status + chevron nativo do Accordion) e o conteúdo expandido com hierarquia label/valor.

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FileText, Phone, Images, Check, Circle } from "lucide-react";

type SectionStatus = "complete" | "pending";

function SectionStatusIcon({ status }: { status: SectionStatus }) {
  if (status === "complete") {
    return <Check className="h-4 w-4 text-[#4ADE80]" strokeWidth={2.5} />;
  }
  return <Circle className="h-4 w-4 text-[#8a94a6]" strokeWidth={2} />;
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3.5 last:mb-0">
      <p className="mb-1 text-xs uppercase tracking-wide text-[#8a94a6]">
        {label}
      </p>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  );
}

export function ProfileSectionsAccordion() {
  // Em produção, estes viriam do estado real do perfil
  const apresentacaoStatus: SectionStatus = "complete";
  const contatoStatus: SectionStatus = "complete";
  const trabalhosCount = 2;
  const trabalhosStatus: SectionStatus =
    trabalhosCount >= 4 ? "complete" : "pending";

  return (
    <Accordion type="single" collapsible className="w-full space-y-3">
      {/* Apresentação */}
      <AccordionItem
        value="apresentacao"
        className="rounded-xl border-none bg-[#141a2b] px-4"
      >
        <AccordionTrigger className="py-4 hover:no-underline [&>svg]:text-[#8a94a6]">
          <div className="flex flex-1 items-center gap-3 pr-2">
            <FileText className="h-[18px] w-[18px] text-[#F7931E]" strokeWidth={1.75} />
            <span className="flex-1 text-left text-[15px] font-medium text-[#F7931E]">
              Apresentação
            </span>
            <SectionStatusIcon status={apresentacaoStatus} />
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <FieldRow label="Título" value="Bruno Ribeiro Tatuador em Angra dos Reis" />
          <FieldRow
            label="Subtítulo"
            value="Tatuador especializado em realismo em Angra dos Reis, com mais de 20 anos de experiência."
          />
          <FieldRow
            label="Bio"
            value="Sou Bruno Ribeiro, tatuador em Angra dos Reis especializado em realismo."
          />
        </AccordionContent>
      </AccordionItem>

      {/* Contato & Localização */}
      <AccordionItem
        value="contato"
        className="rounded-xl border-none bg-[#141a2b] px-4"
      >
        <AccordionTrigger className="py-4 hover:no-underline [&>svg]:text-[#8a94a6]">
          <div className="flex flex-1 items-center gap-3 pr-2">
            <Phone className="h-[18px] w-[18px] text-[#F7931E]" strokeWidth={1.75} />
            <span className="flex-1 text-left text-[15px] font-medium text-[#F7931E]">
              Contato &amp; Localização
            </span>
            <SectionStatusIcon status={contatoStatus} />
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <FieldRow label="Telefone" value="24998564421" />
          <FieldRow label="Email" value="brunoribeiroangra21@gmail.com" />
          <FieldRow label="Cidade" value="Angra dos Reis / RJ" />
        </AccordionContent>
      </AccordionItem>

      {/* Trabalhos */}
      <AccordionItem
        value="trabalhos"
        className="rounded-xl border-none bg-[#141a2b] px-4"
      >
        <AccordionTrigger className="py-4 hover:no-underline [&>svg]:text-[#8a94a6]">
          <div className="flex flex-1 items-center gap-3 pr-2">
            <Images className="h-[18px] w-[18px] text-[#F7931E]" strokeWidth={1.75} />
            <span className="flex-1 text-left text-[15px] font-medium text-[#F7931E]">
              Trabalhos
            </span>
            <SectionStatusIcon status={trabalhosStatus} />
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <p className="text-xs text-[#8a94a6]">
            {trabalhosCount} de 4 fotos mínimas adicionadas
          </p>
          {/* grade de fotos + botão "+ Adicionar Foto" entram aqui */}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
```

Pontos de atenção na implementação:
- O ícone de expandir/recolher (chevron) já vem embutido no `AccordionTrigger` do shadcn — não precisa adicionar manualmente, só ajustar a cor via `[&>svg]:text-[#8a94a6]`.
- `SectionStatusIcon` centraliza a regra visual de status — reaproveitar esse componente no card de identidade/progresso, se fizer sentido mostrar o mesmo ícone em outros lugares.
- O cálculo real de `apresentacaoStatus`, `contatoStatus` e `trabalhosStatus` deve vir de uma função/hook que valida os campos obrigatórios de cada seção — aqui estão fixos apenas para exemplificar o layout.

## Resumo da hierarquia final

1. Card de identidade: foto com anel/indicador de progresso + nome + @usuário.
2. Card expansível: Apresentação (ícone temático + status + chevron).
3. Card expansível: Contato & Localização (ícone temático + status + chevron).
4. Card expansível: Trabalhos (ícone temático + status + chevron).
5. Rodapé fixo: botão "Ver página pública", desabilitado até 100% de preenchimento.

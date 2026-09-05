# Correção — Scroll interno no campo Bio (card Apresentação)

## Problema

O campo "Bio", dentro do card expansível "Apresentação", está com altura fixa e `overflow-y: auto`. Quando o texto ultrapassa essa altura, o navegador desenha a barra de rolagem nativa (clara, grossa), que quebra visualmente o tema escuro do card.

## Instrução de correção

Remover a altura fixa e o overflow do campo Bio, deixando o card crescer verticalmente conforme o tamanho do conteúdo. Como a seção já está dentro de um `Accordion` expansível, não há necessidade de um scroll interno adicional — o usuário só vê o texto quando opta por abrir a seção.

### O que remover
- `max-height` (ou `max-h-*` no Tailwind) aplicado ao parágrafo/container da Bio.
- `overflow-y: auto` (ou `overflow-y-auto`) no mesmo elemento.
- Qualquer `overflow: hidden` combinado que dependa da altura fixa.

### O que manter
- O restante do estilo do campo (tipografia, cor de texto primário, espaçamento em relação ao rótulo "BIO") permanece igual ao dos outros campos do card (Título, Subtítulo).

## Exemplo (Tailwind / React)

```tsx
// Antes — gera o scroll interno indesejado
<p className="max-h-24 overflow-y-auto text-sm text-white">
  {bio}
</p>

// Depois — o card cresce junto com o texto
<p className="text-sm text-white">
  {bio}
</p>
```

Se o componente `FieldRow` (usado nos outros campos do card) já for reutilizado para a Bio, basta garantir que nenhuma variante de altura fixa seja passada especificamente para esse campo:

```tsx
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
```

## Resultado esperado
- O card "Apresentação", quando expandido, exibe a Bio inteira, sem barra de rolagem interna.
- A altura do card se ajusta automaticamente ao conteúdo (curto ou longo), mantendo consistência visual com o restante do Accordion.
- Nenhuma barra de rolagem nativa do navegador aparece dentro dos cards de seção.

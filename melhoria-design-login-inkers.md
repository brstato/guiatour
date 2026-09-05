# Melhorias de design — Tela de login (Inkers)

## Diagnóstico da versão atual

- Muito espaço vazio no topo da tela; a logo não aparece, deixando a tela sem identidade visual até o usuário rolar o olho para baixo.
- O botão "Suporte" está em branco com texto cinza claro, o que parece um botão desabilitado e confunde o usuário sobre se é clicável.
- Não há título, subtítulo ou qualquer texto de contexto explicando o que é a tela.
- O botão "Entrar com Google" não usa o ícone oficial do Google, o que reduz reconhecimento e confiança.
- Nenhum elemento gráfico reforça o universo da tatuagem — a tela poderia ser de qualquer produto genérico.

## Instruções de melhoria

### 1. Adicionar bloco de identidade no topo
- Ícone/logo do Inkers dentro de um container arredondado (`border-radius` grande), com fundo laranja bem translúcido (~10% de opacidade) atrás do ícone.
- Se ainda não existir um ícone/logo próprio para esse contexto, usar um ícone de pena (referência à tatuagem) como placeholder.

### 2. Adicionar título e subtítulo de boas-vindas
- Título: "Inkers" (peso médio, ~20–22px).
- Subtítulo curto abaixo, com cor mais suave: algo como "Sua página profissional de tatuador, sempre à mão." (máx. ~1–2 linhas, largura limitada para não esticar).

### 3. Corrigir hierarquia dos botões
- **Ação primária** ("Entrar com Google"): botão sólido, cor laranja da marca, texto escuro (não branco) para contraste, cantos arredondados, altura confortável para toque (~48px).
- Adicionar o **ícone oficial do Google** (as 4 cores) à esquerda do texto do botão.
- **Ação secundária** ("Suporte"): remover o botão branco cheio. Trocar por um **link de texto** simples, sem fundo, cor cinza-azulada suave — deixa claro que é uma ação secundária e evita a leitura de "botão desabilitado".

### 4. Reforçar identidade visual sem poluir
- Adicionar um elemento gráfico sutil (ex: círculo grande e bem transparente, cor laranja da marca) em um canto da tela, para preencher o vazio sem chamar atenção.
- Manter o fundo escuro (azul-marinho/navy) e o laranja como única cor de destaque — não introduzir novas cores.

### 5. Rodapé
- Manter o texto "inkers.com.br" centralizado, em cinza escuro/discreto, como assinatura da marca.

## Resumo da hierarquia final da tela

1. Identidade (ícone + nome + subtítulo) — centralizada, ocupa o espaço central da tela.
2. Botão primário: Entrar com Google.
3. Botão secundário (texto): Suporte.
4. Rodapé: inkers.com.br.

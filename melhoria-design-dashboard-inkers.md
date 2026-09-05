# Melhorias de design — Dashboard / Perfil (Inkers)

> Este documento usa a tela de login como referência de design system. Todos os tokens (cor, tipografia, botões, espaçamento, elemento gráfico) definidos ali devem ser replicados aqui — o objetivo é que login e dashboard pareçam parte do mesmo produto, não telas desenhadas separadamente.

## Tokens de referência (definidos no login)

| Token | Valor |
|---|---|
| Fundo | Navy escuro (`#0f1420`) |
| Cor de destaque única | Laranja da marca (`#F7931E`) |
| Botão primário | Fundo laranja sólido, texto **escuro** (não branco), `border-radius` grande, altura ~48px |
| Botão/ação secundária | Texto simples, sem fundo, cor cinza-azulada suave (`#8a94a6`) — nunca botão cheio |
| Texto primário | Branco/quase branco, peso médio |
| Texto secundário | Cinza-azulado claro (`#8a94a6`) |
| Elemento gráfico de fundo | Círculo grande, bem transparente (~6% opacidade), cor laranja, posicionado em um canto — assinatura visual sutil do produto |
| Rodapé | "inkers.com.br", cinza escuro discreto, centralizado |

## Diagnóstico da versão atual do dashboard

- O cabeçalho "Minha Aplicação" é uma barra branca isolada — quebra o token de fundo navy definido no login.
- Nome ("Bruno tattoo") e "@bruno" estão com contraste muito baixo, como se fossem texto secundário — mas são a informação primária da tela, deveriam seguir o token de texto primário.
- O botão "Ver página pública" está com fundo preto, sem seguir o token de botão primário (laranja sólido) nem o de botão secundário (texto simples) — é um terceiro estilo não previsto no design system.
- Dentro dos cards "Apresentação" e "Contato", rótulo e valor têm o mesmo peso visual — não há distinção entre texto primário e secundário como no login.
- O botão "+ Adicionar Foto" tem fundo claro com borda tracejada — destoa completamente da paleta escura e não corresponde a nenhum dos dois tokens de botão.
- Nenhuma tela do dashboard usa o elemento gráfico de fundo (círculo translúcido) — a assinatura visual do login não se repete aqui.

## Instruções de melhoria, aplicando os tokens do login

### 1. Cabeçalho
- Remover a barra branca. Usar o fundo navy do token de fundo.
- Título do cabeçalho em texto primário (branco/quase branco), sem caixa de contraste alto — mesmo tratamento do texto "Inkers" no login.

### 2. Identidade do artista
- Nome ("Bruno tattoo"): aplicar token de **texto primário** — branco, peso médio, mesmo padrão do título "Inkers" no login.
- "@bruno": aplicar token de **texto secundário** (`#8a94a6`) — mesmo padrão do subtítulo do login, mas claramente mais visível do que está hoje.
- Botão "Ver página pública": deve seguir o **token de botão primário** do login (fundo laranja sólido, texto escuro, `border-radius` grande, ~48px de altura) — é a ação de maior intenção nessa tela, equivalente ao "Entrar com Google" no login.

### 3. Cards de conteúdo (Apresentação, Contato)
- Rótulo (Título, Subtítulo, Bio, Telefone, Email, Cidade): token de **texto secundário**, tamanho menor, sem negrito — mesmo tratamento do subtítulo do login.
- Valor: token de **texto primário**, peso normal/médio — nunca os dois em negrito.
- Título da seção ("Apresentação", "Contato"): manter em laranja — consistente com o uso de laranja como cor de destaque único definido no login (lá, o laranja aparece só no botão primário e no ícone; aqui, mantém o mesmo princípio de "um único acento de cor por tela").
- Espaçamento vertical de 12–16px entre pares label/valor.

### 4. Grade de portfólio
- Padronizar proporção das miniaturas (ex: todas quadradas, `object-fit: cover`).
- Botão "+ Adicionar Foto": reconstruir seguindo o **token de botão secundário** (sem fundo cheio) ou uma variação discreta dele — fundo navy/transparente, borda sutil em tom claro, ícone "+" central. Nunca fundo claro/branco, que quebra a paleta escura do produto.

### 5. Elemento gráfico de assinatura
- Replicar o círculo translúcido laranja (~6% opacidade) em pelo menos um canto do dashboard — mesmo elemento usado no login — para reforçar que as duas telas pertencem ao mesmo produto.

### 6. Rodapé (opcional, se fizer sentido no dashboard)
- Caso a tela termine em uma área de respiro (fim de scroll), repetir o rodapé "inkers.com.br" no mesmo estilo do login, como assinatura consistente do produto.

## Resumo da hierarquia sugerida

1. Cabeçalho discreto, fundo navy, texto primário.
2. Identidade do artista: nome em texto primário + @usuário em texto secundário + botão primário "Ver página pública" (mesmo token do botão do login).
3. Cards de conteúdo com hierarquia label (secundário) / valor (primário) clara.
4. Grade de portfólio com proporções padronizadas e botão "+ Adicionar Foto" no token de botão secundário.
5. Elemento gráfico de fundo (círculo translúcido) repetido como assinatura visual do produto.

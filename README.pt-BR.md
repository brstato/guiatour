# Pages - Documentação do Projeto

[🇺🇸 English Version](./README.md)

## 🚀 Visão Geral

O **Pages** é um ecossistema de gestão para profissionais (como tatuadores e estúdios), permitindo a gestão de portfólio, agendamentos, anamneses e configurações de conta. Foi construído com foco em performance, escalabilidade e uma experiência de usuário fluida.

Este documento detalha o funcionamento interno do projeto, sua arquitetura e padrões de desenvolvimento.

---

## 🏗️ Arquitetura e Fluxo de Dados

O projeto utiliza uma arquitetura **Feature-Based** (Baseada em Funcionalidades), onde cada módulo do sistema é independente e encapsula sua própria lógica, serviços e componentes.

### O Fluxo de uma Chamada (Data Flow)

O ciclo de vida de uma interação de dados segue estas etapas:

1.  **Componente (View):** O usuário interage com um componente React (ex: clica em "Salvar").
2.  **Controller (Hook Customizado):** O componente chama uma função exposta por um Controller (ex: `handleUpdate` do `usePortfolioController`). O Controller gerencia o estado local e pode realizar uma **Atualização Otimista (Optimistic Update)**, atualizando a UI antes mesmo da resposta do servidor para maior percepção de velocidade.
3.  **Service (Data Layer):** O Controller invoca um método de um Service (ex: `portfolioService.updatePortfolio`).
4.  **API Client (Axios):** O Service utiliza a instância global do `api.ts` para realizar a requisição HTTP.
    *   **Interceptores:** Antes da requisição sair, um interceptor injeta o token de autenticação. Se a resposta retornar um erro de token expirado (401), o interceptor de resposta tenta renovar o token automaticamente (Refresh Token) e repete a requisição original sem que o usuário perceba.
5.  **Retorno:** O dado viaja de volta pelo Service, é processado pelo Controller (que atualiza o estado final da aplicação) e reflete na View.

---

## 🧩 Funcionamento dos Componentes

Adotamos o padrão **Controller-View** através de Hooks Customizados:

*   **Views (Pasta `pages/` e `components/`):** São componentes React "magros". Eles não sabem *como* os dados são buscados ou salvos; eles apenas sabem *como* exibi-los e quais funções chamar em resposta a eventos.
*   **Controllers (Pasta `hooks/`):** São o cérebro da funcionalidade. Eles usam `useState`, `useEffect` e chamam os `Services`. Eles expõem para a View apenas o necessário: dados (`data`), estados de carregamento (`isLoading`) e manipuladores de eventos (`handle...`).

---

## 🏛️ Orientação a Objetos (OO)

Embora o React seja focado em programação funcional, utilizamos princípios de **Orientação a Objetos** na camada de Serviços para garantir organização e reuso:

*   **Classes de Serviço:** Cada funcionalidade (Auth, Portfolio, Account) possui uma classe dedicada (ex: `PortfolioService`).
*   **Singleton Pattern:** Exportamos uma única instância da classe de serviço (`export const portfolioService = new PortfolioService()`). Isso garante que o estado de configuração da API seja consistente e centralizado.
*   **Encapsulamento:** A lógica de "limpeza" de dados, formatação de payloads e endpoints específicos fica escondida dentro dos métodos da classe, expondo uma interface limpa para os Controllers.

Exemplo:
```typescript
class PortfolioService {
  private cleanUrl(url: string) { ... } // Lógica privada
  async updatePortfolio(data) { ... }    // Interface pública
}
```

---

## 📂 Estrutura de Pastas

```text
src/
├── services/           # Instância global da API e Interceptores (O coração da comunicação)
├── lib/                # Utilitários compartilhados (Ex: compressão de imagens)
├── layouts/            # Estruturas de página (AppLayout, AuthLayout)
├── features/           # Módulos de negócio
│   └── [feature]/
│       ├── services/   # Classes OO para chamadas de API
│       ├── hooks/      # Controllers (Lógica de estado e eventos)
│       ├── pages/      # Views principais
│       └── components/ # Componentes específicos desta feature
```

---

## 🛠️ Tecnologias Principais

- **React 19 & TypeScript:** Base do projeto.
- **Tailwind CSS v4:** Estilização moderna e rápida.
- **Axios:** Gerenciamento de requisições com interceptores complexos para Refresh Token.
- **Shadcn UI:** Biblioteca de componentes de interface.
- **Google OAuth:** Autenticação simplificada.

---

## 🚦 Como Rodar

1. `npm install` para instalar dependências.
2. Configure o `.env` baseado no `.env.example`.
3. `npm run dev` para iniciar o ambiente de desenvolvimento.

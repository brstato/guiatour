# GuiaTour - Documentação do Projeto

> **Nota de Origem / Fork:**  
> Este projeto é um fork de **`pages.inkers`**, com o nome atual de **GuiaTour** (`pages.guiatour`). Trata-se da plataforma de gestão de páginas, presença digital, portfólio dinâmico e métricas de desempenho.

Ecosistema de gestão para profissionais e estúdios, permitindo gerenciamento dinâmico de portfólio, métricas de visibilidade (Google Search e Google Maps), agendamentos, anamnese e configurações avançadas de perfil e marketing.

---

## 🚀 Sumário

- [Visão Geral e Arquitetura](#-visão-geral-e-arquitetura)
- [Padrões de Projeto](#-padrões-de-projeto)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Documentação Detalhada dos Arquivos e Funções](#-documentação-detalhada-dos-arquivos-e-funções)
  - [Arquivos Raiz e Configuração](#1-arquivos-raiz-e-configuração)
  - [Inicialização e Roteamento (`src/`)](#2-inicialização-e-roteamento-src)
  - [Serviços e Clientes Globais (`src/services/` e `src/types/`)](#3-serviços-e-clientes-globais-srcservices-e-srctypes)
  - [Utilitários (`src/lib/`)](#4-utilitários-srclib)
  - [Layouts (`src/layouts/`)](#5-layouts-srclayouts)
  - [Componentes de Interface (`src/components/`)](#6-componentes-de-interface-srccomponents)
  - [Módulo de Autenticação (`src/features/auth/`)](#7-módulo-de-autenticação-srcfeaturesauth)
  - [Módulo de Conta e Configurações (`src/features/settings/`)](#8-módulo-de-conta-e-configurações-srcfeaturessettings)
  - [Módulo de Portfólio e Métricas (`src/features/portfolio/`)](#9-módulo-de-portfólio-e-métricas-srcfeaturesportfolio)
  - [Módulos Futuros (`anamnesis`, `artists`, `scheduling`)](#10-módulos-futuros-em-preparação)
- [Como Executar o Projeto](#-como-executar-o-projeto)

---

## 🏗️ Visão Geral e Arquitetura

O projeto **GuiaTour** foi desenvolvido em **React 19**, **TypeScript** e **Tailwind CSS v4**, empregando uma arquitetura **Feature-Based** (baseada em módulos de domínio funcionais). Cada funcionalidade possui seu próprio subdiretório contendo páginas, componentes, hooks (controllers) e serviços de dados.

### Ciclo de Interação de Dados

1. **View (Componente):** O usuário interage com formulários, acionando eventos ou alterando campos (ex: edição de bio ou upload de foto).
2. **Controller (Custom Hook):** O componente invoca ações do controller (ex: `handleUpdateBasico` de `usePortfolioController`). O controller executa atualizações otimistas (**Optimistic Updates**), refletindo a mudança instantaneamente na UI.
3. **Service (Camada de Dados):** O controller aciona os métodos da classe Singleton do serviço (ex: `portfolioService.updatePortfolioBasico`).
4. **API Client (Axios):** O serviço utiliza a instância centralizada do Axios (`api.ts`), com injeção automática do Bearer Token e interceptor com fila de requisições para renovação transparente de token via Refresh Token (`token/refresh`).
5. **Persistência e Revalidação:** O retorno confirma o dado no backend, atualizando ou revertendo o estado em caso de falha.

---

## 🧩 Padrões de Projeto

- **Controller-View Pattern:** Separação rígida entre visualização e regra de negócio. As Views em `pages/` e `components/` não conhecem detalhes de requisições HTTP ou endpoints; apenas consomem dados e disparam métodos fornecidos pelos controllers em `hooks/`.
- **OOP Singleton Services:** Acesso unificado a cada domínio através de classes instanciadas como singletons (`authService`, `accountService`, `portfolioService`), garantindo padronização, encapsulamento e reaproveitamento de código.
- **Optimistic UI Updates:** Alterações em textos, uploads e exclusões atualizam a interface local antes do retorno do servidor, proporcionando resposta imediata.
- **Token Interceptor com Fila (Request Queueing):** Gerenciamento resiliente de expiração de token (HTTP 401/403) mantendo requisições simultâneas em espera até que um novo token seja gerado.

---

## 📂 Estrutura de Pastas

```text
/
├── index.html                    # Ponto de entrada HTML do Vite
├── vite.config.ts                # Configuração do Vite e plugins (React, Tailwind)
├── package.json                  # Dependências e scripts do ecossistema
├── tsconfig.json                 # Configurações TypeScript base
├── src/
│   ├── main.tsx                  # Ponto de entrada da aplicação React
│   ├── App.tsx                   # Provedores globais (React Query, Google OAuth)
│   ├── index.css                 # Importações globais e diretivas do Tailwind CSS v4
│   ├── App.css                   # Estilos globais complementares
│   ├── routes/
│   │   └── index.tsx             # Definição de rotas do React Router
│   ├── services/
│   │   ├── api.ts                # Instância Axios, URLs por ambiente e interceptores
│   │   └── queryClient.ts        # Instância configurada do TanStack React Query
│   ├── types/
│   │   └── api.ts                # Interfaces e DTOs de comunicação com o backend
│   ├── lib/
│   │   ├── image-utils.ts        # Utilitário de compressão de imagens via Canvas
│   │   └── utils.ts              # Função utilitária cn (clsx + tailwind-merge)
│   ├── layouts/
│   │   ├── AppLayout.tsx         # Layout base com header e controles de sessão
│   │   ├── PerfilLayout.tsx      # Layout com carregamento unificado e TabBar inferior
│   │   └── AuthLayout.tsx        # Layout reservado para fluxos de autenticação
│   ├── components/
│   │   ├── TabBar.tsx            # Barra de navegação inferior fixa ("Editar" / "Métricas")
│   │   └── ui/                   # Componentes primitivos de UI
│   │       ├── accordion.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       └── table.tsx
│   └── features/
│       ├── auth/                 # Módulo de Autenticação
│       │   ├── types.ts          # Tipagens de login, refresh e payloads do Google
│       │   ├── services/         # authService (Singleton)
│       │   ├── hooks/            # useAuthController
│       │   └── pages/            # LoginPage
│       ├── settings/             # Módulo de Configurações de Conta
│       │   ├── types.ts          # Definições específicas de conta
│       │   ├── services/         # accountService (Singleton)
│       │   └── hooks/            # useAccountController
│       ├── portfolio/            # Módulo de Portfólio e Métricas
│       │   ├── types.ts          # Definições específicas do portfólio
│       │   ├── services/         # portfolioService (Singleton)
│       │   ├── hooks/            # usePortfolioController, useMetricas, usePortfolioTour
│       │   ├── components/       # PortfolioSpotlightTour
│       │   └── pages/            # PortfolioPage, MetricasPage
│       ├── anamnesis/            # Módulo de Anamnese (estrutura inicial)
│       │   └── types.ts
│       ├── artists/              # Módulo de Artistas (estrutura inicial)
│       │   └── types.ts
│       └── scheduling/           # Módulo de Agendamentos (estrutura inicial)
│           └── types.ts
```

---

## 📖 Documentação Detalhada dos Arquivos e Funções

### 1. Arquivos Raiz e Configuração

#### `vite.config.ts`
Arquivo de configuração do Vite para compilação e desenvolvimento.
- **Exportação Padrão (`defineConfig`):** Configura os plugins `@vitejs/plugin-react` e `@tailwindcss/vite`, além do alias `@` apontando para o diretório `./src`.

#### `index.html`
Documento HTML raiz carregado pelo navegador.
- Contém a tag `<div id="root"></div>` onde o aplicativo React é montado e a importação do script de entrada `/src/main.tsx`.

#### `package.json`
Manifesto de dependências, metadados e scripts executáveis:
- `dev`: Inicia o servidor local via Vite.
- `build`: Executa a checagem de tipos com `tsc -b` e gera o bundle de produção com `vite build`.
- `lint`: Executa o linter ultrarrápido `oxlint`.
- `preview`: Executa servidor local para inspecionar a build gerada.

---

### 2. Inicialização e Roteamento (`src/`)

#### `src/main.tsx`
Ponto de montagem da árvore React no DOM.
- **Funções / Execuções:**
  - `createRoot(document.getElementById('root')!).render(...)`: Inicializa a aplicação React dentro de `StrictMode` renderizando o componente `App`.

#### `src/App.tsx`
Componente raiz que encapsula provedores de contexto globais.
- **Componente `App()`:**
  - Carrega a credencial do Google Client ID via variável de ambiente `VITE_GOOGLE_CLIENT_ID`.
  - Envolve a aplicação em `QueryClientProvider` (TanStack React Query) e `GoogleOAuthProvider`.
  - Renderiza o componente `AppRoutes`.

#### `src/routes/index.tsx`
Centraliza a árvore de rotas da aplicação usando o `createBrowserRouter` do `react-router-dom`.
- **Variáveis e Configurações:**
  - `router`: Mapeamento de rotas com proteção e layouts aninhados:
    - `/`: Rota pública renderizando `LoginPage`.
    - `/tatuador/:id`: Rota aninhada em `AppLayout` e `PerfilLayout`:
      - `index`: Redireciona para `editar`.
      - `editar`: Renderiza `PortfolioPage`.
      - `metricas`: Renderiza `MetricasPage`.
    - `/portfolio`: Redireciona para `/tatuador/me/editar`.
    - `/dashboard` e `*`: Redirecionamentos para `/portfolio`.
- **Componentes Exportados:**
  - `AppRoutes()`: Retorna o provedor `RouterProvider` alimentado com a instância `router`.

---

### 3. Serviços e Clientes Globais (`src/services/` e `src/types/`)

#### `src/services/api.ts`
Configuração centralizada do cliente HTTP Axios, regras de URL base por ambiente e interceptores de autenticação com tratamento de renovação de sessão.
- **Constantes:**
  - `baseURL`: Determina a URL base priorizando `VITE_API_URL` (definida nos arquivos `.env`, como `https://api.guiatour.online/api/v1/`) ou alternando entre produção e desenvolvimento.
  - `api`: Instância do Axios com timeout de 60 segundos e cabeçalho padrão `application/json`.
- **Funções e Interceptores:**
  - `api.interceptors.request.use(...)`: Injeta o cabeçalho `Authorization: Bearer <token>` a partir do valor armazenado no `localStorage`.
  - `processQueue(error: any, token: string | null)`: Resolve ou rejeita requisições enfileiradas que aguardavam a renovação do token.
  - `api.interceptors.response.use(...)`: Intercepta falhas 401 e 403, inicia o fluxo de refresh token (`token/refresh`), retenta requisições enfileiradas ou redireciona para logout caso os tokens sejam inválidos.

#### `src/services/queryClient.ts`
Instância de cache e gerenciamento de estado assíncrono do TanStack React Query.
- **Constante `queryClient`:** Instância de `QueryClient` configurada com `staleTime` de 5 minutos, 1 tentativa de retry e `refetchOnWindowFocus: false`.

#### `src/types/api.ts`
Declaração de interfaces e contratos de dados trocados com o backend:
- `LoginResult`: Estrutura de retorno de autenticação (tokens, userId, erros).
- `RefreshResult`: Estrutura de retorno da rota de renovação de token.
- `RecoveryResult`: Estrutura de resposta para recuperação de senha.
- `GoogleLoginPayload`: Payload enviado ao backend com credenciais do Google OAuth.
- `AddressData`: Dados de endereço e coordenadas geográficas retornados na consulta de CEP.
- `AccountData`: Estrutura completa de dados cadastrais, contato, endereço, horários de funcionamento e IDs de ferramentas de marketing.
- `PosTattooItem`: Modelo de instrução de cuidado pós-tatuagem.
- `CuidadoItem`: Modelo de item de cuidado vinculado ao site.
- `PortfolioData`: Dados completos do portfólio (título, bio, URLs de imagens, lista de fotos e cuidados).

---

### 4. Utilitários (`src/lib/`)

#### `src/lib/image-utils.ts`
Utilitário para manipulação, conversão (incluindo suporte nativo a HEIC no iOS) e compressão de imagens via Canvas no lado do cliente.
- **Funções:**
  - `compressImage(base64: string, maxWidth = 1920, maxHeight = 1080, quality = 0.7): Promise<string>`:
    - Carrega uma imagem base64 em um elemento `Image`.
    - Calcula o redimensionamento proporcional respeitando largura e altura máximas.
    - Desenha a imagem redimensionada em um elemento `<canvas>`.
    - Exporta e resolve uma Promise com o resultado comprimido em formato JPEG base64 (`image/jpeg`).

#### `src/lib/utils.ts`
Utilitário para unificação e resolução de classes CSS.
- **Funções:**
  - `cn(...inputs: ClassValue[])`: Mescla classes condicionais do `clsx` com a resolução de conflitos de especificidade do `tailwind-merge`.

---

### 5. Layouts (`src/layouts/`)

#### `src/layouts/AppLayout.tsx`
Layout mestre para as áreas autenticadas do sistema.
- **Componente `AppLayout()`:**
  - Recupera métodos de autenticação de `useAuthController` (`handleLogout`) e conta de `useAccountController` (`data: account`, `loadData: loadAccount`).
  - Carrega os dados da conta do usuário logado via `useEffect`.
  - Renderiza o cabeçalho superior com a identidade da aplicação GuiaTour, link externo para visualização da página pública do perfil e botão de encerramento de sessão.
  - Provê o elemento `<Outlet />` para renderização das rotas filhas.

#### `src/layouts/PerfilLayout.tsx`
Layout intermediário responsável por orquestrar a carga de dados do perfil e exibir a barra de abas inferior fixa.
- **Componente `PerfilLayout()`:**
  - Identifica o parâmetro de rota `id` (ou resolve `me` para o ID salvo no `localStorage`).
  - Dispara o carregamento simultâneo do portfólio (`loadPortfolio`) e da conta (`loadAccount`).
  - Exibe indicador de carregamento animado (spinner) enquanto os dados estão sendo buscados.
  - Renderiza a área com scroll interno para a rota ativa (`<Outlet />`) e fixa o componente `TabBar` na base.

#### `src/layouts/AuthLayout.tsx`
Layout base estrutural reservado para páginas do fluxo de autenticação e onboarding.

---

### 6. Componentes de Interface (`src/components/`)

#### `src/components/TabBar.tsx`
Barra de navegação inferior (Bottom Navigation Bar) fixa para alternar entre as abas do perfil.
- **Componente `TabBar()`:**
  - Mapeia as rotas `editar` (ícone `Pencil`) e `metricas` (ícone `BarChart3`).
  - Utiliza `NavLink` do `react-router-dom` para aplicar destaque visual na aba ativa (linha indicadora superior e cor de destaque).

#### Primitivos de UI (`src/components/ui/`)
Componentes visuais acessíveis construídos com base no Radix UI, Base UI e Tailwind CSS:
- `accordion.tsx`:
  - `Accordion`: Raiz do agrupador expansível.
  - `AccordionItem`: Item individual de acordeão.
  - `AccordionTrigger`: Cabeçalho clicável do item com ícone de chevron giratório.
  - `AccordionContent`: Contêiner retrátil animado de conteúdo.
- `button.tsx`:
  - `buttonVariants`: Variantes e tamanhos de botão configurados com `class-variance-authority` (cva).
  - `Button`: Botão customizado compatível com Base UI e variantes (`default`, `outline`, `ghost`, etc.).
- `card.tsx`:
  - `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`: Subcomponentes modulares para criação de cartões de conteúdo.
- `dialog.tsx`:
  - `Dialog`, `DialogTrigger`, `DialogPortal`, `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose`: Componentes modais de diálogo com controle de foco e backdrop.
- `input.tsx`:
  - `Input`: Campo de entrada estilizado com suporte a estados de foco e invalidação.
- `label.tsx`:
  - `Label`: Rótulo estilizado associável a controles de formulário.
- `table.tsx`:
  - `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`: Componentes para estruturação semântica e responsiva de tabelas de dados.

---

### 7. Módulo de Autenticação (`src/features/auth/`)

#### `src/features/auth/types.ts`
Exporta as interfaces de contrato de dados do módulo de autenticação: `LoginResult`, `RefreshResult`, `RecoveryResult` e `GoogleLoginPayload`.

#### `src/features/auth/services/authService.ts`
Classe singleton que implementa a comunicação direta com a API de autenticação.
- **Classe `AuthService`:**
  - `loginGoogle(payload: GoogleLoginPayload): Promise<LoginResult>`: Envia credenciais do Google para o endpoint `login_google`.
  - `login(email: string, senha: string): Promise<LoginResult>`: Realiza autenticação via credenciais tradicionais em `login`.
  - `refreshToken(rToken: string, userId: string): Promise<RefreshResult>`: Solicita novos tokens de acesso ao endpoint `token/refresh`.
  - `recoveryPassword(email: string): Promise<RecoveryResult>`: Dispara requisição de redefinição de senha para `recovery`.
  - `parseLoginResponse(response: any): LoginResult`: Método privado que formata e traduz os códigos HTTP de resposta (401, 404, 422) em mensagens amigáveis.
- **Exportação:** `authService` (instância única).

#### `src/features/auth/hooks/useAuthController.ts`
Controller responsável por orquestrar fluxos de login, recuperação de senha, auto-login e expiração de sessão.
- **Função Hook `useAuthController()`:**
  - **Estados:** `isLoading`, `error`, `message`.
  - **Funções Expostas:**
    - `clearError()`: Redefine o estado de erro para nulo.
    - `clearMessage()`: Limpa mensagens informativas da UI.
    - `handleLogin(email: string, senha: string)`: Valida os campos, executa `authService.login`, salva os tokens no `localStorage` e redireciona para `/dashboard`.
    - `handleForgotPassword(email: string)`: Valida e dispara o fluxo de recuperação de senha.
    - `handleLoginGoogle`: Hook configurado via `useGoogleLogin` do Google OAuth. Obtém o perfil em `https://www.googleapis.com/oauth2/v3/userinfo`, valida junto ao backend e persiste a sessão.
    - `handleLogout()`: Limpa todos os tokens salvos (`clearPersistentTokens`) e redireciona para a raiz `/`.
  - **Efeitos:** `useEffect` executa tentativa de auto-login na inicialização utilizando o refresh token persistido.

#### `src/features/auth/pages/LoginPage.tsx`
Página de entrada e autenticação de usuários.
- **Componente `LoginPage()`:**
  - Renderiza o logotipo e título da plataforma GuiaTour.
  - Oferece botão de login facilitado via Google OAuth (`handleLoginGoogle`).
  - Disponibiliza link direto para suporte via WhatsApp.
  - Contém formulário para login com e-mail e senha.
  - Exibe modais de diálogo (`Dialog`) para erros e notificações retornados pelo controller.

---

### 8. Módulo de Conta e Configurações (`src/features/settings/`)

#### `src/features/settings/types.ts`
Arquivo reservado para tipagens e contratos específicos do módulo de configurações.

#### `src/features/settings/services/accountService.ts`
Classe singleton que centraliza as chamadas de configuração de perfil, contato, endereço e integrações.
- **Classe `AccountService`:**
  - `getAccountData(id: string): Promise<AccountData>`: Busca os dados cadastrais da conta em `account/get_data`.
  - `updateAccount(data: Partial<AccountData>): Promise<any>`: Atualização genérica de dados em `account/update`.
  - `updateAccountBasico(data: { nome?: string; apelido?: string }): Promise<any>`: Atualiza nome e slug do perfil em `account/update_account_basico`.
  - `updateAccountContato(data: { telefone?: string; email?: string; instagram?: string }): Promise<any>`: Atualiza contatos em `account/contato`.
  - `updateEndereco(data: Partial<AccountData>): Promise<any>`: Atualiza informações de endereço em `account/update_endereco`.
  - `updateConfiguracoesAvancadas(data: { g_analytcs?: string; meta_pixel_id?: string; conta_google_ads?: string; horario?: any }): Promise<any>`: Salva configurações de tags analíticas e horários em `account/update_configuracoes_avancadas`.
  - `registerAccount(data: any): Promise<any>`: Cria nova conta em `account/register`.
  - `fetchEndereco(cep: string): Promise<AddressData>`: Consulta endereço por CEP no endpoint `portfolio/account/:cep`.
  - `checkSlug(slug: string): Promise<{ slug: boolean; id_loja: string }>`: Verifica disponibilidade de um slug em `account/get_slug`.
- **Exportação:** `accountService` (instância única).

#### `src/features/settings/hooks/useAccountController.ts`
Controller responsável pela lógica de dados de perfil do usuário.
- **Função Hook `useAccountController()`:**
  - **Estados:** `isLoading`, `data` (`AccountData | null`), `error`.
  - **Funções Expostas:**
    - `loadData(id: string)`: Busca e popula os dados da conta.
    - `handleUpdate(updateData: Partial<AccountData>)`: Atualização com fallback para recarga em caso de falha.
    - `handleUpdateBasico(updateData: { nome?: string; apelido?: string })`: Atualização otimista de nome e apelido (slug).
    - `handleUpdateContato(updateData: { telefone?: string; email?: string; instagram?: string })`: Atualização otimista de telefone, e-mail e Instagram.
    - `handleUpdateEndereco(updateData: Partial<AccountData>)`: Atualização otimista de endereço.
    - `handleUpdateConfiguracoesAvancadas(updateData: { g_analytcs?: string; meta_pixel_id?: string; conta_google_ads?: string; horario?: any })`: Atualização otimista de tags e horários.
    - `fetchAddress(cep: string): Promise<AddressData | null>`: Realiza a consulta de CEP e formata retorno.
    - `validateSlug(slug: string, currentId: string): Promise<boolean>`: Valida se o slug escolhido está livre para uso.

---

### 9. Módulo de Portfólio e Métricas (`src/features/portfolio/`)

#### `src/features/portfolio/types.ts`
Arquivo reservado para tipagens e contratos específicos do módulo de portfólio.

#### `src/features/portfolio/services/portfolioService.ts`
Classe singleton que interage com a API para manipulação do portfólio, galeria de imagens e orientações de cuidados.
- **Classe `PortfolioService`:**
  - `cleanUrl(url: string): string`: Método privado que normaliza caminhos de imagem, removendo o domínio e barras duplicadas.
  - `getPortfolioData(idLoja: string): Promise<PortfolioData>`: Recupera dados do portfólio em `portfolio/info/:idLoja`.
  - `updatePortfolio(payload: Partial<PortfolioData>): Promise<any>`: Atualização geral no endpoint `portfolio/update`.
  - `updatePortfolioBasico(data: { titulo?: string; subtitulo?: string; bio?: string }): Promise<any>`: Atualiza título, subtítulo e biografia em `portfolio/update_portifolio_basico`.
  - `getGaleria(idPortfolio: number): Promise<any>`: Obtém lista de fotos em `portfolio/galeria/:idPortfolio`.
  - `uploadFoto(payload: { nome_arquivo: string; imagem_base64: string; id_site: number }): Promise<any>`: Faz upload de imagem para a galeria em `portfolio/upload`.
  - `uploadAvatar(payload: { nome_arquivo: string; imagem_base64: string; id_site: number }): Promise<any>`: Upload da foto de perfil em `portfolio/avatar`.
  - `uploadBioFoto(payload: { nome_arquivo: string; imagem_base64: string; id_site: number }): Promise<any>`: Upload da foto da bio em `portfolio/foto-bio`.
  - `uploadFotoCapa(payload: { nome_arquivo: string; imagem_base64: string; id_site: number }): Promise<any>`: Upload da imagem de capa em `portfolio/foto-capa`.
  - `removeFoto(idFoto: number): Promise<any>`: Remove imagem da galeria via `portfolio/remove`.
  - `updatePosTattoo(payload: { id_item: number; id_site: number; descricao: string }): Promise<any>`: Cria ou atualiza instrução pós-tatuagem em `portfolio/update_pos_tattoo`.
  - `removeCuidado(idCuidado: number): Promise<any>`: Exclui instrução de cuidado via `portfolio/remove-cuidado`.
- **Exportação:** `portfolioService` (instância única).

#### `src/features/portfolio/hooks/usePortfolioController.ts`
Controller central da tela de edição de portfólio.
- **Função Hook `usePortfolioController()`:**
  - **Estados:** `isLoading`, `data` (`PortfolioData | null`).
  - **Funções Expostas:**
    - `loadData(idLoja: string)`: Carrega o portfólio completo via `portfolioService.getPortfolioData`.
    - `handleUpdate(payload: Partial<PortfolioData>)`: Atualiza o portfólio de forma otimista.
    - `handleUpdateBasico(updateData: { titulo?: string; subtitulo?: string; bio?: string })`: Atualização otimista dos campos de texto da apresentação.
    - `handleUpload(type: 'avatar' | 'bio' | 'gallery' | 'capa', fileName: string, base64: string, idSite: number)`: Comprime a imagem em 1600x1600 (qualidade 0.7) via `compressImage`, atualiza o preview local imediatamente e envia os dados para a API em background.
    - `handleDeleteFoto(idFoto: number)`: Remove a imagem da lista local imediatamente e dispara a exclusão no backend.
    - `handleAddPosTattoo()`: Insere um novo item de cuidado em branco na lista da interface.
    - `handleUpdatePosTattoo(idItem: number, descricao: string)`: Atualiza a descrição de forma otimista e sincroniza com o banco de dados (associando o ID retornado caso seja um item novo).
    - `handleDeleteCuidado(idItem: number)`: Remove o item de cuidado localmente e chama o serviço de exclusão.

#### `src/features/portfolio/hooks/useMetricas.ts`
Hook customizado baseado em React Query para busca e cache de estatísticas e métricas de desempenho.
- **Interfaces:** `MetricasResponse` (visibilidade, ações e posicionamento de termos de busca).
- **Função Hook `useMetricas(tatuadorId: string | undefined)`:**
  - Configura consulta React Query (`queryKey: ["metricas", id]`) chamando o endpoint `/tatuadores/:id/metricas`.
  - Define `staleTime` de 30 minutos e execução condicional à existência do identificador.

#### `src/features/portfolio/hooks/usePortfolioTour.ts`
Gerenciador do estado e passos do tour guiado de preenchimento do portfólio.
- **Constantes:**
  - `PORTFOLIO_TOUR_STEPS`: Conjunto de 7 etapas (`identidade`, `apresentacao`, `contato`, `localizacao`, `trabalhos`, `pos-tattoo`, `config`), contendo título, badge, descrição, dicas e importância de cada seção.
- **Função Hook `usePortfolioTour(userId?: string | null, isLoading = false)`:**
  - **Estados:** `isOpen`, `currentStepIndex`.
  - **Funções Expostas:**
    - `openTour(startIndex?: number)`: Abre o guia em um passo especificado.
    - `openTourForSection(sectionId: string)`: Abre o guia posicionado diretamente na seção clicada.
    - `closeTour()`: Fecha o tour e grava a conclusão no `localStorage` sob chave vinculada ao usuário.
    - `nextStep()`: Avança para a próxima etapa ou finaliza o tour.
    - `prevStep()`: Retorna para a etapa anterior.
    - `goToStep(index: number)`: Pula diretamente para uma etapa selecionada.
  - **Efeito:** Abre o tour automaticamente no primeiro acesso após a conclusão do carregamento inicial.

#### `src/features/portfolio/components/PortfolioSpotlightTour.tsx`
Componente visual de destaque com máscara SVG tipo "Spotlight" (holofote) e popover flutuante posicionado dinamicamente.
- **Componente `PortfolioSpotlightTour(props)`:**
  - `measureTarget()`: Mede as coordenadas na tela (`getBoundingClientRect`) do elemento focado pela etapa do tour.
  - Gera recorte com cantos arredondados na máscara SVG sobre a seção ativa com borda pulsante em laranja (`#F7931E`).
  - Executa scroll suave (`scrollIntoView`) e abre automaticamente o acordeão correspondente caso a seção esteja fechada.
  - Calcula a posição vertical do balão de dicas para não sobrepor a `TabBar` inferior.

#### `src/features/portfolio/pages/PortfolioPage.tsx`
Visão principal de gerenciamento do portfólio do profissional.
- **Componentes Auxiliares e Utilitários Internos:**
  - `ScheduleItemEditor({ day, data, onUpdate })`: Editor individual de horários para cada dia da semana (toggle aberto/fechado e seletores de horário).
  - `SectionStatusIcon({ status })`: Ícone visual de status (ícone de check verde `#4ADE80` para preenchido ou círculo cinza para pendente).
  - `EditableField({ label, value, onSave, multiline, numericOnly, maxLength })`: Campo de edição com salvamento automático ao perder o foco (`onBlur`) e ajuste automático de altura para `textarea`.
  - `ProgressRing({ progress, size, strokeWidth })`: Medidor de progresso circular animado em SVG exibido em torno do avatar.
- **Componente `PortfolioPage()`:**
  - Integração entre `usePortfolioController`, `useAccountController` e `usePortfolioTour`.
  - Monitora o status de completude de cada seção (`statusIdentidade`, `statusApresentacao`, `statusContato`, `statusLocalizacao`, `statusTrabalhos`, `statusPosTattoo`) para cálculo do progresso geral (`progressPercent`).
  - Renderiza o card de identidade com avatar, foto de capa e apelido.
  - Renderiza acordeões sanfonados para:
    - **Apresentação:** Título, subtítulo, bio e foto da bio.
    - **Contato:** WhatsApp, e-mail e Instagram.
    - **Localização:** CEP com preenchimento automático de logradouro via consulta de endereço.
    - **Trabalhos:** Galeria de imagens com upload e confirmação de exclusão em modal.
    - **Cuidados pós tattoo:** Lista dinâmica de instruções de cicatrização.
    - **Configurações Avançadas:** Google Analytics, Meta Pixel, Google Ads e horários semanais de funcionamento.
  - Botão de acesso direto à página pública do profissional ativado apenas quando todas as seções obrigatórias estiverem completas.

#### `src/features/portfolio/pages/MetricasPage.tsx`
Painel com indicadores de desempenho e conversão do perfil público.
- **Componente `MetricasPage()`:**
  - Consome dados através de `useMetricas`.
  - Exibe cards informativos:
    - **Visibilidade Total:** Volume acumulado de visualizações em busca orgânica e Google Maps, com indicador de variação percentual.
    - **Ações Geradas / Conversões:** Cliques direcionados para o site, chamadas telefônicas e rotas solicitadas no mapa.
    - **Termos de Pesquisa:** Lista com as principais consultas que levaram usuários até o perfil e respectiva posição no ranking.

---

### 10. Módulos Futuros em Preparação

Arquivos de definição previstos para expansão dos serviços da plataforma:
- `src/features/anamnesis/types.ts`: Tipagens para fichas de anamnese e termos de consentimento pré-procedimento.
- `src/features/artists/types.ts`: Tipagens para gestão de múltiplos profissionais em estúdios compartilhados.
- `src/features/scheduling/types.ts`: Tipagens para agenda de horários, sessões e reservas online.

---

## 🚦 Como Executar o Projeto

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure as variáveis de ambiente no arquivo `.env.development` ou `.env`:
   ```env
   VITE_API_URL=https://api.guiatour.online/api/v1/
   VITE_GOOGLE_CLIENT_ID=seu_google_client_id_aqui
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Para checar tipos e compilar para produção:
   ```bash
   npm run build
   ```

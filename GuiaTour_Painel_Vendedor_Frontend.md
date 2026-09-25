# GuiaTour — Implementação do Painel de Vendedor

## Objetivo

Implementar no frontend do GuiaTour um **painel administrativo exclusivo para vendedores**, permitindo:

1. autenticar um vendedor;
2. visualizar os comerciantes vinculados a ele;
3. cadastrar novos comerciantes;
4. selecionar um comerciante para acessar o fluxo administrativo já existente;
5. preparar a arquitetura para, futuramente, cadastrar e administrar pontos turísticos.

A implementação deve ser **aditiva e isolada**. O código existente destinado ao comerciante deve continuar funcionando exatamente como está.

> **Regra principal:** não reescrever, reorganizar ou refatorar os arquivos existentes do fluxo do comerciante. Criar o novo domínio de vendedor ao redor da arquitetura atual.

---

## 1. Contexto técnico atual

O frontend utiliza:

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- React Router
- Axios
- TanStack React Query
- arquitetura Feature-Based
- padrão `View → Controller/Hook → Service → API`
- Services como Singleton
- componentes reutilizáveis em `src/components/ui`
- `AppLayout`, `PerfilLayout` e `AuthLayout`
- interceptor central do Axios para Bearer Token e refresh token.

A estrutura existente deve ser respeitada.

Referências:

- Frontend: `https://github.com/brstato/guiatour`
- Backend: `https://github.com/brstato/Server-GuiaTour`

O backend está sendo preparado para trabalhar com dois tipos de usuário:

```text
vendedor
comerciante
```

O JWT deverá identificar o tipo de usuário, por exemplo:

```json
{
  "id": "...",
  "tipo": "vendedor"
}
```

ou:

```json
{
  "id": "...",
  "tipo": "comerciante"
}
```

O frontend deve usar essa informação para determinar qual experiência apresentar.

---

# 2. Regra de isolamento do código existente

## NÃO ALTERAR

Não modificar a lógica existente dos módulos que já atendem ao comerciante, especialmente:

```text
src/features/portfolio/
src/features/settings/
src/features/auth/
```

quando a alteração afetar o comportamento atual do comerciante.

Não reescrever:

- `PortfolioPage`
- `PerfilLayout`
- controllers existentes
- services existentes
- formulários existentes
- componentes existentes
- fluxo de edição do comerciante
- fluxo atual de métricas
- comportamento atual de login do comerciante

Se algum contrato compartilhado precisar ser ampliado para suportar `tipo`, fazer somente uma alteração **compatível com o comportamento atual**, sem alterar a semântica do fluxo de comerciante.

A prioridade é:

> **Adicionar vendedor sem quebrar comerciante.**

---

# 3. Nova arquitetura

Criar um novo módulo:

```text
src/features/vendor/
```

Estrutura sugerida:

```text
src/features/vendor/
├── types.ts
├── services/
│   └── vendorService.ts
├── hooks/
│   └── useVendorController.ts
├── pages/
│   ├── VendorDashboardPage.tsx
│   ├── VendorLoginPage.tsx        # somente se o fluxo exigir uma view própria
│   └── MerchantCreatePage.tsx
└── components/
    ├── MerchantCard.tsx
    ├── MerchantList.tsx
    ├── MerchantForm.tsx
    ├── VendorHeader.tsx
    ├── EmptyMerchantsState.tsx
    └── VendorSidebar.tsx          # somente se necessário
```

Os nomes podem ser adaptados aos padrões já existentes no projeto, mas a separação de responsabilidades deve ser preservada.

---

# 4. Flag de identificação do usuário

Criar uma tipagem central para representar o papel autenticado:

```ts
export type UserRole = 'vendedor' | 'comerciante';
```

A sessão deve disponibilizar essa informação de forma segura e previsível.

Exemplo conceitual:

```ts
interface AuthSession {
  userId: string;
  role: UserRole;
  accessToken: string;
  refreshToken?: string;
}
```

### Importante

A flag `role`/`tipo` serve para **controle de experiência e roteamento no frontend**, mas nunca deve ser considerada mecanismo de autorização.

O backend continuará sendo responsável por validar:

- se o token é válido;
- se o usuário é vendedor;
- quais comerciantes pertencem ao vendedor;
- quais recursos podem ser acessados.

Nunca confiar em:

```text
localStorage.role
URL /vendedor/:id
id do comerciante enviado pelo frontend
```

como autorização.

---

# 5. Fluxo esperado

## Vendedor

```text
Login
  ↓
JWT com tipo = vendedor
  ↓
VendorDashboardPage
  ↓
Lista de comerciantes
  ↓
Novo comerciante
  ↓
MerchantCreatePage
  ↓
Cadastro concluído
  ↓
Retorno para lista
```

Ao selecionar um comerciante:

```text
VendorDashboard
      ↓
Selecionar comerciante
      ↓
/tatuador/:id/editar
```

O frontend pode reutilizar a rota existente de edição do comerciante, **sem modificar a implementação da página existente**.

O backend deverá decidir se aquele vendedor pode acessar o `id`.

---

# 6. Dashboard do vendedor

A primeira tela deve ser simples e orientada à tarefa.

### Estrutura

```text
┌──────────────────────────────────────┐
│ GuiaTour        Vendedor       Sair  │
├──────────────────────────────────────┤
│                                      │
│ Olá, [nome]                          │
│ Gerencie os comerciantes cadastrados │
│                                      │
│ [+ Novo comerciante]                 │
│                                      │
│ Seus comerciantes                    │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Nome do comércio                │ │
│ │ Cidade • Categoria              │ │
│ │ Status                           │ │
│ │ [Editar] [Acessar página]       │ │
│ └──────────────────────────────────┘ │
│                                      │
└──────────────────────────────────────┘
```

Não criar um dashboard excessivamente complexo.

O objetivo inicial é:

> cadastrar → localizar → acessar → administrar.

---

# 7. Cadastro de comerciante

O formulário deve priorizar velocidade e clareza.

Campos iniciais:

- nome do comércio
- telefone
- e-mail
- categoria
- endereço
- número
- complemento
- bairro
- CEP
- cidade
- UF

Se o backend disponibilizar os campos em etapas posteriores, manter o formulário preparado para expansão.

## UX

Dividir visualmente o cadastro em blocos:

### Identificação

Nome do comércio, categoria e contato.

### Endereço

CEP, endereço, número, complemento, bairro, cidade e UF.

### Acesso

Não pedir ao vendedor para definir uma senha definitiva do comerciante se o backend estiver utilizando convite/token temporário.

Nesse caso, apresentar algo como:

> O comerciante receberá um convite para criar o próprio acesso.

Após o cadastro:

```text
✓ Comerciante cadastrado

O cadastro foi criado com sucesso.

[Copiar convite]
[Voltar para comerciantes]
[Acessar comerciante]
```

---

# 8. Identidade visual

O novo painel deve parecer parte do GuiaTour, não uma aplicação separada.

Reutilizar:

- tokens de espaçamento existentes;
- tipografia existente;
- componentes de `src/components/ui`;
- variantes de `Button`;
- `Card`;
- `Input`;
- `Label`;
- `Dialog`;
- ícones já utilizados no projeto;
- estados de foco;
- bordas;
- sombras;
- animações existentes.

Não criar uma segunda biblioteca visual.

## Direção visual

O resultado deve transmitir:

- simplicidade;
- confiança;
- organização;
- leveza;
- aparência profissional;
- boa hierarquia visual.

Evitar:

- excesso de cards;
- gradientes desnecessários;
- excesso de cores;
- tabelas densas;
- menus complexos;
- telas visualmente carregadas.

Priorizar:

- bastante espaço em branco;
- títulos claros;
- ações principais evidentes;
- feedback imediato;
- estados vazios bem desenhados;
- responsividade.

---

# 9. Responsividade

O vendedor poderá utilizar computador, tablet ou celular.

O layout deve ser:

```text
desktop → painel com navegação e conteúdo centralizado

tablet → layout adaptado

mobile → navegação simplificada e cards empilhados
```

O cadastro deve ser confortável no celular.

Não utilizar tabelas horizontais como elemento principal no mobile.

Para listas, preferir cards responsivos.

---

# 10. Controller

Criar:

```text
useVendorController
```

Responsabilidades:

- carregar comerciantes;
- controlar loading;
- controlar erros;
- cadastrar comerciante;
- atualizar estado após cadastro;
- selecionar comerciante;
- copiar convite;
- navegar para o perfil selecionado.

A View não deve chamar Axios diretamente.

Exemplo conceitual:

```ts
const {
  merchants,
  isLoading,
  error,
  createMerchant,
  selectMerchant,
  reload
} = useVendorController();
```

---

# 11. Service

Criar:

```text
vendorService.ts
```

Singleton seguindo o mesmo padrão dos Services existentes.

Exemplo de responsabilidade:

```ts
getMerchants()
getMerchant(id)
createMerchant(data)
updateMerchant(id, data)
generateInvite(id)
```

Os nomes exatos dos endpoints devem ser ajustados aos contratos reais do backend.

Não duplicar `api.ts`.

Utilizar a instância Axios existente.

---

# 12. Models / Types

Criar tipos específicos do domínio:

```ts
export interface Merchant {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  categoria?: string;
  cidade?: string;
  uf?: string;
  ativo?: boolean;
}
```

Criar DTOs separados quando houver diferença entre:

- dados retornados;
- dados enviados para criação;
- dados enviados para atualização.

Exemplo:

```ts
export interface CreateMerchantDTO {
  nome: string;
  telefone?: string;
  email?: string;
  idCategoria?: number;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  cidade?: string;
  uf?: string;
}
```

Não reutilizar `AccountData` indiscriminadamente para representar um comerciante gerenciado pelo vendedor.

---

# 13. Rotas

Adicionar rotas isoladas para vendedor.

Sugestão:

```text
/vendedor
/vendedor/comerciantes
/vendedor/comerciantes/novo
/vendedor/comerciantes/:id
```

O nome pode ser ajustado à convenção atual do projeto.

O ponto importante é separar claramente:

```text
/vendedor/*
```

de:

```text
/tatuador/*
```

O fluxo existente de comerciante permanece intacto.

---

# 14. Proteção de rotas

Criar uma proteção específica, por exemplo:

```text
VendorRoute
```

Comportamento:

```text
sem autenticação
    → login

autenticado como comerciante
    → não permitir acesso ao painel de vendedor

autenticado como vendedor
    → permitir acesso
```

Não esconder somente elementos visuais.

A proteção deve existir também no roteamento.

Ainda assim:

> autorização real = backend.

---

# 15. Sessão e token

O frontend deve reconhecer o `tipo` retornado pelo backend.

Não criar um segundo sistema independente de autenticação.

Reutilizar:

- access token;
- refresh token;
- interceptor Axios;
- logout;
- renovação de sessão.

Se o backend retornar:

```json
{
  "userId": "...",
  "tipo": "vendedor"
}
```

armazenar o papel juntamente com a sessão existente de maneira compatível.

Se for necessário alterar algum arquivo compartilhado de autenticação, fazer somente a menor alteração possível para expor:

```ts
role
```

sem alterar o comportamento atual do comerciante.

---

# 16. Segurança

O frontend deve seguir estas regras:

### Nunca confiar no papel armazenado no client

O `tipo` é usado para UX/roteamento.

### Nunca montar autorização no frontend

Não fazer:

```ts
if (merchant.ownerId === currentUser.id)
```

como única proteção.

### Não expor tokens em URLs

Nunca:

```text
/vendedor?token=...
```

### Não enviar senha de comerciante por URL

Se houver convite, utilizar o mecanismo definido pelo backend.

### Não armazenar informações sensíveis desnecessárias

Manter o armazenamento local mínimo.

### Tratar 401/403

Utilizar o interceptor existente.

Para `403`, apresentar mensagem adequada:

> Você não possui permissão para acessar este comerciante.

---

# 17. Performance

A lista de comerciantes deve nascer preparada para crescimento.

### Paginação

Não carregar todos os comerciantes de uma vez.

Preferir contrato:

```text
page
pageSize
total
items
```

ou equivalente.

### Cache

Usar TanStack React Query quando fizer sentido.

Exemplo conceitual:

```text
['vendor', 'merchants']
['vendor', 'merchant', merchantId]
```

Após criar comerciante:

```text
invalidateQueries(['vendor', 'merchants'])
```

### Evitar requisições duplicadas

Não buscar novamente os mesmos dados em componentes filhos.

### Formulários

Não enviar requisição a cada alteração de campo.

### Imagens

Se futuramente houver upload de logo/fotos, reutilizar `image-utils.ts` e o mecanismo existente de compressão.

---

# 18. Estados obrigatórios da interface

Todas as telas devem tratar:

### Loading

Mostrar skeleton/spinner coerente com o projeto.

### Lista vazia

Exemplo:

```text
Você ainda não possui comerciantes cadastrados.

Cadastre o primeiro comerciante para começar.

[+ Novo comerciante]
```

### Erro

Mostrar mensagem amigável e ação:

```text
Não foi possível carregar os comerciantes.

[Tentar novamente]
```

### Sucesso

Usar feedback visual consistente com o restante da aplicação.

### Salvamento

Desabilitar o botão enquanto a requisição estiver em andamento.

Evitar duplo envio.

---

# 19. Cadastro com excelente UX

O formulário deve:

- validar campos antes do envio;
- destacar claramente campos obrigatórios;
- preservar os dados digitados quando houver erro;
- mostrar erro próximo ao campo quando possível;
- evitar mensagens técnicas;
- informar o usuário durante o salvamento;
- impedir submissão duplicada;
- retornar à lista após sucesso.

Para campos de CEP, telefone e outros formatos, reutilizar utilitários existentes antes de criar novos.

---

# 20. Preparação para pontos turísticos

Não implementar o módulo de pontos turísticos nesta etapa.

Entretanto, a arquitetura deve permitir futuramente:

```text
src/features/vendor/
    merchants/
    tourist-spots/
```

ou uma estrutura equivalente.

O painel poderá posteriormente possuir:

```text
Comerciantes
Pontos turísticos
```

Portanto, evitar nomes e componentes excessivamente específicos que impeçam essa expansão.

---

# 21. O que NÃO fazer

Não:

- reescrever o frontend;
- migrar para outra biblioteca;
- trocar Tailwind;
- trocar React Router;
- trocar Axios;
- trocar React Query;
- criar outro cliente HTTP;
- criar outro sistema de autenticação;
- duplicar componentes UI existentes;
- modificar o fluxo do comerciante;
- alterar `PortfolioPage` para atender vendedor;
- colocar lógica de vendedor dentro dos controllers do comerciante;
- confiar no frontend para autorização;
- criar uma tela visualmente diferente do GuiaTour;
- implementar pontos turísticos agora;
- implementar funcionalidades não previstas apenas por "melhoria".

---

# 22. Critérios de aceitação

A implementação será considerada concluída quando:

- [ ] usuário com `tipo = vendedor` consegue acessar o painel;
- [ ] comerciante não consegue acessar as rotas de vendedor;
- [ ] vendedor consegue visualizar seus comerciantes;
- [ ] vendedor consegue cadastrar comerciante;
- [ ] validações funcionam;
- [ ] loading/error/sucesso estão tratados;
- [ ] vendedor consegue selecionar um comerciante;
- [ ] seleção leva ao fluxo existente de administração do comerciante;
- [ ] fluxo atual do comerciante continua funcionando;
- [ ] nenhuma regra de autorização depende apenas do frontend;
- [ ] lista suporta paginação;
- [ ] chamadas utilizam o `api` existente;
- [ ] services seguem o padrão Singleton;
- [ ] controllers seguem o padrão atual;
- [ ] UI reutiliza os componentes existentes;
- [ ] interface funciona em desktop e mobile;
- [ ] `npm run build` executa sem erros;
- [ ] lint não apresenta novos problemas;
- [ ] nenhum arquivo existente do domínio do comerciante foi reescrito ou refatorado desnecessariamente.

---

# 23. Ordem recomendada de implementação

Executar nesta ordem:

1. analisar novamente a estrutura atual de `auth`, `routes`, `layouts` e `services`;
2. identificar como o `tipo` será obtido da resposta/JWT;
3. criar os tipos de vendedor;
4. criar `vendorService`;
5. criar `useVendorController`;
6. criar proteção `VendorRoute`;
7. criar dashboard do vendedor;
8. criar lista de comerciantes;
9. criar formulário de cadastro;
10. integrar os endpoints do backend;
11. implementar seleção de comerciante;
12. conectar à rota existente `/tatuador/:id/editar`;
13. revisar responsividade;
14. revisar estados de erro/loading;
15. executar build;
16. executar lint;
17. verificar regressão do fluxo de comerciante.

---

## Princípio arquitetural final

A implementação deve seguir esta regra:

```text
                 GuiaTour
                    │
             identificação
              do usuário
                    │
          ┌─────────┴─────────┐
          │                   │
       VENDEDOR           COMERCIANTE
          │                   │
    features/vendor      código existente
          │                   │
    novos Views          não modificar
    Controllers
    Services
    Models
          │
          └──── seleciona ────┐
                              ↓
                    fluxo existente
                    do comerciante
```

O vendedor é um **novo domínio de administração**, e não uma adaptação do domínio existente do comerciante.

A implementação deve privilegiar **isolamento, reutilização, segurança, performance e consistência visual**, mantendo o código atual do comerciante estável.

# Gerenciador de Tarefas

Aplicação web de gerenciamento de tarefas desenvolvida em dupla para a disciplina **Desenvolvimento Front-End** (IFMA, Campus Timon, Sistemas para Internet).

Cada usuário cria sua conta, faz login e gerencia apenas as **suas próprias tarefas**. Visitantes veem uma página de demonstração, e a lista real só aparece para quem está autenticado.

## Tecnologias

- [Next.js](https://nextjs.org/) (App Router) com TypeScript
- [shadcn/ui](https://ui.shadcn.com/) e Tailwind CSS
- [Prisma ORM](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Clerk](https://clerk.com/) para autenticação

## Funcionalidades

- Cadastro, login e logout com Clerk
- Criar tarefas com título e descrição opcional
- Listar as tarefas do usuário, da mais recente para a mais antiga
- Marcar como concluída e reabrir
- Editar e excluir
- Validação no servidor e mensagens de sucesso ou erro
- Proteção de dados: todas as consultas e ações filtram pelo `userId` do usuário autenticado

---

## Pré-requisitos

| Ferramenta | Versão recomendada | Como verificar |
|---|---|---|
| Node.js | 20 ou superior | `node -v` |
| npm | 10 ou superior | `npm -v` |
| Git | qualquer recente | `git --version` |
| PostgreSQL ou Docker | PostgreSQL 14+ | `psql --version` ou `docker --version` |

Você também precisa de uma conta gratuita no [Clerk](https://clerk.com).

---

## Passo a passo

### 1. Clonar o repositório

```bash
git clone <URL-DO-REPOSITORIO>
cd <NOME-DA-PASTA>
```

### 2. Instalar as dependências

```bash
npm install
```

### 3. Subir o banco de dados PostgreSQL

Escolha **uma** das opções.

**Opção A: Docker (mais simples)**

```bash
docker run --name tarefas-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=tarefas \
  -p 5432:5432 \
  -d postgres:16
```

Nas próximas vezes, basta iniciar o container existente:

```bash
docker start "nome do banco"
```

**Opção B: PostgreSQL instalado no sistema (Linux)**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
sudo -u postgres psql -c "CREATE DATABASE tarefas;"
```

**Opção C: banco na nuvem**

Crie um banco gratuito em um serviço como o [Neon](https://neon.tech) e copie a *connection string* fornecida.

### 4. Configurar o Clerk

1. Acesse o [dashboard do Clerk](https://dashboard.clerk.com) e crie uma aplicação.
2. Em **API Keys**, copie a *Publishable key* e a *Secret key*.

> Se você usar uma aplicação Clerk própria, precisa criar uma conta nova pela tela de cadastro do app, porque os usuários ficam salvos no Clerk e não no banco local.

### 5. Criar o arquivo `.env`

Na raiz do projeto (ao lado do `package.json`), crie o arquivo `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tarefas?schema=public"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

- Se usar banco na nuvem, cole a connection string no `DATABASE_URL`.
- O `.env` **não vai para o GitHub** (está no `.gitignore`), então precisa ser criado em cada máquina.
- Se a senha do banco tiver caracteres especiais (`@`, `#`, `/`), codifique-os na URL (por exemplo, `@` vira `%40`).

### 6. Preparar o Prisma

```bash
npx prisma generate
npx prisma migrate dev
```

O primeiro comando gera o Prisma Client. O segundo aplica as migrations (pasta `prisma/migrations`) e cria as tabelas no banco.

### 7. Rodar o projeto

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Clique em **Criar conta**, cadastre-se e use o sistema.

---

## Como testar a privacidade dos dados

1. Crie uma conta e cadastre algumas tarefas.
2. Saia, crie uma segunda conta e confirme que a lista começa vazia.
3. Volte à primeira conta e confirme que suas tarefas continuam lá.

---

## Scripts úteis

| Comando | O que faz |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm start` | Executa o build de produção |
| `npm run lint` | Verifica o código com ESLint |
| `npx prisma generate` | Gera o Prisma Client |
| `npx prisma migrate dev` | Cria e aplica migrations em desenvolvimento |
| `npx prisma studio` | Abre uma interface visual do banco |
| `npx prisma migrate reset` | **Apaga** o banco e recria do zero |

---

## Estrutura do projeto

```
.
├── app/
│   ├── actions/
│   │   └── task-actions.ts     # Server Actions (CRUD com validação de dono)
│   ├── globals.css             # Tema, cores e fonte
│   ├── layout.tsx              # ClerkProvider, cabeçalho e Toaster
│   └── page.tsx                # Demonstração (visitante) ou lista real (logado)
├── components/
│   ├── ui/                     # Componentes do shadcn/ui e Container
│   ├── demo-list.tsx           # Demonstração com dados em memória
│   ├── task-dashboard.tsx      # Lista real de tarefas do usuário
│   └── theme-provider.tsx      # Provedor de tema
├── hooks/                      # Hooks personalizados
├── lib/
│   ├── prisma.ts               # Instância do Prisma Client
│   ├── tasks.ts                # Consultas filtradas por userId
│   ├── utils.ts                # Funções utilitárias (shadcn/ui)
│   └── validations.ts          # Validação dos formulários
├── prisma/
│   ├── schema.prisma           # Modelo de dados
│   └── migrations/             # Histórico de migrations
├── prisma.config.ts            # Configuração do Prisma
├── proxy.ts                    # clerkMiddleware (middleware.ts no Next.js 15 ou anterior)
├── .env                        # Variáveis de ambiente (não versionado)
└── package.json
```

## Autores

- Ester Martins
- Bruno Vital

Professor: Me. Abílio Soares Coelho, IFMA, Campus Timon

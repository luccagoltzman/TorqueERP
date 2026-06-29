# TorqueERP

Plataforma SaaS para gestão de autopeças e oficinas mecânicas — estoque, vendas, ordens de serviço, financeiro e atendimento em um único sistema.

## Stack

| Tecnologia | Versão |
|------------|--------|
| Next.js | 15.5.x |
| React | 19 |
| Tailwind CSS | 4 |
| shadcn/ui | 4 |
| Framer Motion | 12 |
| Supabase | 2.x |

## Começando

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com URL e anon key do Supabase

# Desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page |
| `/login`, `/register` | Autenticação (UI pronta) |
| `/dashboard` | Painel principal |
| `/estoque` | Inventário |
| `/vendas` | Pedidos e faturamento |
| `/ordens-servico` | Oficina |
| `/financeiro` | Contas e fluxo de caixa |

## Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Copie URL e anon key para `.env.local`
3. Aplique a migration:

```bash
supabase link --project-ref <seu-project-ref>
supabase db push
```

Ou execute o SQL em `supabase/migrations/20250628000000_initial_multi_tenant.sql` no SQL Editor.

## Estrutura

```
src/
  app/
    (marketing)/     # Landing
    (auth)/            # Login e registro
    (dashboard)/       # Módulos do ERP
  components/
    layout/            # Sidebar, header
    motion/            # Animações Framer Motion
    ui/                # shadcn/ui
  lib/supabase/        # Client, server, middleware
  types/               # Tipos do banco
supabase/migrations/   # Schema multi-tenant
```

## Scripts

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # ESLint
```

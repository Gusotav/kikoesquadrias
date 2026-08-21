# Integração Formulário → GoHighLevel + Persistência

## O que muda para o visitante

- Formulário com máscara de telefone em tempo real `(99) 99999-9999`.
- Validação inline: mensagens de erro abaixo de Nome e WhatsApp.
- Botão com spinner e desabilitado durante o envio.
- Sucesso: formulário limpo + mensagem/toast de sucesso (sem redirecionar para WhatsApp).
- Erro: toast "Ops! Algo deu errado. Tente novamente em instantes."
- Todo lead fica salvo no banco, mesmo se o GoHighLevel falhar; um retry automático reenvia depois.

## Etapas

### 1. Backend (Lovable Cloud)

- Habilitar Lovable Cloud.
- Migração criando `public.leads`:
  `id uuid pk`, `status text default 'pending'` (`pending|sent|failed`), `nome`, `telefone`, `perfil`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `url_conversao`, `page_referrer`, `attempts int default 0`, `last_error text`, `sent_at timestamptz`, `created_at timestamptz default now()`.
- GRANTs: apenas `service_role` (`GRANT ALL`). Sem acesso `anon`/`authenticated` — leads são gravados só pelo servidor.
- RLS habilitado, sem policies públicas (nenhum acesso via Data API do browser).
- Índice em `(status, created_at)` para o retry.
- Secret `GHL_TOKEN` cadastrado via ferramenta de secrets (nunca no código).

### 2. Utilitários (`src/lib/lead-utils.ts`)

- `maskPhoneBR(value)` — máscara progressiva `(99) 99999-9999`.
- `normalizePhoneBR(value)` — remove máscara e prefixa `+55`.
- `splitFullName(full)` — `firstName` = primeira palavra, `lastName` = restante (vazio se só uma palavra).
- `getUtmData()` — lê `utm_source|medium|campaign|content|term`, `gad_source`, `gclid`, `gbraid`, `wbraid` da URL; `page_referrer` (vazio se referrer for do próprio domínio); `url_conversao` = URL completa. Regras de atribuição:
  1. `utm_source` presente na URL → usa exatamente o valor.
  2. Vazio, mas `gclid`/`gad_source`/`gbraid`/`wbraid` presentes → `utm_source = "google"`, `utm_medium = "cpc"`.
  3. Sem parâmetros e referrer externo → `utm_source` = hostname do referrer.
  4. Nada disso → `utm_source = "direct"`, `utm_medium = "none"`.
- Parâmetros ausentes viram string vazia.
- Validação com Zod (nome obrigatório, telefone BR com 10–11 dígitos), reaproveitada no cliente e no servidor.

### 3. Envio (`src/lib/leads.functions.ts`)

- `submitLead` (`createServerFn`, público, sem auth) recebe nome, telefone, perfil e o bloco de UTMs; revalida com Zod.
- Grava a linha em `leads` com `status = 'pending'` via `supabaseAdmin` (carregado dentro do handler).
- Chama `POST https://services.leadconnectorhq.com/contacts/upsert` com headers `Content-Type`, `Accept`, `Version: 2021-07-28`, `Authorization: Bearer ${process.env['GHL_TOKEN']}` (lido dentro do handler) e o payload especificado: `locationId AB4y5smAgYubQUzicLFT`, `firstName`, `lastName`, `phone`, `tags: [utm_source, utm_campaign]`, os 8 `customFields` com os IDs informados, `source: "Lead LP Lovable"`.
- Sucesso (2xx) → `status = 'sent'`, `sent_at`. Falha → `status = 'failed'`, `last_error`, log no console; a função retorna sucesso ao cliente (o lead está salvo e será reenviado), exceto em erro de gravação no banco.
- O token nunca é exposto ao browser; o formulário nunca chama o GoHighLevel direto.

### 4. Retry automático

- Rota `src/routes/api/public/retry-leads.ts` (POST) protegida por header `x-cron-secret` comparado em tempo constante contra o secret `CRON_SECRET`.
- Busca até 25 linhas com `status in ('pending','failed')` e `attempts < 10`, reenvia via o mesmo helper e atualiza `status`/`attempts`/`last_error`.
- Agendamento a cada 5 minutos com `pg_cron` + `pg_net` chamando a URL estável do projeto com o header do secret.

### 5. Formulário (`src/routes/index.tsx`)

- Estado controlado para nome/telefone, erros por campo, `isSubmitting`.
- `onChange` do WhatsApp aplica `maskPhoneBR`; `inputMode="tel"`, `maxLength`.
- Submit: valida → `useServerFn(submitLead)` → limpa campos, mostra tela/toast de sucesso; em erro mostra a mensagem amigável.
- `<Toaster />` do sonner montado uma vez em `src/routes/__root.tsx`.

## Detalhes técnicos

- Camadas: `src/lib/lead-utils.ts` (puro, client-safe) · `src/lib/leads.functions.ts` (server fn) · `src/lib/ghl.server.ts` (chamada HTTP + update de status, reusada pelo retry) · `src/routes/api/public/retry-leads.ts`.
- Coluna de e-mail não será criada nem enviada (formulário segue com Nome, WhatsApp e Perfil).
- Sem redirecionamento para WhatsApp após o sucesso.

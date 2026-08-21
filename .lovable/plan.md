# Rastreamento de conversão Google Ads no formulário

## O que muda para o visitante

- Nada muda visualmente. O formulário continua igual: mesma máscara, mesmas validações, mesmo botão e mesmas mensagens.
- Ao enviar com sucesso, a conversão passa a ser registrada no Google Ads (com dados do lead em formato seguro, para Enhanced Conversions).
- Se o salvamento falhar, aparece só a mensagem de erro atual ("Ops! Algo deu errado...") — nenhuma conversão é enviada e não há redirecionamento para WhatsApp.
- Se o script do Google Ads estiver bloqueado (adblock) ou lento, o envio segue normal: o sucesso nunca depende dele.

## Etapas

### 1. Script global (`src/routes/__root.tsx`)

- Adicionar no `head()` da rota raiz:
  - `<script async src="https://www.googletagmanager.com/gtag/js?id=AW-18288202846">`
  - script inline inicializando `dataLayer`, `gtag('js', new Date())` e
    `gtag('config', 'AW-18288202846', { allow_enhanced_conversions: true })`.
- O Conversion Linker (linker automático entre domínios/cliques) já vem no gtag; será mantido explícito via `conversion_linker: true` no `config`.

### 2. Novo arquivo `src/lib/googleAds.ts`

- Tipagem de `window.gtag` e `window.dataLayer` (declaração global) para não quebrar o TypeScript.
- Constantes `AW-18288202846` e rótulo `hYv1CJ75juUcEN6ov5BE`.
- `normalizeUserData({ nome, telefone })`: usa os utilitários já existentes em `lead-utils` para separar nome em `first_name`/`last_name` e formatar o telefone em E.164 (`+55...`).
- `trackLeadConversion({ transactionId, nome, telefone, value = 1, currency = "BRL" })`:
  - se `window.gtag` não existir, apenas retorna (sem erro, sem log ruidoso);
  - chama `gtag('set', 'user_data', { phone_number, address: { first_name, last_name } })`;
  - chama `gtag('event', 'conversion', { send_to: 'AW-.../hYv1...', value, currency, transaction_id })`;
  - todo o corpo dentro de `try/catch` — falha do Ads nunca propaga.

### 3. Ordem de execução no formulário (`src/routes/index.tsx`, seção Contato)

Apenas a função `onSubmit` muda (nenhum estilo ou markup):

1. Valida com Zod (igual hoje).
2. Chama o server function que grava o lead no banco.
3. Só em caso de sucesso: dispara `trackLeadConversion` usando o **id do lead retornado pelo banco** como `transaction_id` (garante deduplicação), com `value: 1` e `currency: "BRL"`.
4. Limpa campos, mostra toast de sucesso e a tela de confirmação — sem esperar/depender do Google Ads.
5. Em erro: toast de erro, nenhuma conversão, nenhum redirecionamento.

### 4. Retorno do id do lead (`src/lib/leads.functions.ts`)

- `submitLead` passa a retornar também `id` (o uuid da linha criada em `leads`), que o formulário usa como `transaction_id`. Nenhuma outra mudança na gravação nem no envio ao GoHighLevel.

## Detalhes técnicos

- O escopo citava `src/components/index.tsx`, mas o formulário vive em `src/routes/index.tsx` (seção `Contato`) — é lá que a lógica será alterada.
- O disparo da conversão é client-side; o telefone é normalizado com `normalizePhoneBR` (já implementado) e o nome com `splitFullName`.
- Enhanced Conversions envia telefone/nome para o Google; o hash é feito pelo próprio gtag. E-mail não é coletado no formulário, então não será enviado.
- Nada do fluxo atual de persistência, retry via cron ou integração GoHighLevel é alterado.

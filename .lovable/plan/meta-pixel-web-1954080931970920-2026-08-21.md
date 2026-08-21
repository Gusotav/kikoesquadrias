# Meta Pixel Web (1954080931970920)

Rastreamento do Meta Pixel no browser, sem PageView duplicado em SPA nem em clique de âncora. Somente web (sem CAPI server-side).

Observação: não existe `REGRAS_INTERNAS.md` neste projeto, então segui as regras do próprio pedido.

## 1. `src/lib/fbpixel.ts` (novo)

- `FB_PIXEL_ID = "1954080931970920"`.
- `initPixel()` client-only: sai cedo se `typeof window === "undefined"` ou se `window._fbPixelInitialized` já existir (evita duplo init no HMR).
  - Cria o stub `fbq`, injeta `https://connect.facebook.net/en_US/fbevents.js`.
  - `fbq('init', FB_PIXEL_ID)`.
  - `fbq('set', 'autoConfig', false, FB_PIXEL_ID)` para desligar auto-track de pushState/hash.
  - Marca `window._fbPixelInitialized = true`.
- `getFbcFbp()`: lê `_fbc` e `_fbp` de `document.cookie`.
- `trackWebEvent(name, customData?, eventID?)`: gera `eventID` via `crypto.randomUUID()` quando ausente, chama `fbq('track', name, customData, { eventID })`, retorna o `eventID`. Nunca lança (try/catch com `console.warn`).
- `setAdvancedMatching({ first_name, last_name, phone })`: reinicializa com advanced matching via `fbq('init', FB_PIXEL_ID, {...})`, reaproveitando a normalização já existente em `src/lib/lead-utils.ts` (nome minúsculo, telefone E.164).
- Tipagem `Window.fbq` / `_fbq` / `_fbPixelInitialized` em `declare global`.

## 2. `src/components/MetaPixelProvider.tsx` (novo)

- Componente client-only que não renderiza nada.
- Effect 1 (mount): `initPixel()` + primeiro `PageView`; guarda `lastPathRef = pathname + search`.
- Effect 2: deps apenas `[pathname, search]` de `useLocation()` (hash fora das deps). Se mudou em relação ao ref, dispara `PageView` e atualiza o ref.

## 3. `src/routes/__root.tsx`

- Renderiza `<MetaPixelProvider />` dentro de `<ClientOnly fallback={null}>` no `RootComponent`.
- Nenhum script do Meta no head/HTML — tudo carregado pelo `initPixel()`.

## 4. Âncoras → scroll suave sem hash (`src/routes/index.tsx`)

- O componente `Button` (linha ~133) e os links de navegação usam `<a href="#...">`. Vou adicionar um helper `scrollToSection(id)` que faz `preventDefault()` + `document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })` sem alterar a URL.
- Aplicado em: logo `#top`, itens do menu desktop e mobile, CTAs `#contato` (navbar, menu mobile, hero) e `#portfolio` (hero), e links de seção no footer.
- Mantidos como estão: `mailto:`, Instagram e demais links externos.
- Visual inalterado — apenas o handler de clique muda.

## 5. Evento `Lead` no formulário (`src/routes/index.tsx`)

- No `onSubmit`, somente depois do salvamento no banco dar sucesso (mesmo ponto onde já dispara a conversão do Google Ads):
  - `setAdvancedMatching` com first_name, last_name e phone normalizados.
  - `trackWebEvent('Lead', { content_name: 'form_contato', content_category: 'lead_form' })` com `eventID` gerado.
- Falha do pixel nunca bloqueia a UI nem o toast de sucesso.

## Técnico / aceite

- Nenhuma execução de `fbq` no SSR: guards `typeof window` + `ClientOnly` (sem erro `window is not defined`).
- Clicar em `#contato` não muda rota nem hash → nenhum PageView extra.
- Navegação real entre rotas dispara exatamente 1 PageView (comparação com `lastPathRef`).
- Sem alterações de estilo e sem novas dependências.

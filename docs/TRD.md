# TRD – Documento de requisitos técnicos

## Stack

- HTML estático (`index.html`) com CSS inline.
- JavaScript puro no navegador (`js/formulario.js`).
- Função serverless Node.js na Vercel (`api/dificuldade.js`), sem dependências (usa `fetch` nativo).
- WhatsApp Cloud API (Meta) para entregar o formulário no WhatsApp.
- Cloudflare Turnstile como anti-robô.

## Hospedagem

Vercel, projeto ligado ao repositório `rodsaopaulo/JiNX`. Push no `main` publica em produção; outras branches geram prévia.

## Segredos

| Variável | Tipo | Onde fica |
|---|---|---|
| `WHATSAPP_TOKEN` | Secreta | Vercel → Environment Variables (Sensitive) |
| `TURNSTILE_SECRET_KEY` | Secreta | Vercel → Environment Variables (Sensitive) |
| `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_DESTINO`, `WHATSAPP_TEMPLATE`, `WHATSAPP_TEMPLATE_LANG`, `WHATSAPP_API_VERSION` | Configuração | Vercel → Environment Variables |
| Site Key do Turnstile | Pública | `index.html` (`data-sitekey`) |

Lista de nomes em `.env.example`. Passo a passo em `docs/CONFIGURAR-WHATSAPP.md`.

## Segurança

| Item | Solução |
|---|---|
| Headers (CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy) | `vercel.json` |
| Rate limit | Em memória na função (5 envios / 10 min por IP, por instância). Reforço opcional: regra de rate limit no Vercel Firewall para `/api/dificuldade` |
| Anti-bot | Cloudflare Turnstile, validado no servidor |
| WAF/CDN | Vercel Firewall (padrão da plataforma) |
| Limite de gasto | Meta cobra por mensagem de modelo: definir limite e alertas no Meta Business |
| Detecção de segredos | gitleaks no GitHub Actions |
| Atualizações | Dependabot para as GitHub Actions |

## Domínios externos liberados na CSP

| Domínio | Diretivas | Motivo |
|---|---|---|
| `fonts.googleapis.com` | `style-src` | CSS do Google Fonts |
| `fonts.gstatic.com` | `font-src` | Arquivos das fontes |
| `challenges.cloudflare.com` | `script-src`, `frame-src`, `connect-src` | Widget do Turnstile |

A função chama `graph.facebook.com` e `challenges.cloudflare.com` pelo servidor; isso não passa pela CSP.

# TRD – Documento de requisitos técnicos

## Stack

- HTML estático (`index.html`) com CSS inline.
- JavaScript puro em `js/formulario.js` (formulário que abre o WhatsApp).
- Logo em `dmr-logo.png`, servido do próprio site (coberto por `img-src 'self'`).
- Sem framework, sem build, sem dependências.

## Hospedagem

GitHub Pages, a partir da branch `main`, pasta raiz. Endereço: `https://rodsaopaulo.github.io/JiNX/`.

## Segredos

O projeto não usa segredos. Não há onde guardá-los com segurança, porque tudo no site é público. Qualquer integração que exija chave precisa de um back-end (ex.: função serverless), com a chave guardada nas variáveis de ambiente desse back-end.

## Segurança

| Item | Solução |
|---|---|
| Headers de segurança | CSP e Referrer-Policy via `<meta>` no `index.html`. O GitHub Pages não permite headers próprios |
| HTTPS / HSTS | Forçado pelo GitHub Pages |
| Clickjacking (`frame-ancestors`, `X-Frame-Options`) | Não disponível no GitHub Pages. Exige CDN (ex.: Cloudflare) ou outra hospedagem |
| Rate limit | Não se aplica: não há endpoint |
| WAF/CDN | Nenhum. Opcional: Cloudflare na frente de um domínio próprio |
| Anti-bot (CAPTCHA) | Não se aplica: o formulário não envia nada para servidor |
| Detecção de segredos | gitleaks no GitHub Actions (`.github/workflows/seguranca.yml`) |
| Atualizações | Dependabot para as GitHub Actions (`.github/dependabot.yml`) |

## Domínios externos liberados na CSP

| Domínio | Diretiva | Motivo |
|---|---|---|
| `fonts.googleapis.com` | `style-src` | CSS do Google Fonts |
| `fonts.gstatic.com` | `font-src` | Arquivos das fontes |

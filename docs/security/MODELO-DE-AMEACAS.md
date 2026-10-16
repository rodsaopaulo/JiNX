# Modelo de ameaças

## Dados que o site guarda

Nenhum. O site não tem banco, cookies próprios, analytics nem `localStorage`.

O formulário "Sua dificuldade" não envia dados para servidor. Ele só monta uma mensagem e abre o WhatsApp; a mensagem sai apenas quando o próprio visitante toca em enviar no WhatsApp.

Dados públicos de propósito: WhatsApp (11) 97650-5012, e-mail rodsaopaulo@hotmail.com, CNPJ e nome do fundador.

## Papéis

| Papel | O que pode fazer |
|---|---|
| Visitante | Ler a página, clicar nos links de WhatsApp e e-mail, preencher o formulário |
| Dono do repositório | Alterar o site pelo GitHub (único ponto de escrita) |

## Rotas

| Tipo | Rotas |
|---|---|
| Públicas | `/` (`index.html`), `/js/formulario.js` |
| Com login | Nenhuma |
| Admin | Nenhuma no site. A administração é a conta do GitHub |

## Integrações externas

| Serviço | Uso | Dados enviados |
|---|---|---|
| Google Fonts | Fontes Barlow Condensed e IBM Plex Sans | IP e navegador do visitante |
| WhatsApp (`wa.me`) | Botões de contato e formulário | Mensagem montada pelo visitante, só se ele enviar |
| GitHub Pages | Hospedagem | Logs de acesso do GitHub |

## Principais ameaças

| Ameaça | Mitigação |
|---|---|
| Invasão da conta do GitHub e alteração do site | 2FA na conta do GitHub (manual) |
| Script malicioso injetado na página | CSP com `script-src 'self'`; nenhum HTML montado com texto do usuário |
| Página dentro de iframe (clickjacking) | Impacto baixo (sem ações sensíveis). Bloqueio total exige header via CDN |
| Spam no e-mail publicado | Filtro de spam do provedor |
| Chave secreta commitada no futuro | gitleaks no GitHub Actions |

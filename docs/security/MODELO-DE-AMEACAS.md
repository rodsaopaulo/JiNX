# Modelo de ameaças

## Dados que o site trata

O site não guarda nada: não tem banco, cookies próprios, analytics nem `localStorage`.

O formulário "Sua dificuldade" envia **nome, WhatsApp e a dificuldade** do visitante para a função `/api/dificuldade`, que repassa à Meta (WhatsApp Cloud API). Esses dados ficam no WhatsApp do dono e nos sistemas da Meta.

Dados públicos de propósito: WhatsApp (11) 97650-5012, e-mail rodsaopaulo@hotmail.com, CNPJ e nome do fundador.

## Papéis

| Papel | O que pode fazer |
|---|---|
| Visitante | Ler a página, clicar nos links, enviar o formulário (limitado por Turnstile e rate limit) |
| Dono | Alterar o site pelo GitHub, configurar segredos na Vercel e a conta na Meta |

## Rotas

| Tipo | Rotas |
|---|---|
| Públicas | `/` (`index.html`), `/js/formulario.js`, `POST /api/dificuldade` |
| Com login | Nenhuma |
| Admin | Nenhuma no site. A administração é feita nas contas do GitHub, Vercel, Meta e Cloudflare |

## Integrações externas

| Serviço | Uso | Dados enviados |
|---|---|---|
| Google Fonts | Fontes | IP e navegador do visitante |
| Cloudflare Turnstile | Anti-robô | IP e sinais do navegador do visitante |
| WhatsApp Cloud API (Meta) | Entrega do formulário | Nome, WhatsApp e dificuldade |
| Vercel | Hospedagem e função | Logs de acesso |

## Principais ameaças

| Ameaça | Mitigação |
|---|---|
| Vazamento do token da Meta | Token só em variável Sensitive da Vercel; nunca no código; gitleaks no CI |
| Robôs enchendo o WhatsApp de spam e gerando custo na Meta | Turnstile validado no servidor, rate limit por IP, limite de gasto na Meta |
| Outro site usando a função | Verificação de `Origin` e do Turnstile (vinculado ao domínio) |
| Entrada maliciosa (XSS, injeção) | Lista de campos permitidos, limites, limpeza de caracteres de controle; nenhum HTML montado com texto do usuário |
| Erros vazando detalhes | Resposta genérica com ID; log sem token |
| Invasão das contas (GitHub, Vercel, Meta, Cloudflare) | 2FA em todas |
| Clickjacking | `frame-ancestors 'none'` e `X-Frame-Options: DENY` |

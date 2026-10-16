# Relatório final de segurança

Data: 15/10/2026 · Branch: `seguranca`

## 1. Achados da auditoria inicial

| # | Achado | Situação | Onde |
|---|---|---|---|
| A1 | Sem Content-Security-Policy | **Corrigido.** CSP via `<meta>`: `default-src 'none'`, `script-src 'self'` (sem `'unsafe-inline'`), fontes só do Google Fonts, `base-uri 'none'`, `form-action 'none'`. O script do formulário saiu do HTML e foi para `js/formulario.js` | `index.html:6`, `index.html:214`, `js/formulario.js` |
| A2 | Sem Referrer-Policy | **Corrigido.** `strict-origin-when-cross-origin` | `index.html:7` |
| A3 | Campos sem limite de tamanho | **Corrigido.** `maxlength` 120 / 20 / 1000 no HTML, o script corta os mesmos limites e não abre o WhatsApp se a dificuldade estiver vazia ou só com espaços | `index.html:201`, `:205`, `:209`; `js/formulario.js:6-12` |
| A4 | Clickjacking | **Pendente (manual).** Não dá para resolver no GitHub Pages | — |
| A5 | Google Fonts externo | **Aceito.** Opcional hospedar as fontes no repositório | `index.html:10-11` |
| A6 | E-mail público | **Aceito.** Canal de contato intencional | `index.html:196` |

O `style-src` ainda permite `'unsafe-inline'`, porque todo o visual do site está em atributos `style=""`. Tirar isso exigiria passar o CSS para um arquivo próprio. O risco é baixo: injeção de estilo não executa código.

## 2. Testes executados

| Teste | Resultado |
|---|---|
| Busca de segredos em todo o histórico do git (`sk-`, `sk_live`, `service_role`, `eyJ`, `AKIA`, `ghp_`, `api_key`, `secret`, `password`, `token`) | Nada encontrado |
| XSS no formulário: nome `<img src=x onerror=alert(1)>` | Vira texto na mensagem do WhatsApp; nenhum `alert` executado |
| SQL Injection no formulário: `' OR '1'='1` | Vira texto na mensagem; não há banco |
| Dificuldade vazia ou só com espaços | O WhatsApp não abre e o cursor volta para o campo |
| Texto gigante (300 caracteres no nome, 5.000 na dificuldade) | Cortado em 120 e 1.000 caracteres |
| Verificações do CI rodadas localmente (sem script inline, CSP presente, `noopener` nos links, sem `innerHTML`/`eval`) | Todas passaram |
| Rate limit, IDOR, rotas de admin, mensagens de erro do servidor | Não se aplicam: não há servidor |
| Auditoria de dependências | Não se aplica: não há dependências |

**Não testado:** a página completa num navegador com a CSP ativa. Isso só é possível depois de ativar o GitHub Pages. Ver o checklist abaixo.

## 3. Configuração manual (fora do código)

- [ ] Ativar **2FA** na conta do GitHub (`rodsaopaulo`). É o principal risco: quem entra na conta altera o site.
- [ ] Ativar o **GitHub Pages**: Settings → Pages → branch `main`, pasta `/ (root)`.
- [ ] Depois de publicar, abrir o site, apertar F12 → Console e confirmar que não há erros de "Content Security Policy". Testar o formulário e um botão de WhatsApp.
- [ ] Em Settings → Code security, ativar **Secret scanning** e **Push protection** (grátis em repositório público).
- [ ] Opcional: domínio próprio com **Cloudflare** na frente, para ter headers de verdade (`frame-ancestors`, `X-Frame-Options`, `Permissions-Policy`) e WAF.

Não há chaves para rotacionar: nenhum segredo foi encontrado.

## 4. Risco residual

**Baixo.** O site é estático, não guarda dados, não tem login nem servidor. O risco que sobra é a conta do GitHub ser invadida (mitigado com 2FA) e a página poder ser exibida dentro de iframe de outro site (impacto baixo, porque não há ações sensíveis).

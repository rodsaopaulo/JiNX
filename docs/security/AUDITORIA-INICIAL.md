# Auditoria inicial de segurança

Data: 15/10/2026 · Branch: `seguranca` · Commit auditado: `4de28f1`

Esta etapa só analisa e não altera nada no site (Prompt 0).

## 1. Stack

| Item | Situação |
|---|---|
| Tipo de projeto | Site estático de uma página (`index.html`), sem build |
| Linguagem | HTML, CSS inline e um script JavaScript inline (formulário) |
| Framework | Nenhum |
| Banco de dados | Nenhum |
| Autenticação | Nenhuma (não há login nem área restrita) |
| Hospedagem | Repositório público no GitHub (`rodsaopaulo/JiNX`). GitHub Pages ainda não ativado |
| APIs externas | Google Fonts (CSS e fontes) e links para `wa.me` (WhatsApp) |
| IA | Não usa |
| Dependências | Nenhuma (sem `package.json`) |

## 2. Rotas e endpoints

Não há servidor, API routes, server actions, edge functions nem webhooks. O formulário "Sua dificuldade" não envia nada para um servidor: o script monta um link `wa.me` e abre o WhatsApp numa nova aba.

## 3. Páginas administrativas

Nenhuma.

## 4. Achados

| # | Achado | Arquivo e linha | Risco | Como explorar | Correção recomendada |
|---|---|---|---|---|---|
| A1 | Sem Content-Security-Policy | `index.html` (head, linhas 3–16) | MÉDIO | Se algum dia entrar um script injetado (ex.: alteração indevida no repo ou extensão), nada limita o que ele pode carregar ou para onde enviar dados | Adicionar CSP via `<meta http-equiv>` (o GitHub Pages não permite headers próprios) e mover o script inline para arquivo próprio, para usar `script-src 'self'` sem `'unsafe-inline'` |
| A2 | Sem Referrer-Policy | `index.html` (head) | BAIXO | O endereço completo da página vai no Referer para Google Fonts e WhatsApp | `<meta name="referrer" content="strict-origin-when-cross-origin">` |
| A3 | Campos do formulário sem limite de tamanho | `index.html:199`, `:203`, `:207` | BAIXO | Colar um texto enorme gera um link do WhatsApp gigante que pode falhar ou travar o navegador | `maxlength` nos três campos |
| A4 | Proteção contra clickjacking indisponível | — | BAIXO | Outro site pode exibir a página dentro de um iframe. Como a página não tem login nem ações sensíveis, o impacto é baixo | `frame-ancestors`/`X-Frame-Options` só funcionam como header HTTP. Exige CDN na frente (ex.: Cloudflare) ou outra hospedagem. Fica como pendência manual |
| A5 | Google Fonts carregado de servidor externo | `index.html:8-9` | BAIXO | O IP do visitante é enviado ao Google (ponto de atenção para a LGPD) e o site depende de um terceiro | Opcional: hospedar as fontes no próprio repositório |
| A6 | E-mail em texto aberto (`mailto:`) | `index.html:194` | BAIXO | Robôs coletam o e-mail para spam | Aceito: é um canal de contato intencional. Usar filtro de spam |

### Itens verificados sem problemas

- **Segredos no código e no histórico do git:** nenhum. Busca por `sk-`, `sk_live`, `service_role`, `eyJ`, `AKIA`, `ghp_`, `api_key`, `secret`, `password` e `token` em todo o histórico, sem resultados.
- **XSS:** o script do formulário só lê `.value` dos campos e passa por `encodeURIComponent` antes de montar o link. Não há `innerHTML`, `insertAdjacentHTML`, `document.write`, `eval` nem `localStorage`.
- **Links em nova aba:** os 5 links `target="_blank"` têm `rel="noopener"`, então a página aberta não controla a original (tabnabbing). O `window.open` do formulário também usa `noopener`.
- **HTTPS:** o GitHub Pages força HTTPS com HSTS nos domínios `github.io`.
- **`.git`, `.env`, source maps, backups:** não existem no site, e o GitHub Pages não publica a pasta `.git`.
- **Dependências vulneráveis:** não há dependências, então `npm audit` não se aplica.

## 5. Prompts que se aplicam

| Prompt | Aplica? | Motivo |
|---|---|---|
| 1. Segredos | Não | Não há variáveis de ambiente nem chaves. Histórico limpo |
| 2. IDOR/BOLA/RLS | Não | Não há dados de usuários nem banco |
| 3. Senhas | Não | Não há login |
| 4. Validação de entrada | **Parcial** | Só o formulário, que não vai para servidor. Aplicar limites de tamanho (A3) |
| 5. XSS e headers | **Sim** | CSP e Referrer-Policy (A1, A2). Clickjacking como pendência (A4) |
| 6. Rate limit e anti-bot | Não | Não há endpoint. A mensagem só sai quando a própria pessoa envia no WhatsApp |
| 7. Prompt Injection | Não | Não usa IA |
| 8. SSRF | Não | Não há servidor |
| 9. Rotas admin | Não | Não há área administrativa |
| 10. Erros e logs | Não | Não há servidor nem `console.log` |
| 11. Regras permanentes | **Sim** | `CLAUDE.md`, modelo de ameaças, TRD e CI (gitleaks + Dependabot) |
| 12. Verificação final | **Sim** | Relatório final depois das correções |

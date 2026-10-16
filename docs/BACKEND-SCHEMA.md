# Esquema do back-end

Não há banco de dados nem autenticação. O único back-end é uma função serverless na Vercel.

## `POST /api/dificuldade` (`api/dificuldade.js`)

Pública, sem login. Recebe o formulário "Sua dificuldade" e envia para o WhatsApp do dono.

**Entrada (JSON, até 4 KB).** Campos fora desta lista fazem a requisição ser recusada:

| Campo | Regra |
|---|---|
| `nome` | Opcional, até 120 caracteres |
| `contato` | Obrigatório, só dígitos, espaço, `()+-`, de 10 a 13 dígitos |
| `dificuldade` | Obrigatório, de 5 a 1.000 caracteres |
| `turnstileToken` | Obrigatório, validado na Cloudflare |

Quebras de linha e caracteres de controle viram espaço (exigência da Meta para parâmetros de modelo).

**Proteções, na ordem:** só `POST` (405) → `Origin` igual ao próprio site (403) → tamanho (413) → rate limit de 5 envios a cada 10 minutos por IP (429 com `Retry-After`) → configuração presente (500) → validação (400) → Turnstile (400) → envio à Meta (502 se falhar).

**Respostas:** `{ "ok": true }` ou `{ "ok": false, "erro": "<mensagem genérica>", "id": "<referência>" }`. O `id` liga a resposta ao log da Vercel.

**Saída:** um modelo de mensagem `nova_dificuldade` (WhatsApp Cloud API) para `WHATSAPP_DESTINO`, com nome, contato e dificuldade como parâmetros.

**Dados guardados:** nenhum. O conteúdo passa pela função e vai para a Meta; o log registra só o ID, o código de erro da Meta e nomes de variáveis ausentes.

# Landing page DMR Assessoria

Página estática (`index.html`, `js/formulario.js`) publicada na Vercel, com uma função serverless (`api/dificuldade.js`) que envia o formulário para o WhatsApp pela API oficial da Meta. Sem build, sem dependências, sem banco.

Documentos: `docs/TRD.md`, `docs/BACKEND-SCHEMA.md`, `docs/CONFIGURAR-WHATSAPP.md`, `docs/security/`.

## Regras de segurança (obrigatórias)

- Segredos (`WHATSAPP_TOKEN`, `TURNSTILE_SECRET_KEY` e qualquer chave nova) só em variáveis de ambiente da Vercel, lidas em `api/`. Nunca em `index.html`, `js/` ou no repositório. Ao criar variável nova, adicione o nome (sem valor) ao `.env.example`.
- Toda rota nova em `api/` exige: só os métodos necessários, validação no servidor com lista de campos permitidos e limites de tamanho, rate limit, verificação do Turnstile quando aceitar envio público, e erro genérico para o cliente com ID de referência (detalhes só no log, sem token nem dados pessoais completos).
- Requisições a serviços externos em `api/` usam URL fixa (nada vindo do usuário) e `AbortSignal.timeout`.
- Não criar script inline nem atributos `on*=`. Todo JavaScript do navegador vai em `js/`.
- Nunca inserir texto do usuário no HTML (`innerHTML`, `insertAdjacentHTML`, `document.write`). Use `textContent` ou `.value`. Texto do usuário que vai para URL passa por `encodeURIComponent`.
- Todo campo de formulário tem `maxlength`, e o script e o servidor aplicam os mesmos limites.
- Links externos com `target="_blank"` sempre levam `rel="noopener"`.
- Os headers de segurança (CSP etc.) ficam no `vercel.json`. Ao adicionar recurso externo, libere só aquele domínio na CSP e registre em `docs/TRD.md`.
- Se o projeto ganhar login ou banco: autenticação e verificação de dono/papel no servidor, consultas parametrizadas, RLS em toda tabela do Supabase, senhas só via provedor de autenticação ou Argon2id/bcrypt.

# Landing page DMR Assessoria

Site estático de uma página, publicado pelo GitHub Pages: `index.html`, `js/formulario.js` e nada de build, servidor ou banco.

Documentos: `docs/TRD.md`, `docs/BACKEND-SCHEMA.md`, `docs/security/`.

## Regras de segurança (obrigatórias)

- Nunca colocar segredos (chaves de API, tokens, senhas) no código nem em variáveis com prefixo público. Este site não tem servidor: qualquer coisa nele é pública.
- Não criar script inline nem atributos `on*=`. Todo JavaScript vai em arquivo dentro de `js/`, porque a CSP só permite `script-src 'self'`.
- Nunca inserir texto do usuário no HTML (`innerHTML`, `insertAdjacentHTML`, `document.write`). Use `textContent` ou `.value`. Texto do usuário que vai para URL passa por `encodeURIComponent`.
- Todo campo de formulário tem `maxlength`, e o script corta o mesmo limite.
- Links externos com `target="_blank"` sempre levam `rel="noopener"`.
- Ao adicionar um recurso externo (fonte, script, imagem, API), atualize a CSP no `<head>` do `index.html` liberando só aquele domínio, e registre em `docs/TRD.md`.
- Se o projeto ganhar backend, login ou banco, estas regras passam a valer também:
  - toda rota nova exige autenticação, verificação de dono/papel no servidor e validação com schema;
  - consultas sempre parametrizadas, nunca SQL concatenado;
  - toda rota pública recebe rate limit; login e cadastro recebem CAPTCHA validado no servidor;
  - erros genéricos para o usuário, detalhes só no log;
  - tabelas novas no Supabase sempre com RLS e policies;
  - senhas só via provedor de autenticação ou Argon2id/bcrypt.

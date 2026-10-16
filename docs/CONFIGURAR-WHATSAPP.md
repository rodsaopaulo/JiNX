# Configurar o envio direto para o WhatsApp

O formulário "Sua dificuldade" envia os dados para `/api/dificuldade` (função na Vercel), que manda um **modelo de mensagem** pela **WhatsApp Cloud API** (API oficial da Meta) para o **(11) 97650-5012**.

Tudo abaixo é feito por você, nos painéis da Meta, da Cloudflare e da Vercel. Os segredos são digitados só nesses painéis e nunca vão para o código.

## 1. Número remetente

A mensagem precisa sair de **outro número**, registrado na API como remetente. O (11) 97650-5012 continua no seu WhatsApp normal e só recebe.

- Para testar: a Meta dá um **número de teste** grátis. Nesse caso, cadastre o (11) 97650-5012 como destinatário permitido (WhatsApp → Configuração da API → "Para").
- Para produção: um número novo (chip ou fixo) que **não** esteja em uso no app do WhatsApp.

## 2. App na Meta

1. Acesse **developers.facebook.com** → Meus apps → **Criar app** → tipo **Empresa**.
2. Adicione o produto **WhatsApp** e vincule à sua conta do **Meta Business** (crie uma, se não tiver).
3. Em **WhatsApp → Configuração da API**, anote o **ID do número de telefone** (vai em `WHATSAPP_PHONE_NUMBER_ID`).
4. Para produção, adicione e verifique o número remetente do passo 1.

## 3. Modelo de mensagem

A Meta só permite que uma empresa inicie conversa com um **modelo aprovado**.

No **WhatsApp Manager → Modelos de mensagem → Criar modelo**:

- **Categoria:** Utilidade
- **Nome:** `nova_dificuldade`
- **Idioma:** Português (BR)
- **Corpo:**

```
Nova dificuldade enviada pelo site da DMR Assessoria.
Nome e empresa: {{1}}
WhatsApp: {{2}}
Dificuldade: {{3}}
Responda pelo WhatsApp informado.
```

Exemplos para a aprovação: `João, Metalúrgica Silva` · `(11) 91234-5678` · `Não encontro rolamento X com prazo menor que 30 dias`.

A aprovação costuma levar de minutos a algumas horas. Cada mensagem de modelo de utilidade tem um custo pequeno cobrado pela Meta; cadastre uma forma de pagamento no Meta Business.

## 4. Token permanente

O token temporário da tela de teste expira em 24 horas. Para produção:

1. **business.facebook.com → Configurações → Usuários do sistema → Adicionar** (papel Admin).
2. **Atribuir ativos:** o app e a conta do WhatsApp, com controle total.
3. **Gerar token** com as permissões `whatsapp_business_messaging` e `whatsapp_business_management`.
4. Copie o token direto para a Vercel (passo 6). Não salve em arquivo nem mande por chat.

## 5. Cloudflare Turnstile (anti-robô)

1. **dash.cloudflare.com → Turnstile → Adicionar widget**.
2. Domínio: o endereço do site na Vercel (ex.: `jinx.vercel.app`) e o domínio próprio, se tiver.
3. Modo: **Gerenciado**.
4. Copie a **Site Key** (pública) e troque no `index.html` o valor de teste `1x00000000000000000000AA` em `data-sitekey`.
5. Copie a **Secret Key** para a Vercel (passo 6).

Enquanto a chave de teste estiver no site, o anti-robô não protege nada.

## 6. Variáveis na Vercel

No projeto **jinx** da Vercel → **Settings → Environment Variables**, crie (ambiente Production e Preview):

| Nome | Valor |
|---|---|
| `WHATSAPP_TOKEN` | Token permanente do passo 4 (marque como **Sensitive**) |
| `WHATSAPP_PHONE_NUMBER_ID` | ID do número do passo 2 |
| `WHATSAPP_DESTINO` | `5511976505012` |
| `WHATSAPP_TEMPLATE` | `nova_dificuldade` |
| `WHATSAPP_TEMPLATE_LANG` | `pt_BR` |
| `TURNSTILE_SECRET_KEY` | Secret Key do passo 5 (marque como **Sensitive**) |

Depois, faça um **Redeploy** para as variáveis valerem.

## 7. Testar

1. Abra o site, preencha o formulário e envie.
2. Deve aparecer "Recebi a sua mensagem!" e chegar a mensagem no (11) 97650-5012.
3. Se der erro, a tela mostra um código (ex.: `id a1b2c3d4`). Na Vercel, em **Logs**, procure esse código para ver o motivo (o token nunca aparece no log).

Erros comuns da Meta no log:

| Código | Causa |
|---|---|
| `132001` | Modelo não existe ou ainda não foi aprovado (confira nome e idioma) |
| `131030` | Com o número de teste, o destino não está na lista de permitidos |
| `190` | Token inválido ou expirado |
| `131047` / `131026` | Número de destino não recebe mensagens (confira `WHATSAPP_DESTINO`) |

Se o envio falhar, o visitante vê um link para falar com você direto pelo WhatsApp, então nenhum contato se perde.

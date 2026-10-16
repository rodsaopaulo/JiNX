// POST /api/dificuldade
// Recebe o formulário do site, valida, confere o Turnstile (anti-robô) e envia
// a dificuldade para o WhatsApp do dono pela API oficial da Meta (WhatsApp Cloud API).
// Segredos só em variáveis de ambiente da Vercel (ver .env.example).

const crypto = require('crypto');

const LIMITES = { nome: 120, contato: 20, dificuldade: 1000 };
const CAMPOS_PERMITIDOS = ['nome', 'contato', 'dificuldade', 'turnstileToken'];
const MAX_BODY_BYTES = 4096;

// Rate limit em memória: até 5 envios a cada 10 minutos por IP.
// É por instância da função (melhor esforço); a barreira principal é o Turnstile.
const JANELA_MS = 10 * 60 * 1000;
const MAX_ENVIOS = 5;
const tentativas = new Map();

function excedeuLimite(ip) {
  const agora = Date.now();
  const recentes = (tentativas.get(ip) || []).filter((t) => agora - t < JANELA_MS);
  recentes.push(agora);
  tentativas.set(ip, recentes);
  if (tentativas.size > 5000) tentativas.clear();
  return recentes.length > MAX_ENVIOS;
}

// A Meta rejeita parâmetros de template com quebra de linha, tab ou 4+ espaços seguidos.
function limparTexto(valor, max) {
  if (typeof valor !== 'string') return '';
  return valor.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function validar(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  if (Object.keys(body).some((k) => !CAMPOS_PERMITIDOS.includes(k))) return null;

  const nome = limparTexto(body.nome, LIMITES.nome);
  const contato = limparTexto(body.contato, LIMITES.contato);
  const dificuldade = limparTexto(body.dificuldade, LIMITES.dificuldade);
  const token = typeof body.turnstileToken === 'string' ? body.turnstileToken.slice(0, 2048) : '';

  const digitos = contato.replace(/\D/g, '');
  if (!/^[\d\s()+-]+$/.test(contato) || digitos.length < 10 || digitos.length > 13) return null;
  if (dificuldade.length < 5) return null;
  if (!token) return null;

  return { nome: nome || 'Não informado', contato, dificuldade, token };
}

async function verificarTurnstile(token, ip) {
  const resposta = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip }),
    signal: AbortSignal.timeout(5000),
  });
  const dados = await resposta.json();
  return dados.success === true;
}

async function enviarWhatsApp({ nome, contato, dificuldade }) {
  const versao = process.env.WHATSAPP_API_VERSION || 'v23.0';
  const url = `https://graph.facebook.com/${versao}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const resposta = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: process.env.WHATSAPP_DESTINO,
      type: 'template',
      template: {
        name: process.env.WHATSAPP_TEMPLATE || 'nova_dificuldade',
        language: { code: process.env.WHATSAPP_TEMPLATE_LANG || 'pt_BR' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: nome },
              { type: 'text', text: contato },
              { type: 'text', text: dificuldade },
            ],
          },
        ],
      },
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!resposta.ok) {
    // Só o código e o tipo do erro da Meta vão para o log; nunca o token.
    let detalhe = '';
    try {
      const erro = (await resposta.json()).error || {};
      detalhe = `code=${erro.code} subcode=${erro.error_subcode} type=${erro.type}`;
    } catch (_) {}
    throw new Error(`Meta respondeu ${resposta.status} ${detalhe}`);
  }
}

module.exports = async function handler(req, res) {
  const id = crypto.randomUUID().slice(0, 8);
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, erro: 'Método não permitido.' });
  }

  const origem = req.headers.origin || '';
  if (origem && origem !== `https://${req.headers.host}`) {
    return res.status(403).json({ ok: false, erro: 'Origem não permitida.' });
  }

  if (Number(req.headers['content-length'] || 0) > MAX_BODY_BYTES) {
    return res.status(413).json({ ok: false, erro: 'Mensagem muito grande.' });
  }

  const ip = String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'desconhecido';
  if (excedeuLimite(ip)) {
    res.setHeader('Retry-After', String(JANELA_MS / 1000));
    return res.status(429).json({ ok: false, erro: 'Muitos envios. Tente novamente em alguns minutos.' });
  }

  const faltando = ['TURNSTILE_SECRET_KEY', 'WHATSAPP_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_DESTINO']
    .filter((nome) => !process.env[nome]);
  if (faltando.length) {
    console.error(`[${id}] configuração ausente: ${faltando.join(', ')}`);
    return res.status(500).json({ ok: false, erro: 'Não foi possível enviar agora.', id });
  }

  let body;
  try {
    body = req.body;
  } catch (_) {
    body = null;
  }
  const dados = validar(body);
  if (!dados) {
    return res.status(400).json({ ok: false, erro: 'Confira os campos e tente novamente.' });
  }

  try {
    if (!(await verificarTurnstile(dados.token, ip))) {
      return res.status(400).json({ ok: false, erro: 'Não conseguimos confirmar que você não é um robô. Tente novamente.' });
    }
    await enviarWhatsApp(dados);
    return res.status(200).json({ ok: true });
  } catch (erro) {
    console.error(`[${id}] falha no envio: ${erro.message}`);
    return res.status(502).json({ ok: false, erro: 'Não foi possível enviar agora.', id });
  }
};

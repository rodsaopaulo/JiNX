// Formulário "Sua dificuldade": envia para /api/dificuldade, que repassa ao WhatsApp
// pela API oficial da Meta. Nunca insere texto do usuário no HTML (só .value e textContent).
(function () {
  var form = document.getElementById('form-dificuldade');
  var botao = form.querySelector('button[type="submit"]');
  var status = document.getElementById('form-status');
  var alternativa = document.getElementById('form-alternativa');
  var textoBotao = botao.textContent;

  function valor(id, max) {
    return document.getElementById(id).value.trim().slice(0, max);
  }

  function mostrar(mensagem, erro) {
    status.textContent = mensagem;
    status.style.color = erro ? '#FFB4A8' : '#9BE3A0';
  }

  function linkWhatsApp(nome, contato, texto) {
    var linhas = ['Olá! Gostaria de ajuda com uma dificuldade em suprimentos.'];
    if (nome) linhas.push('Nome e empresa: ' + nome);
    if (contato) linhas.push('WhatsApp: ' + contato);
    linhas.push('Minha dificuldade: ' + texto);
    return 'https://wa.me/5511976505012?text=' + encodeURIComponent(linhas.join('\n'));
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = valor('nome', 120);
    var contato = valor('contato', 20);
    var texto = valor('desafio-texto', 1000);
    alternativa.hidden = true;

    var digitos = contato.replace(/\D/g, '');
    if (digitos.length < 10 || digitos.length > 13) {
      mostrar('Informe um WhatsApp com DDD, por exemplo (11) 90000-0000.', true);
      document.getElementById('contato').focus();
      return;
    }
    if (texto.length < 5) {
      mostrar('Conte um pouco mais sobre a sua dificuldade.', true);
      document.getElementById('desafio-texto').focus();
      return;
    }
    var tokenCampo = form.querySelector('[name="cf-turnstile-response"]');
    var token = tokenCampo ? tokenCampo.value : '';
    if (!token) {
      mostrar('Aguarde a verificação anti-robô terminar e tente de novo.', true);
      return;
    }

    botao.disabled = true;
    botao.textContent = 'Enviando...';
    mostrar('', false);

    fetch('/api/dificuldade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: nome, contato: contato, dificuldade: texto, turnstileToken: token })
    })
      .then(function (r) {
        return r.json().catch(function () { return { ok: false }; });
      })
      .then(function (dados) {
        if (dados.ok) {
          form.reset();
          mostrar('Recebi a sua mensagem! Vou responder no seu WhatsApp em breve.', false);
        } else {
          mostrar((dados.erro || 'Não foi possível enviar agora.') + ' Se preferir, fale direto pelo WhatsApp:', true);
          alternativa.href = linkWhatsApp(nome, contato, texto);
          alternativa.hidden = false;
        }
      })
      .catch(function () {
        mostrar('Sem conexão. Se preferir, fale direto pelo WhatsApp:', true);
        alternativa.href = linkWhatsApp(nome, contato, texto);
        alternativa.hidden = false;
      })
      .then(function () {
        botao.disabled = false;
        botao.textContent = textoBotao;
        if (window.turnstile) window.turnstile.reset();
      });
  });
})();

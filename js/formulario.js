// Formulário "Sua dificuldade": monta a mensagem e abre o WhatsApp.
// Só lê .value e passa por encodeURIComponent; nunca insere texto do usuário no HTML.
document.getElementById('form-dificuldade').addEventListener('submit', function (e) {
  e.preventDefault();
  var campoTexto = document.getElementById('desafio-texto');
  var nome = document.getElementById('nome').value.trim().slice(0, 120);
  var contato = document.getElementById('contato').value.trim().slice(0, 20);
  var texto = campoTexto.value.trim().slice(0, 1000);
  if (!texto) {
    campoTexto.focus();
    return;
  }
  var linhas = ['Olá! Gostaria de ajuda com uma dificuldade em suprimentos.'];
  if (nome) linhas.push('Nome e empresa: ' + nome);
  if (contato) linhas.push('WhatsApp: ' + contato);
  linhas.push('Minha dificuldade: ' + texto);
  window.open('https://wa.me/5511976505012?text=' + encodeURIComponent(linhas.join('\n')), '_blank', 'noopener');
});

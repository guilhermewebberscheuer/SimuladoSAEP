// Ao abrir uma linguagem no menu, carrega seus tópicos do servidor local
// (evita colocar os milhares de links de todas as linguagens em cada página).
document.querySelectorAll('.sidebar-tech').forEach(function (details) {
  details.addEventListener('toggle', function () {
    var body = details.querySelector('.sidebar-tech-body');
    if (!details.open || body.hasAttribute('data-loaded')) return;
    body.setAttribute('data-loaded', '');
    fetch('/menu/' + encodeURIComponent(details.dataset.tech))
      .then(function (res) {
        if (!res.ok) throw new Error(res.status);
        return res.text();
      })
      .then(function (html) {
        body.innerHTML = html;
      })
      .catch(function () {
        body.removeAttribute('data-loaded');
      });
  });
});

// Rola o menu (não a página) até o item da página aberta.
var sidebar = document.querySelector('.sidebar');
var active = document.querySelector('.sidebar-pages a.active');
if (sidebar && active) sidebar.scrollTop = active.offsetTop - sidebar.clientHeight / 2;

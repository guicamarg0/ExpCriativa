(function () {
  let sessaoEsportesAtual = null;

  async function obterSessaoEsportesAtual() {
    sessaoEsportesAtual = window.mitraSessao;
    return sessaoEsportesAtual;
  }

  async function aplicarPermissoesTelaEsportes() {
    return obterSessaoEsportesAtual();
  }

  function obterSessaoAtual() {
    return sessaoEsportesAtual;
  }

  document.addEventListener("mitra:sessao", (event) => {
    sessaoEsportesAtual = event.detail;
  });

  window.esportesSessao = {
    obterSessaoEsportesAtual,
    aplicarPermissoesTelaEsportes,
    obterSessaoAtual
  };
})();

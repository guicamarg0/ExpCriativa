(function () {
  let sessaoEsportesAtual = null;

  async function obterSessaoEsportesAtual() {
    if (!window.mitraSessao) {
      await new Promise((resolve) => {
        document.addEventListener("mitra:sessao", resolve, { once: true });
      });
    }
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

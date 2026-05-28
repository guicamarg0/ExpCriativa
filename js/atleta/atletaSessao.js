(function () {
  let sessaoAtletaAtual = null;

  async function obterSessaoAtletaAtual() {
    if (!window.mitraSessao) {
      await new Promise((resolve) => {
        document.addEventListener("mitra:sessao", resolve, { once: true });
      });
    }
    sessaoAtletaAtual = window.mitraSessao;
    return sessaoAtletaAtual;
  }

  async function aplicarPermissoesTelaAtleta() {
    return obterSessaoAtletaAtual();
  }

  function obterSessaoAtual() {
    return sessaoAtletaAtual;
  }

  document.addEventListener("mitra:sessao", (event) => {
    sessaoAtletaAtual = event.detail;
  });

  window.atletaSessao = {
    obterSessaoAtletaAtual,
    aplicarPermissoesTelaAtleta,
    obterSessaoAtual
  };
})();

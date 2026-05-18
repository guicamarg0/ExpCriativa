(function () {
  let sessaoAtletaAtual = null;

  async function obterSessaoAtletaAtual() {
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

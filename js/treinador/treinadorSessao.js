(function () {
  let sessaoTreinadorAtual = null;

  async function obterSessaoTreinadorAtual() {
    sessaoTreinadorAtual = window.mitraSessao;
    return sessaoTreinadorAtual;
  }

  async function aplicarPermissoesTelaTreinador() {
    return obterSessaoTreinadorAtual();
  }

  function obterSessaoAtual() {
    return sessaoTreinadorAtual;
  }

  document.addEventListener("mitra:sessao", (event) => {
    sessaoTreinadorAtual = event.detail;
  });

  window.treinadorSessao = {
    obterSessaoTreinadorAtual,
    aplicarPermissoesTelaTreinador,
    obterSessaoAtual
  };
})();

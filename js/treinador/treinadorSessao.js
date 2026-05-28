(function () {
  let sessaoTreinadorAtual = null;

  async function obterSessaoTreinadorAtual() {
    if (!window.mitraSessao) {
      await new Promise((resolve) => {
        document.addEventListener("mitra:sessao", resolve, { once: true });
      });
    }
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

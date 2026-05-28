(function () {
  let sessaoEquipeAtual = null;

  async function obterSessaoEquipeAtual() {
    if (!window.mitraSessao) {
      await new Promise((resolve) => {
        document.addEventListener("mitra:sessao", resolve, { once: true });
      });
    }
    sessaoEquipeAtual = window.mitraSessao;
    return sessaoEquipeAtual;
  }

  function filtrarEquipesPorSessao(tabela) {
    return tabela;
  }

  async function aplicarPermissoesTelaEquipe() {
    return obterSessaoEquipeAtual();
  }

  function obterSessaoAtual() {
    return sessaoEquipeAtual;
  }

  document.addEventListener("mitra:sessao", (event) => {
    sessaoEquipeAtual = event.detail;
  });

  window.equipeSessao = {
    obterSessaoEquipeAtual,
    filtrarEquipesPorSessao,
    aplicarPermissoesTelaEquipe,
    obterSessaoAtual
  };
})();

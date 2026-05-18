(function () {
  let sessaoEquipeAtual = null;

  async function obterSessaoEquipeAtual() {
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

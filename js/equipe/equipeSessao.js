(function () {
  const EQUIPE_STORAGE_SESSION_KEY = "mitraSessionKey";
  let sessaoEquipeAtual = null;

  function sessaoEhTreinador(sessao) {
    return Number(sessao?.id_nivel || 0) === 2;
  }

  function obterIdTreinadorSessao(sessao) {
    const valor = Number(sessao?.perfil?.id || 0);
    return Number.isInteger(valor) && valor > 0 ? valor : 0;
  }

  // validar sessao
  async function obterSessaoEquipeAtual() {
    if (window.mitraSessao && window.mitraSessao.status === "ok") {
      sessaoEquipeAtual = window.mitraSessao;
      return sessaoEquipeAtual;
    }

    if (sessaoEquipeAtual && sessaoEquipeAtual.status === "ok") {
      return sessaoEquipeAtual;
    }

    const sessionKey = localStorage.getItem(EQUIPE_STORAGE_SESSION_KEY) || "";
    if (!sessionKey) {
      return null;
    }

    try {
      const retorno = await fetch("../php/valida_sessao.php", {
        cache: "no-store",
        headers: {
          "X-Session-Key": sessionKey,
        },
      });
      if (!retorno.ok) {
        return null;
      }

      const resposta = await retorno.json();
      if (resposta.status === "ok") {
        sessaoEquipeAtual = resposta;
        window.mitraSessao = window.mitraSessao || resposta;
        return resposta;
      }
    } catch (erro) {
      console.error(erro);
    }

    return null;
  }

  function filtrarEquipesPorSessao(tabela, sessao) {
    if (!Array.isArray(tabela)) {
      return [];
    }

    if (!sessaoEhTreinador(sessao)) {
      return tabela;
    }

    const idTreinador = obterIdTreinadorSessao(sessao);
    if (!idTreinador) {
      return [];
    }

    return tabela.filter(
      (equipe) => Number(equipe.id_treinador_responsavel || 0) === idTreinador,
    );
  }

  function atualizarVisibilidadeBotaoAdicionarEquipe(sessao) {
    const botao = document.querySelector("#btnAbrirModalEquipe");
    if (!botao) {
      return;
    }

    const ocultar = sessaoEhTreinador(sessao);
    botao.style.display = ocultar ? "none" : "";
    botao.disabled = ocultar;
  }

  async function aplicarPermissoesTelaEquipe() {
    const sessao = await obterSessaoEquipeAtual();
    atualizarVisibilidadeBotaoAdicionarEquipe(sessao);
  }

  function obterSessaoAtual() {
    return sessaoEquipeAtual;
  }

  document.addEventListener("mitra:sessao", (event) => {
    if (event.detail && event.detail.status === "ok") {
      sessaoEquipeAtual = event.detail;
      atualizarVisibilidadeBotaoAdicionarEquipe(sessaoEquipeAtual);
    }
  });

  window.equipeSessao = {
    sessaoEhTreinador,
    obterIdTreinadorSessao,
    obterSessaoEquipeAtual,
    filtrarEquipesPorSessao,
    atualizarVisibilidadeBotaoAdicionarEquipe,
    aplicarPermissoesTelaEquipe,
    obterSessaoAtual,
  };
})();

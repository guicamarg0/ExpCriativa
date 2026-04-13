(function () {
    const ATLETA_STORAGE_SESSION_KEY = "mitraSessionKey";
    let sessaoAtletaAtual = null;

    // validar sessao
    async function obterSessaoAtletaAtual() {
        if (window.mitraSessao && window.mitraSessao.status === "ok") {
            sessaoAtletaAtual = window.mitraSessao;
            return sessaoAtletaAtual;
        }

        if (sessaoAtletaAtual && sessaoAtletaAtual.status === "ok") {
            return sessaoAtletaAtual;
        }

        const sessionKey = localStorage.getItem(ATLETA_STORAGE_SESSION_KEY) || "";
        if (!sessionKey) {
            return null;
        }

        try {
            const retorno = await fetch("../php/valida_sessao.php", {
                cache: "no-store",
                headers: {
                    "X-Session-Key": sessionKey
                }
            });

            if (!retorno.ok) {
                return null;
            }

            const resposta = await retorno.json();
            if (resposta.status === "ok") {
                sessaoAtletaAtual = resposta;
                window.mitraSessao = window.mitraSessao || resposta;
                return resposta;
            }
        } catch (erro) {
            console.error(erro);
        }

        return null;
    }

    async function aplicarPermissoesTelaAtleta() {
        return obterSessaoAtletaAtual();
    }

    function obterSessaoAtual() {
        return sessaoAtletaAtual;
    }

    document.addEventListener("mitra:sessao", (event) => {
        if (event.detail && event.detail.status === "ok") {
            sessaoAtletaAtual = event.detail;
        }
    });

    window.atletaSessao = {
        obterSessaoAtletaAtual,
        aplicarPermissoesTelaAtleta,
        obterSessaoAtual
    };
})();

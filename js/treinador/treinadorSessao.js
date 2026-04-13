(function () {
    const TREINADOR_STORAGE_SESSION_KEY = "mitraSessionKey";
    let sessaoTreinadorAtual = null;

    // validar sessao
    async function obterSessaoTreinadorAtual() {
        if (window.mitraSessao && window.mitraSessao.status === "ok") {
            sessaoTreinadorAtual = window.mitraSessao;
            return sessaoTreinadorAtual;
        }

        if (sessaoTreinadorAtual && sessaoTreinadorAtual.status === "ok") {
            return sessaoTreinadorAtual;
        }

        const sessionKey = localStorage.getItem(TREINADOR_STORAGE_SESSION_KEY) || "";
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
                sessaoTreinadorAtual = resposta;
                window.mitraSessao = window.mitraSessao || resposta;
                return resposta;
            }
        } catch (erro) {
            console.error(erro);
        }

        return null;
    }

    async function aplicarPermissoesTelaTreinador() {
        return obterSessaoTreinadorAtual();
    }

    function obterSessaoAtual() {
        return sessaoTreinadorAtual;
    }

    document.addEventListener("mitra:sessao", (event) => {
        if (event.detail && event.detail.status === "ok") {
            sessaoTreinadorAtual = event.detail;
        }
    });

    window.treinadorSessao = {
        obterSessaoTreinadorAtual,
        aplicarPermissoesTelaTreinador,
        obterSessaoAtual
    };
})();

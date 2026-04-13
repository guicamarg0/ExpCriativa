(function () {
    const ESPORTES_STORAGE_SESSION_KEY = "mitraSessionKey";
    let sessaoEsportesAtual = null;

    // validar sessao
    async function obterSessaoEsportesAtual() {
        if (window.mitraSessao && window.mitraSessao.status === "ok") {
            sessaoEsportesAtual = window.mitraSessao;
            return sessaoEsportesAtual;
        }

        if (sessaoEsportesAtual && sessaoEsportesAtual.status === "ok") {
            return sessaoEsportesAtual;
        }

        const sessionKey = localStorage.getItem(ESPORTES_STORAGE_SESSION_KEY) || "";
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
                sessaoEsportesAtual = resposta;
                window.mitraSessao = window.mitraSessao || resposta;
                return resposta;
            }
        } catch (erro) {
            console.error(erro);
        }

        return null;
    }

    async function aplicarPermissoesTelaEsportes() {
        return obterSessaoEsportesAtual();
    }

    function obterSessaoAtual() {
        return sessaoEsportesAtual;
    }

    document.addEventListener("mitra:sessao", (event) => {
        if (event.detail && event.detail.status === "ok") {
            sessaoEsportesAtual = event.detail;
        }
    });

    window.esportesSessao = {
        obterSessaoEsportesAtual,
        aplicarPermissoesTelaEsportes,
        obterSessaoAtual
    };
})();

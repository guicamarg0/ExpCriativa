(function () {
    function montarQueryTreinador(params = {}) {
        const query = new URLSearchParams();

        if (params.id !== undefined && params.id !== null && params.id !== "") {
            query.set("id", String(params.id));
        }
        if (params.status) {
            query.set("status", String(params.status));
        }

        const textoQuery = query.toString();
        return textoQuery ? `?${textoQuery}` : "";
    }

    // ver
    async function listarTreinadores(status = "ativo") {
        const query = montarQueryTreinador({ status });
        const retorno = await fetch(`../php/treinador/treinador_get.php${query}`);
        return retorno.json();
    }

    // ver
    async function buscarTreinadorPorId(id, status = "todos") {
        const query = montarQueryTreinador({ id, status });
        const retorno = await fetch(`../php/treinador/treinador_get.php${query}`);
        return retorno.json();
    }

    // criar
    async function criarTreinador(formData) {
        const retorno = await fetch("../php/treinador/treinador_novo.php", {
            method: "POST",
            body: formData
        });
        return retorno.json();
    }

    // editar
    async function editarTreinador(formData) {
        const retorno = await fetch("../php/treinador/treinador_alterar.php", {
            method: "POST",
            body: formData
        });
        return retorno.json();
    }

    // inativar
    async function alternarStatusTreinador(id, status) {
        const formData = new FormData();
        formData.append("id", String(id || ""));
        formData.append("status", String(status || "inativo"));
        return editarTreinador(formData);
    }

    window.treinadorCRUD = {
        listarTreinadores,
        buscarTreinadorPorId,
        criarTreinador,
        editarTreinador,
        alternarStatusTreinador
    };
})();

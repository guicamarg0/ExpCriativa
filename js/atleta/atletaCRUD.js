(function () {
    function montarQueryAtleta(params = {}) {
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
    async function listarAtletas(status = "ativo") {
        const query = montarQueryAtleta({ status });
        const retorno = await fetch(`../php/atleta/atleta_get.php${query}`);
        return retorno.json();
    }

    // ver
    async function buscarAtletaPorId(id, status = "todos") {
        const query = montarQueryAtleta({ id, status });
        const retorno = await fetch(`../php/atleta/atleta_get.php${query}`);
        return retorno.json();
    }

    // criar
    async function criarAtleta(formData) {
        const retorno = await fetch("../php/atleta/atleta_novo.php", {
            method: "POST",
            body: formData
        });
        return retorno.json();
    }

    // editar
    async function editarAtleta(formData) {
        const retorno = await fetch("../php/atleta/atleta_alterar.php", {
            method: "POST",
            body: formData
        });
        return retorno.json();
    }

    // inativar
    async function alternarStatusAtleta(id, status) {
        const formData = new FormData();
        formData.append("id", String(id || ""));
        formData.append("status", String(status || "inativo"));
        return editarAtleta(formData);
    }

    window.atletaCRUD = {
        listarAtletas,
        buscarAtletaPorId,
        criarAtleta,
        editarAtleta,
        alternarStatusAtleta
    };
})();

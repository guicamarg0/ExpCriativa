(function () {
    function montarQueryEsporte(params = {}) {
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
    async function listarEsportes(status = "ativo") {
        const query = montarQueryEsporte({ status });
        const retorno = await fetch(`../php/esportes/esportes_get.php${query}`);
        return retorno.json();
    }

    // ver
    async function buscarEsportePorId(id, status = "todos") {
        const query = montarQueryEsporte({ id, status });
        const retorno = await fetch(`../php/esportes/esportes_get.php${query}`);
        return retorno.json();
    }

    // criar
    async function criarEsporte(formData) {
        const retorno = await fetch("../php/esportes/esportes_novo.php", {
            method: "POST",
            body: formData
        });
        return retorno.json();
    }

    // editar
    async function editarEsporte(id, formData) {
        const retorno = await fetch(`../php/esportes/esportes_alterar.php?id=${encodeURIComponent(id)}`, {
            method: "POST",
            body: formData
        });
        return retorno.json();
    }

    // inativar
    async function alternarStatusEsporte(id, status) {
        const formData = new FormData();
        formData.append("status", String(status || "inativo"));
        return editarEsporte(id, formData);
    }

    window.esportesCRUD = {
        listarEsportes,
        buscarEsportePorId,
        criarEsporte,
        editarEsporte,
        alternarStatusEsporte
    };
})();

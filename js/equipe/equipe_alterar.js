document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("formEquipeEdicao");
    if (!form) {
        return;
    }

    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) {
        window.location.href = "equipe.html";
        return;
    }

    const retorno = await fetch(`../php/equipe/equipe_get.php?id=${id}&status=todos`);
    const resposta = await retorno.json();
    if (resposta.status !== "ok" || !Array.isArray(resposta.data) || !resposta.data[0]) {
        window.location.href = "equipe.html";
        return;
    }

    const equipe = resposta.data[0];
    form.elements.id.value = equipe.id || "";
    form.elements.nome.value = equipe.nome || "";
    form.elements.categoria.value = equipe.categoria || "";
    form.elements.id_modalidade.value = equipe.id_modalidade || "";
    form.elements.id_genero.value = equipe.id_genero || "";
    form.elements.id_treinador_responsavel.value = equipe.id_treinador_responsavel || "";
    form.elements.descricao.value = equipe.descricao || "";
    form.elements.status.value = equipe.status || "ativa";

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        await fetch("../php/equipe/equipe_alterar.php", {
            method: "POST",
            body: formData
        });

        const idsAtletas = formData.get("atletas_ids") || "";
        if (idsAtletas) {
            const vinculoData = new FormData();
            vinculoData.append("id_equipe", String(id));
            vinculoData.append("atletas_ids", String(idsAtletas));
            vinculoData.append("forcar_vinculo", "0");
            await fetch("../php/equipe/equipe_vincular_atletas.php", {
                method: "POST",
                body: vinculoData
            });
        }

        window.location.href = "equipe.html";
    });
});

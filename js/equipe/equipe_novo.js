document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formEquipeNovo");
    if (!form) {
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        formData.set("status", "ativa");
        const retorno = await fetch("../php/equipe/equipe_novo.php", {
            method: "POST",
            body: formData
        });
        const resposta = await retorno.json();
        const idEquipe = resposta.data?.id || "";
        const idsAtletas = formData.get("atletas_ids") || "";

        if (idEquipe && idsAtletas) {
            const vinculoData = new FormData();
            vinculoData.append("id_equipe", String(idEquipe));
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

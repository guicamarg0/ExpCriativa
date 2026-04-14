document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formEquipeNovo");
    if (!form) {
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        formData.set("status", "ativa");
        const resposta = await window.equipeCRUD.criarEquipe(formData);
        const idEquipe = resposta.data?.id || "";
        const idsAtletas = formData.get("atletas_ids") || "";

        if (idEquipe && idsAtletas) {
            await window.equipeCRUD.vincularAtletasEquipe(idEquipe, idsAtletas);
        }

        window.location.href = "equipe.html";
    });
});

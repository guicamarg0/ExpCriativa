document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("formEsporteEdicao");
    if (!form) {
        return;
    }

    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) {
        window.location.href = "esportes.html";
        return;
    }

    const resposta = await window.esportesCRUD.buscarEsportePorId(id, "todos");
    if (resposta.status !== "ok" || !Array.isArray(resposta.data) || !resposta.data[0]) {
        window.location.href = "esportes.html";
        return;
    }

    const esporte = resposta.data[0];
    form.elements.id.value = esporte.id || "";
    form.elements.nome.value = esporte.nome || "";
    form.elements.status.value = esporte.status || "ativo";

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        await window.esportesCRUD.editarEsporte(id, formData);
        window.location.href = "esportes.html";
    });
});

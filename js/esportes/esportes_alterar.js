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

    const retorno = await fetch(`../php/esportes/esportes_get.php?id=${id}&status=todos`);
    const resposta = await retorno.json();
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
        await fetch(`../php/esportes/esportes_alterar.php?id=${id}`, {
            method: "POST",
            body: formData
        });
        window.location.href = "esportes.html";
    });
});

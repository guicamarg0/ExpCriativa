document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("formAtletaEdicao");
    if (!form) {
        return;
    }

    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) {
        window.location.href = "atleta.html";
        return;
    }

    const retorno = await fetch(`../php/atleta/atleta_get.php?id=${id}&status=todos`);
    const resposta = await retorno.json();
    if (resposta.status !== "ok" || !Array.isArray(resposta.data) || !resposta.data[0]) {
        window.location.href = "atleta.html";
        return;
    }

    const atleta = resposta.data[0];
    form.elements.id.value = atleta.id || "";
    form.elements.nome.value = atleta.nome || "";
    form.elements.data_nascimento.value = atleta.data_nascimento ? String(atleta.data_nascimento).slice(0, 10) : "";
    form.elements.id_genero.value = atleta.id_genero || "";
    form.elements.altura.value = atleta.altura || "";
    form.elements.peso.value = atleta.peso || "";
    form.elements.status.value = atleta.status || "ativo";

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        await fetch("../php/atleta/atleta_alterar.php", {
            method: "POST",
            body: formData
        });
        window.location.href = "atleta.html";
    });
});

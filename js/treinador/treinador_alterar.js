document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("formTreinadorEdicao");
    if (!form) {
        return;
    }

    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) {
        window.location.href = "treinador.html";
        return;
    }

    const resposta = await window.treinadorCRUD.buscarTreinadorPorId(id, "todos");
    if (resposta.status !== "ok" || !Array.isArray(resposta.data) || !resposta.data[0]) {
        window.location.href = "treinador.html";
        return;
    }

    const treinador = resposta.data[0];
    form.elements.id.value = treinador.id || "";
    form.elements.nome.value = treinador.nome || "";
    form.elements.data_nascimento.value = treinador.data_nascimento ? String(treinador.data_nascimento).slice(0, 10) : "";
    form.elements.telefone.value = treinador.telefone || "";
    form.elements.cref.value = treinador.cref || "";
    form.elements.data_inicio.value = treinador.data_inicio ? String(treinador.data_inicio).slice(0, 10) : "";
    form.elements.email.value = treinador.email || "";
    form.elements.status.value = treinador.status || "ativo";

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        await window.treinadorCRUD.editarTreinador(formData);
        window.location.href = "treinador.html";
    });
});

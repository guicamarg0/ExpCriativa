document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formTreinadorNovo");
    if (!form) {
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        await window.treinadorCRUD.criarTreinador(formData);
        window.location.href = "treinador.html";
    });
});

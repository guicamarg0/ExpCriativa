document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formTreinadorNovo");
    if (!form) {
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(formTreinador);
        const formDataUsuario = new FormData(formUsuario);

        for (const [chave, valor] of formDataUsuario.entries()) {
            formData.append(chave, valor);
        }

        await fetch("../php/treinador/treinador_novo.php", {
            method: "POST",
            body: formData
        });

        window.location.href = "treinador.html";
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const formTreinador = document.getElementById("formTreinadorNovo");
    const formUsuario = document.getElementById("formUsuarioTreinadorNovo");

    formUsuario.addEventListener("submit", async (event) => {
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

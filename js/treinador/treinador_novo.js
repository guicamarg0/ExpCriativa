document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formTreinadorNovo");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);

        const retorno = await fetch("../php/treinador/treinador_novo.php", {
            method: "POST",
            body: formData
        });

        const resposta = await retorno.json();

        if (resposta.status === "ok") {
            window.location.href = "treinador.html";
        } else {
            alert(resposta.mensagem || "Erro ao cadastrar treinador.");
        }
    });
});
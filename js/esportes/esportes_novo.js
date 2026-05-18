document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formEsporteNovo");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        await fetch("../php/esportes/esportes_novo.php", {
            method: "POST",
            body: formData
        });
        window.location.href = "esportes.html";
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formAtletaNovo");
    if (!form) {
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        await window.atletaCRUD.criarAtleta(formData);
        window.location.href = "atleta.html";
    });
});

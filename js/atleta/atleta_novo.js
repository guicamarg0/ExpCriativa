document.addEventListener("DOMContentLoaded", async () => {
  const formAtleta = document.getElementById("formAtletaNovo");
  const formUsuario = document.getElementById("formUsuarioAtletaNovo");

  await carregarOpcoesSelect({
    selectId: "id_genero",
    url: "../php/genero_get.php",
    placeholder: "Selecione um genero"
  });

  formUsuario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(formAtleta);
    const formDataUsuario = new FormData(formUsuario);

    for (const [chave, valor] of formDataUsuario.entries()) {
      formData.append(chave, valor);
    }

    await fetch("../php/atleta/atleta_novo.php", {
      method: "POST",
      body: formData
    });

    window.location.href = "atleta.html";
  });
});

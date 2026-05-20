document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formAtletaEdicao");
  const id = new URLSearchParams(window.location.search).get("id");

  const retornoAtleta = await fetch(`../php/atleta/atleta_get.php?id=${id}`);
  const respostaAtleta = await retornoAtleta.json();
  const atleta = (respostaAtleta.data || [])[0] || {};

  form.elements.id.value = atleta.id || "";
  form.elements.nome.value = atleta.nome || "";
  form.elements.data_nascimento.value = atleta.data_nascimento ? String(atleta.data_nascimento).slice(0, 10) : "";
  form.elements.altura.value = atleta.altura || "";
  form.elements.peso.value = atleta.peso || "";
  form.elements.status.value = atleta.status || "ativo";

  const selectGenero = document.getElementById("id_genero");
  selectGenero.innerHTML = '<option value="">Selecione um genero</option>';

  const retornoGeneros = await fetch("../php/genero_get.php");
  const respostaGeneros = await retornoGeneros.json();

  for (let i = 0; i < (respostaGeneros.data || []).length; i++) {
    const genero = respostaGeneros.data[i];
    const option = document.createElement("option");
    option.value = String(genero.id ?? "");
    option.textContent = String(genero.nome ?? "");
    selectGenero.appendChild(option);
  }

  selectGenero.value = String(atleta.id_genero || "");

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

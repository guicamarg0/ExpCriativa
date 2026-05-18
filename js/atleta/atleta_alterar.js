document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formAtletaEdicao");

  const id = new URLSearchParams(window.location.search).get("id");
  const retorno = await fetch(`../php/atleta/atleta_get.php?id=${id}`);
  const resposta = await retorno.json();

  const atleta = resposta.data[0];
  form.elements.id.value = atleta.id || "";
  form.elements.nome.value = atleta.nome || "";
  form.elements.data_nascimento.value = atleta.data_nascimento ? String(atleta.data_nascimento).slice(0, 10) : "";
  form.elements.altura.value = atleta.altura || "";
  form.elements.peso.value = atleta.peso || "";
  form.elements.status.value = atleta.status || "ativo";

  await carregarOpcoesSelect({
    selectId: "id_genero",
    url: "../php/genero_get.php",
    placeholder: "Selecione um genero",
    selectedValue: atleta.id_genero || ""
  });

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

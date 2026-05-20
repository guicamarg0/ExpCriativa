document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formEsporteEdicao");
  const id = new URLSearchParams(window.location.search).get("id");

  const retorno = await fetch(`../php/esportes/esportes_get.php?id=${id}`);
  const resposta = await retorno.json();
  const esporte = (resposta.data || [])[0] || {};

  form.elements.id.value = esporte.id || "";
  form.elements.nome.value = esporte.nome || "";
  form.elements.status.value = esporte.status || "ativo";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    await fetch(`../php/esportes/esportes_alterar.php?id=${id}`, {
      method: "POST",
      body: formData
    });

    window.location.href = "esportes.html";
  });
});

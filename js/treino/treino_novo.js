document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formTreinoNovo");
  if (!form) {
    return;
  }

  const idAtleta = new URLSearchParams(window.location.search).get("id_atleta");
  if (!idAtleta) {
    window.location.href = "atletas_treino.html";
    return;
  }

  form.elements.id_atleta.value = idAtleta;
  form.elements.id_treinador.value = "1";

  const retornoAtleta = await fetch(`../php/atleta/atleta_get.php?id=${idAtleta}`);
  const respostaAtleta = await retornoAtleta.json();
  if ((respostaAtleta.data || []).length > 0) {
    form.elements.atleta.value = respostaAtleta.data[0].nome || "";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const retorno = await fetch("../php/treino/treino_novo.php", {
      method: "POST",
      body: formData
    });
    const resposta = await retorno.json();

    if (resposta.status === "ok") {
      window.location.href = `planilha_treino.html?id=${idAtleta}`;
      return;
    }

    alert(`Erro: ${resposta.mensagem || "Não foi possível salvar o treino."}`);
  });
});

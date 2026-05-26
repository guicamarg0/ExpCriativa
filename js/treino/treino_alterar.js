document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formTreinoEdicao");
  if (!form) {
    return;
  }

  const idTreino = new URLSearchParams(window.location.search).get("id");
  if (!idTreino) {
    window.location.href = "atletas_treino.html";
    return;
  }

  const retornoTreino = await fetch(`../php/treino/treino_get.php?id=${idTreino}`);
  const respostaTreino = await retornoTreino.json();
  const treino = (respostaTreino.data || [])[0] || {};

  if (!treino.id) {
    alert(`Erro: ${respostaTreino.mensagem || "Treino não encontrado."}`);
    window.location.href = "atletas_treino.html";
    return;
  }

  form.elements.id.value = treino.id || "";
  form.elements.id_atleta.value = treino.id_atleta || "";
  form.elements.id_treinador.value = treino.id_treinador || "";
  form.elements.modalidade.value = treino.modalidade || "";
  form.elements.data.value = treino.data ? String(treino.data).slice(0, 10) : "";
  form.elements.detalhes.value = treino.detalhes || "";

  const retornoAtleta = await fetch(`../php/atleta/atleta_get.php?id=${treino.id_atleta}`);
  const respostaAtleta = await retornoAtleta.json();
  if ((respostaAtleta.data || []).length > 0) {
    form.elements.atleta.value = respostaAtleta.data[0].nome || "";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const retorno = await fetch(`../php/treino/treino_alterar.php?id=${idTreino}`, {
      method: "POST",
      body: formData
    });
    const resposta = await retorno.json();

    if (resposta.status === "ok") {
      window.location.href = `planilha_treino.html?id=${form.elements.id_atleta.value}`;
      return;
    }

    alert(`Erro: ${resposta.mensagem || "Não foi possível salvar as alterações."}`);
  });
});

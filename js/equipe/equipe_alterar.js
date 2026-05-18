document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formEquipeEdicao");

  const id = new URLSearchParams(window.location.search).get("id");
  const retorno = await fetch(`../php/equipe/equipe_get.php?id=${id}`);
  const resposta = await retorno.json();

  const equipe = resposta.data[0];
  form.elements.id.value = equipe.id || "";
  form.elements.nome.value = equipe.nome || "";
  form.elements.categoria.value = equipe.categoria || "";
  form.elements.descricao.value = equipe.descricao || "";
  form.elements.status.value = equipe.status || "ativa";

  await carregarSelectsEmLote([
    {
      selectId: "id_modalidade",
      url: "../php/esportes/esportes_get.php?simples=1",
      placeholder: "Selecione uma modalidade",
      selectedValue: equipe.id_modalidade || ""
    },
    {
      selectId: "id_genero",
      url: "../php/genero_get.php",
      placeholder: "Selecione um genero",
      selectedValue: equipe.id_genero || ""
    },
    {
      selectId: "id_treinador_responsavel",
      url: "../php/treinador/treinador_get.php?simples=1",
      placeholder: "Selecione um treinador",
      selectedValue: equipe.id_treinador_responsavel || ""
    }
  ]);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    await fetch("../php/equipe/equipe_alterar.php", {
      method: "POST",
      body: formData
    });

    const idsAtletas = formData.get("atletas_ids") || "";
    const vinculoData = new FormData();
    vinculoData.append("id_equipe", String(id));
    vinculoData.append("atletas_ids", String(idsAtletas));
    vinculoData.append("forcar_vinculo", "0");
    await fetch("../php/equipe/equipe_vincular_atletas.php", {
      method: "POST",
      body: vinculoData
    });

    window.location.href = "equipe.html";
  });
});

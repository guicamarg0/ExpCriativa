document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formEquipeNovo");

  await carregarSelectsEmLote([
    {
      selectId: "id_modalidade",
      url: "../php/esportes/esportes_get.php?simples=1",
      placeholder: "Selecione uma modalidade"
    },
    {
      selectId: "id_genero",
      url: "../php/genero_get.php",
      placeholder: "Selecione um genero"
    },
    {
      selectId: "id_treinador_responsavel",
      url: "../php/treinador/treinador_get.php?simples=1",
      placeholder: "Selecione um treinador"
    }
  ]);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    formData.set("status", "ativa");
    const retorno = await fetch("../php/equipe/equipe_novo.php", {
      method: "POST",
      body: formData
    });
    const resposta = await retorno.json();
    const idEquipe = resposta.data.id;
    const idsAtletas = formData.get("atletas_ids") || "";

    const vinculoData = new FormData();
    vinculoData.append("id_equipe", String(idEquipe));
    vinculoData.append("atletas_ids", String(idsAtletas));
    vinculoData.append("forcar_vinculo", "0");
    await fetch("../php/equipe/equipe_vincular_atletas.php", {
      method: "POST",
      body: vinculoData
    });

    window.location.href = "equipe.html";
  });
});

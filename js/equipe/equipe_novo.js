document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formEquipeNovo");
  if (!form) {
    return;
  }

  await popularSelect("id_modalidade", "../php/esportes/esportes_get.php", "Selecione uma modalidade");
  await popularSelect("id_genero", "../php/genero_get.php", "Selecione um genero");
  await popularSelect("id_treinador_responsavel", "../php/treinador/treinador_get.php", "Selecione um treinador");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    formData.set("status", "ativa");

    const retorno = await fetch("../php/equipe/equipe_novo.php", {
      method: "POST",
      body: formData
    });
    const resposta = await retorno.json();
    const idEquipe = resposta?.data?.id;
    const idsAtletas = formData.get("atletas_ids") || "";

    if (idEquipe) {
      const vinculoData = new FormData();
      vinculoData.append("id_equipe", String(idEquipe));
      vinculoData.append("atletas_ids", String(idsAtletas));
      vinculoData.append("forcar_vinculo", "0");
      await fetch("../php/equipe/equipe_vincular_atletas.php", {
        method: "POST",
        body: vinculoData
      });
    }

    window.location.href = "equipe.html";
  });
});

async function popularSelect(selectId, url, placeholder) {
  const select = document.getElementById(selectId);
  if (!select) {
    return;
  }

  select.innerHTML = `<option value="">${placeholder}</option>`;
  const retorno = await fetch(url);
  const resposta = await retorno.json();

  for (let i = 0; i < (resposta.data || []).length; i++) {
    const registro = resposta.data[i];
    const option = document.createElement("option");
    option.value = String(registro.id ?? "");
    option.textContent = String(registro.nome ?? "");
    select.appendChild(option);
  }
}

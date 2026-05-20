document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formEquipeEdicao");
  const id = new URLSearchParams(window.location.search).get("id");

  const retornoEquipe = await fetch(`../php/equipe/equipe_get.php?id=${id}`);
  const respostaEquipe = await retornoEquipe.json();
  const equipe = (respostaEquipe.data || [])[0] || {};

  form.elements.id.value = equipe.id || "";
  form.elements.nome.value = equipe.nome || "";
  form.elements.categoria.value = equipe.categoria || "";
  form.elements.descricao.value = equipe.descricao || "";
  form.elements.status.value = equipe.status || "ativa";

  const selectModalidade = document.getElementById("id_modalidade");
  selectModalidade.innerHTML = '<option value="">Selecione uma modalidade</option>';

  const retornoModalidades = await fetch("../php/esportes/esportes_get.php?simples=1");
  const respostaModalidades = await retornoModalidades.json();
  for (let i = 0; i < (respostaModalidades.data || []).length; i++) {
    const modalidade = respostaModalidades.data[i];
    const option = document.createElement("option");
    option.value = String(modalidade.id ?? "");
    option.textContent = String(modalidade.nome ?? "");
    selectModalidade.appendChild(option);
  }
  selectModalidade.value = String(equipe.id_modalidade || "");

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
  selectGenero.value = String(equipe.id_genero || "");

  const selectTreinador = document.getElementById("id_treinador_responsavel");
  selectTreinador.innerHTML = '<option value="">Selecione um treinador</option>';

  const retornoTreinadores = await fetch("../php/treinador/treinador_get.php?simples=1");
  const respostaTreinadores = await retornoTreinadores.json();
  for (let i = 0; i < (respostaTreinadores.data || []).length; i++) {
    const treinador = respostaTreinadores.data[i];
    const option = document.createElement("option");
    option.value = String(treinador.id ?? "");
    option.textContent = String(treinador.nome ?? "");
    selectTreinador.appendChild(option);
  }
  selectTreinador.value = String(equipe.id_treinador_responsavel || "");

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

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
    alert(`Erro: ${respostaTreino.mensagem || "Treino nao encontrado."}`);
    window.location.href = "atletas_treino.html";
    return;
  }

  form.elements.id.value = treino.id || "";
  form.elements.id_atleta.value = treino.id_atleta || "";
  form.elements.id_treinador.value = treino.id_treinador || "";
  form.elements.data.value = treino.data_inicio ? String(treino.data_inicio).slice(0, 10) : "";
  form.elements.detalhes.value = treino.descricao || "";

  const retornoAtleta = await fetch(`../php/atleta/atleta_get.php?id=${treino.id_atleta}`);
  const respostaAtleta = await retornoAtleta.json();
  if ((respostaAtleta.data || []).length > 0) {
    form.elements.atleta.value = respostaAtleta.data[0].nome || "";
  }

  await carregarModalidades(treino.id_modalidade);
  await carregarExerciciosPorModalidade(getExerciciosSelecionados(treino), await buscarMetricasDoTreino(idTreino));

  document.getElementById("modalidade").addEventListener("change", async () => {
    await carregarExerciciosPorModalidade([], {});
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const selectModalidade = document.getElementById("modalidade");
    const modalidadeTexto =
      selectModalidade.options[selectModalidade.selectedIndex]?.text || "";
    const exerciciosMarcados = Array.from(
      document.querySelectorAll('#lista_exercicios input[name="exercicios_treino"]:checked')
    );

    if (exerciciosMarcados.length === 0) {
      alert("Selecione pelo menos um exercicio para o treino.");
      return;
    }

    const exercicios = [];
    const metricasExercicio = [];
    for (var i = 0; i < exerciciosMarcados.length; i++) {
      var inputExercicio = exerciciosMarcados[i];
      var selectMetrica = document.querySelector(
        `#lista_exercicios select[name="metrica_exercicio"][data-exercicio-id="${inputExercicio.value}"]`
      );

      if (!selectMetrica || !selectMetrica.value) {
        alert("Selecione uma metrica para cada exercicio marcado.");
        return;
      }

      exercicios.push(parseInt(inputExercicio.value));
      metricasExercicio.push(`${inputExercicio.value}:${selectMetrica.value}`);
    }

    const formData = new FormData(form);
    formData.append("modalidade", modalidadeTexto);
    formData.append("exercicios", JSON.stringify(exercicios));
    formData.append("metricas_exercicio", JSON.stringify(metricasExercicio));

    const retorno = await fetch(`../php/treino/treino_alterar.php?id=${idTreino}`, {
      method: "POST",
      body: formData
    });
    const resposta = await retorno.json();

    if (resposta.status === "ok") {
      window.location.href = `planilha_treino.html?id=${form.elements.id_atleta.value}`;
      return;
    }

    alert(`Erro: ${resposta.mensagem || "Nao foi possivel salvar as alteracoes."}`);
  });
});

function getExerciciosSelecionados(treino) {
  if (!treino.exercicio_ids) {
    return [];
  }

  return String(treino.exercicio_ids)
    .split(",")
    .filter((id) => id !== "")
    .map((id) => parseInt(id));
}

async function carregarModalidades(idModalidadeSelecionada) {
  const retorno = await fetch("../php/esportes/esportes_get.php");
  const resposta = await retorno.json();

  if (resposta.status != "ok") {
    return;
  }

  const select = document.getElementById("modalidade");
  select.innerHTML = '<option value="">Selecione uma modalidade</option>';

  for (var i = 0; i < (resposta.data || []).length; i++) {
    var modalidade = resposta.data[i];
    var option = document.createElement("option");
    option.value = modalidade.id;
    option.textContent = modalidade.nome;
    option.selected = String(modalidade.id) === String(idModalidadeSelecionada);
    select.appendChild(option);
  }
}

async function buscarMetricasDoTreino(idTreino) {
  const retorno = await fetch(`../php/treino/treino_exercicio_metricas_get.php?id_treino=${idTreino}`);
  const resposta = await retorno.json();
  const metricasPorExercicio = {};

  if (resposta.status != "ok") {
    return metricasPorExercicio;
  }

  for (var i = 0; i < (resposta.data || []).length; i++) {
    var item = resposta.data[i];
    metricasPorExercicio[item.id_exercicio] = String(item.id_metrica);
  }

  return metricasPorExercicio;
}

async function carregarExerciciosPorModalidade(exerciciosSelecionados, metricasSelecionadas) {
  const modalidadeId = document.getElementById("modalidade").value;
  const container = document.getElementById("lista_exercicios_container");
  const lista = document.getElementById("lista_exercicios");
  lista.innerHTML = "";

  if (!modalidadeId) {
    container.style.display = "none";
    return;
  }

  const retorno = await fetch(`../php/esportes/modalidade_exercicio_metricas_get.php?id=${modalidadeId}`);
  const resposta = await retorno.json();

  if (resposta.status != "ok") {
    container.style.display = "none";
    return;
  }

  container.style.display = "block";
  for (var i = 0; i < resposta.data.length; i++) {
    var exercicio = resposta.data[i];
    var item = document.createElement("div");
    item.className = "exercicio-metricas";
    var exercicioMarcado = exerciciosSelecionados.includes(parseInt(exercicio.id));
    var metricaSelecionada = metricasSelecionadas[exercicio.id] || "";

    var metricasHtml = '<option value="">Selecione uma metrica</option>';
    for (var j = 0; j < (exercicio.metricas || []).length; j++) {
      var metrica = exercicio.metricas[j];
      var selected = String(metrica.id) === String(metricaSelecionada) ? "selected" : "";
      metricasHtml += `
        <option value="${metrica.id}" ${selected}>${metrica.nome}${metrica.unidade_medida ? " (" + metrica.unidade_medida + ")" : ""}</option>
      `;
    }

    item.innerHTML = `
      <label class="form-check">
        <input class="form-check-input" type="checkbox" name="exercicios_treino" value="${exercicio.id}" id="ex_${exercicio.id}" ${exercicioMarcado ? "checked" : ""}>
        <span class="form-check-label">${exercicio.nome}</span>
      </label>
      <div class="metricas-exercicio">
        ${
          (exercicio.metricas || []).length > 0
            ? `<select class="form-control" name="metrica_exercicio" data-exercicio-id="${exercicio.id}">${metricasHtml}</select>`
            : "<p>Nenhuma metrica vinculada a este exercicio.</p>"
        }
      </div>
    `;
    lista.appendChild(item);
  }
}

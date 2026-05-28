document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formTreinoNovo");
  if (!form) {
    return;
  }

  const url = new URLSearchParams(window.location.search);
  const idAtleta = url.get("id_atleta") || url.get("id");

  if (!idAtleta) {
    window.location.href = "atletas_treino.html";
    return;
  }

  form.elements.id_atleta.value = idAtleta;
  const idTreinadorStorage = localStorage.getItem("id_treinador");
  form.elements.id_treinador.value =
    idTreinadorStorage && !Number.isNaN(Number(idTreinadorStorage))
      ? idTreinadorStorage
      : "1";

  const retornoAtleta = await fetch(`../php/atleta/atleta_get.php?id=${idAtleta}`);
  const respostaAtleta = await retornoAtleta.json();
  if ((respostaAtleta.data || []).length > 0) {
    form.elements.atleta.value = respostaAtleta.data[0].nome || "";
  }

  await carregarModalidades();

  document
    .getElementById("modalidade")
    .addEventListener("change", carregarExerciciosPorModalidade);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validarTreino(form)) {
      return;
    }

    const selectModalidade = document.getElementById("modalidade");
    const modalidadeTexto =
      selectModalidade.options[selectModalidade.selectedIndex]?.text || "";
    const exerciciosMarcados = Array.from(
      document.querySelectorAll('#lista_exercicios input[name="exercicios_treino"]:checked')
    );

    if (exerciciosMarcados.length === 0) {
      mostrarToast("Selecione pelo menos um exercicio para o treino.", "aviso");
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
        mostrarToast("Selecione uma metrica para cada exercicio marcado.", "aviso");
        return;
      }

      exercicios.push(parseInt(inputExercicio.value));
      metricasExercicio.push(`${inputExercicio.value}:${selectMetrica.value}`);
    }

    const formData = new FormData(form);
    formData.append("modalidade", modalidadeTexto);
    formData.append("exercicios", JSON.stringify(exercicios));
    formData.append("metricas_exercicio", JSON.stringify(metricasExercicio));

    const retorno = await fetch("../php/treino/treino_novo.php", {
      method: "POST",
      body: formData
    });
    const resposta = await retorno.json();

    if (resposta.status === "ok") {
      window.location.href = `planilha_treino.html?id=${idAtleta}`;
      return;
    }

    mostrarToast(`Erro: ${resposta.mensagem || "Nao foi possivel salvar o treino."}`, "erro");
  });
});

function validarTreino(form) {
  const campos = form.querySelectorAll("[required]");

  for (let i = 0; i < campos.length; i++) {
    const campo = campos[i];
    campo.classList.remove("campo-invalido");

    if (!String(campo.value || "").trim()) {
      campo.classList.add("campo-invalido");
      campo.focus();
      mostrarToast("Preencha todos os campos obrigatorios.", "aviso");
      return false;
    }
  }

  return true;
}

async function carregarModalidades() {
  const retorno = await fetch("../php/esportes/esportes_get.php");
  const resposta = await retorno.json();

  if (resposta.status != "ok") {
    return;
  }

  const select = document.getElementById("modalidade");
  for (var i = 0; i < (resposta.data || []).length; i++) {
    var modalidade = resposta.data[i];
    var option = document.createElement("option");
    option.value = modalidade.id;
    option.textContent = modalidade.nome;
    select.appendChild(option);
  }
}

async function carregarExerciciosPorModalidade() {
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

    var metricasHtml = '<option value="">Selecione uma metrica</option>';
    for (var j = 0; j < (exercicio.metricas || []).length; j++) {
      var metrica = exercicio.metricas[j];
      metricasHtml += `
        <option value="${metrica.id}">${metrica.nome}${metrica.unidade_medida ? " (" + metrica.unidade_medida + ")" : ""}</option>
      `;
    }

    item.innerHTML = `
      <label class="form-check">
        <input class="form-check-input" type="checkbox" name="exercicios_treino" value="${exercicio.id}" id="ex_${exercicio.id}" checked>
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

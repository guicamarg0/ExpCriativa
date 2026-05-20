document.addEventListener("DOMContentLoaded", () => {
  const url = new URLSearchParams(window.location.search);
  const id = url.get("id");
  carregarModalidades().then(() => buscar(id));
  document
    .getElementById("modalidade")
    .addEventListener("change", () => carregarExerciciosPorModalidade());
  document.getElementById("enviar").addEventListener("click", () => {
    alterar();
  });
});

async function carregarModalidades() {
  const retorno = await fetch("../php/esportes/esportes_get.php");
  const resposta = await retorno.json();
  const select = document.getElementById("modalidade");
  select.innerHTML = '<option value="">Selecione uma modalidade</option>';
  if (resposta.status == "ok") {
    resposta.data.forEach((modalidade) => {
      const option = document.createElement("option");
      option.value = modalidade.id;
      option.textContent = modalidade.nome;
      select.appendChild(option);
    });
  }
}

async function buscar(id) {
  const retorno = await fetch("../php/treino/treino_get.php?id=" + id);
  const resposta = await retorno.json();
  if (resposta.status == "ok") {
    var registro = resposta.data[0];
    document.getElementById("id").value = id;
    document.getElementById("id_atleta").value = registro.id_atleta;
    document.getElementById("data").value = registro.data;
    document.getElementById("detalhes").value = registro.detalhes;

    const select = document.getElementById("modalidade");
    const option = Array.from(select.options).find(
      (o) => o.textContent === registro.modalidade,
    );
    if (option) {
      select.value = option.value;
    } else {
      const fallback = new Option(registro.modalidade, "", true, true);
      select.appendChild(fallback);
      select.value = "";
    }

    const selectedIds = registro.exercicio_ids
      ? registro.exercicio_ids.split(",").map((id) => parseInt(id, 10))
      : [];

    await carregarExerciciosPorModalidade(selectedIds);

    const retornoAtleta = await fetch(
      "../php/atleta/atleta_get.php?id=" + registro.id_atleta,
    );
    const respostaAtleta = await retornoAtleta.json();
    if (respostaAtleta.status == "ok") {
      document.getElementById("atleta").value = respostaAtleta.data[0].nome;
    }
  } else {
    alert("ERRO:" + resposta.mensagem);
    window.location.href = "../treino/atletas_treino.html";
  }
}

async function carregarExerciciosPorModalidade(preSelected = []) {
  const select = document.getElementById("modalidade");
  const modalidadeId = select.value;
  const container = document.getElementById("lista_exercicios_container");
  const lista = document.getElementById("lista_exercicios");
  lista.innerHTML = "";

  if (!modalidadeId) {
    container.style.display = "none";
    return;
  }

  const retorno = await fetch(
    `../php/esportes/modalidade_exercicios_get.php?id=${modalidadeId}`,
  );
  const resposta = await retorno.json();
  if (resposta.status == "ok") {
    container.style.display = "block";
    resposta.data.forEach((exercicio) => {
      const isChecked = preSelected.includes(exercicio.id);
      const item = document.createElement("div");
      item.className = "form-check mb-2";
      item.innerHTML = `
                <input class="form-check-input" type="checkbox" value="${exercicio.id}" id="ex_${exercicio.id}" ${isChecked ? "checked" : ""}>
                <label class="form-check-label" for="ex_${exercicio.id}">${exercicio.nome}</label>
            `;
      lista.appendChild(item);
    });
  } else {
    container.style.display = "none";
  }
}

document.getElementById("enviar").addEventListener("click", () => {
  alterar();
});

async function alterar() {
  var id = document.getElementById("id").value;
  var id_atleta = document.getElementById("id_atleta").value;
  var selectModalidade = document.getElementById("modalidade");
  var modalidade =
    selectModalidade.options[selectModalidade.selectedIndex]?.text || "";
  var modalidadeId = selectModalidade.value;
  var data = document.getElementById("data").value;
  var detalhes = document.getElementById("detalhes").value;

  const checked = Array.from(
    document.querySelectorAll("#lista_exercicios input[type=checkbox]:checked"),
  ).map((input) => parseInt(input.value));

  const fd = new FormData();
  fd.append("modalidade", modalidade);
  fd.append("modalidade_id", modalidadeId);
  fd.append("data", data);
  fd.append("detalhes", detalhes);
  fd.append("exercicios", JSON.stringify(checked));

  const retorno = await fetch("../php/treino/treino_alterar.php?id=" + id, {
    method: "POST",
    body: fd,
  });

  const resposta = await retorno.json();
  if (resposta.status == "ok") {
    window.location.href = `../treino/planilha_treino.html?id=${id_atleta}`;
  } else {
    alert("Erro... " + resposta.mensagem);
  }
}

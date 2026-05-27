//parte 1
document.addEventListener("DOMContentLoaded", async () => {
  // pega a URL e armazena em um const
  // busca nessa URL a variável id e armazana no const id.
  const url = new URLSearchParams(window.location.search);
  const id_atleta = url.get("id_atleta");
  document.getElementById("id_atleta").value = id_atleta;

  const retorno = await fetch("../php/atleta/atleta_get.php?id=" + id_atleta);
  const resposta = await retorno.json();
  if (resposta.status == "ok") {
    document.getElementById("atleta").value = resposta.data[0].nome;
  }

  //const id_treinador = localStorage.getItem("id_treinador");
  const id_treinador = 1; // Forçando para testar o banco
  document.getElementById("id_treinador").value = id_treinador;

  carregarModalidades();
  document
    .getElementById("modalidade")
    .addEventListener("change", carregarExerciciosPorModalidade);

  document.getElementById("enviar").addEventListener("click", () => {
    enviar();
  });
});

async function carregarModalidades() {
  const retorno = await fetch("../php/esportes/esportes_get.php");
  const resposta = await retorno.json();
  if (resposta.status == "ok") {
    const select = document.getElementById("modalidade");
    resposta.data.forEach((modalidade) => {
      const option = document.createElement("option");
      option.value = modalidade.id;
      option.textContent = modalidade.nome;
      select.appendChild(option);
    });
  }
}

async function carregarExerciciosPorModalidade() {
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
      const item = document.createElement("div");
      item.className = "form-check mb-2";
      item.innerHTML = `
        <input class="form-check-input" type="checkbox" value="${exercicio.id}" id="ex_${exercicio.id}" checked>
        <label class="form-check-label" for="ex_${exercicio.id}">${exercicio.nome}</label>
      `;
      lista.appendChild(item);
    });
  } else {
    container.style.display = "none";
  }
}

document.getElementById("logoff").addEventListener("click", () => {
  logoff();
});

async function logoff() {
  const retorno = await fetch("../php/usuario_logoff.php");
  const resposta = await retorno.json();
  if (resposta.status == "ok") {
    window.location.href = "../login/";
  }
}
//parte 2

async function enviar() {
  var id_atleta = document.getElementById("id_atleta").value;
  var id_treinador = document.getElementById("id_treinador").value;
  var selectModalidade = document.getElementById("modalidade");
  var modalidade =
    selectModalidade.options[selectModalidade.selectedIndex].text;
  var modalidadeId = selectModalidade.value;
  var data = document.getElementById("data").value;
  var detalhes = document.getElementById("detalhes").value;

  const checked = Array.from(
    document.querySelectorAll("#lista_exercicios input[type=checkbox]:checked"),
  ).map((input) => parseInt(input.value));

  const fd = new FormData();
  fd.append("id_atleta", id_atleta);
  fd.append("id_treinador", id_treinador);
  fd.append("modalidade", modalidade);
  fd.append("modalidade_id", modalidadeId);
  fd.append("data", data);
  fd.append("detalhes", detalhes);
  fd.append("exercicios", JSON.stringify(checked));

  const retorno = await fetch("../php/treino/treino_novo.php", {
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

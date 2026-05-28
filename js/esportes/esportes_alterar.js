// Fase 1
// a) PEGA o ID da URL
// b) Requisita o BACKEND por GET
// c) Preenche o formulario com os dados do BACKEND
// ----------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  const url = new URLSearchParams(window.location.search);
  const id = url.get("id");

  if (!id) {
    alert("ID da modalidade nao informado.");
    window.location.href = "../esportes/esportes.html";
    return;
  }

  await buscar(id);

  const form = document.getElementById("formEsporteEdicao");
  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await alterar();
    });
  }
});

async function buscar(id) {
  const retorno = await fetch("../php/esportes/esportes_get.php?id=" + id);
  const resposta = await retorno.json();

  if (resposta.status == "ok") {
    var registro = resposta.data[0];
    document.getElementById("nome").value = registro.nome;
    document.getElementById("status").value = registro.status;
    document.getElementById("id").value = id;
    await carregarExercicios(id);
  } else {
    alert("ERRO:" + resposta.mensagem);
    window.location.href = "../esportes/esportes.html";
  }
}

async function carregarExercicios(id) {
  const textarea = document.getElementById("exercicios");
  if (!textarea) {
    return;
  }

  const retorno = await fetch(`../php/esportes/modalidade_exercicios_get.php?id=${id}`);
  const resposta = await retorno.json();

  if (resposta.status == "ok") {
    const nomes = resposta.data.map((item) => item.nome);
    textarea.value = nomes.join("\n");
  } else {
    textarea.value = "";
  }
}

async function alterar() {
  var nome = document.getElementById("nome").value;
  var status = document.getElementById("status").value;
  var id = document.getElementById("id").value;
  var exercicios = document.getElementById("exercicios").value;

  const fd = new FormData();
  fd.append("nome", nome);
  fd.append("status", status);
  fd.append("exercicios", exercicios);

  const retorno = await fetch("../php/esportes/esportes_alterar.php?id=" + id, {
    method: "POST",
    body: fd,
  });
  const resposta = await retorno.json();
  if (resposta.status == "ok") {
    alert("SUCESSO: " + resposta.mensagem);
    window.location.href = "../esportes/esportes.html";
  } else {
    alert("Erro... " + resposta.mensagem);
  }
}

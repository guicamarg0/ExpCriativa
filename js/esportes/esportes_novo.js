document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formEsporteNovo");
  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await novo();
  });
});

async function novo() {
  var nome = document.getElementById("nome").value;
  var status = document.getElementById("status").value;
  var exercicios = document.getElementById("exercicios").value;

  const fd = new FormData();
  fd.append("nome", nome);
  fd.append("status", status);
  fd.append("exercicios", exercicios);

  const retorno = await fetch("../php/esportes/esportes_novo.php", {
    method: "POST",
    body: fd,
  });
  const resposta = await retorno.json();
  if (resposta.status == "ok") {
    alert("Sucesso! " + resposta.mensagem);
    window.location.href = "../esportes/esportes.html";
  } else {
    alert("Erro... " + resposta.mensagem);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formEsporteNovo");
  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validarEsporte(form)) {
      return;
    }
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
    mostrarToast("Sucesso: " + resposta.mensagem, "sucesso", { duracao: 1200 });
    window.setTimeout(() => {
      window.location.href = "../esportes/esportes.html";
    }, 700);
  } else {
    mostrarToast("Erro: " + resposta.mensagem, "erro");
  }
}

function validarEsporte(form) {
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

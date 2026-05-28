document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formAtletaEdicao");
  const id = new URLSearchParams(window.location.search).get("id");

  const retornoAtleta = await fetch(`../php/atleta/atleta_get.php?id=${id}`);
  const respostaAtleta = await retornoAtleta.json();
  const atleta = (respostaAtleta.data || [])[0] || {};

  form.elements.id.value = atleta.id || "";
  form.elements.nome.value = atleta.nome || "";
  form.elements.data_nascimento.value = atleta.data_nascimento ? String(atleta.data_nascimento).slice(0, 10) : "";
  form.elements.altura.value = atleta.altura || "";
  form.elements.peso.value = atleta.peso || "";
  form.elements.status.value = atleta.status || "ativo";

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

  selectGenero.value = String(atleta.id_genero || "");
  aplicarMascarasAtleta(form);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validarAtleta(form)) {
      return;
    }

    form.elements.altura.value = form.elements.altura.value.replace(",", ".");
    form.elements.peso.value = form.elements.peso.value.replace(",", ".");

    const formData = new FormData(form);

    await fetch("../php/atleta/atleta_alterar.php", {
      method: "POST",
      body: formData
    });

    window.location.href = "atleta.html";
  });
});

function aplicarMascarasAtleta(form) {
  const altura = form.elements.altura;
  const peso = form.elements.peso;

  if (altura) {
    altura.value = String(altura.value || "").replace(".", ",");
    altura.addEventListener("input", () => {
      altura.value = mascararDecimal(altura.value, 2);
    });
  }

  if (peso) {
    peso.value = String(peso.value || "").replace(".", ",");
    peso.addEventListener("input", () => {
      peso.value = mascararDecimal(peso.value, 2);
    });
  }
}

function mascararDecimal(valor, casas) {
  let limpo = String(valor || "").replace(".", ",").replace(/[^0-9,]/g, "");
  const partes = limpo.split(",");
  const inteiro = partes[0] || "";
  const decimal = partes.slice(1).join("").slice(0, casas);
  return partes.length > 1 ? `${inteiro},${decimal}` : inteiro;
}

function validarAtleta(form) {
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

  const dataNascimento = form.elements.data_nascimento;
  if (dataNascimento && dataNascimento.value && dataEhFutura(dataNascimento.value)) {
    dataNascimento.classList.add("campo-invalido");
    dataNascimento.focus();
    mostrarToast("A data de nascimento nao pode ser futura.", "aviso");
    return false;
  }

  return true;
}

function dataEhFutura(valor) {
  const dataInformada = new Date(`${valor}T00:00:00`);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return dataInformada > hoje;
}

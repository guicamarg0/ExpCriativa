document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formAtletaNovo");
  if (!form) {
    return;
  }

  await popularSelect("id_genero", "../php/genero_get.php", "Selecione um genero");
  aplicarMascarasAtleta(form);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validarAtleta(form)) {
      return;
    }

    form.elements.altura.value = form.elements.altura.value.replace(",", ".");
    form.elements.peso.value = form.elements.peso.value.replace(",", ".");

    const formData = new FormData(form);
    await fetch("../php/atleta/atleta_novo.php", {
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
    altura.addEventListener("input", () => {
      altura.value = mascararDecimal(altura.value, 2);
    });
  }

  if (peso) {
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

    if (campo.type === "email" && !campo.checkValidity()) {
      campo.classList.add("campo-invalido");
      campo.focus();
      mostrarToast("Informe um e-mail valido.", "aviso");
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

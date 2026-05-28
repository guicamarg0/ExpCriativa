document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formTreinadorNovo");
  if (!form) {
    return;
  }

  if (form.elements.data_inicio) {
    form.elements.data_inicio.required = true;
  }
  aplicarMascarasTreinador(form);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validarTreinador(form)) {
      return;
    }

    const formData = new FormData(form);
    await fetch("../php/treinador/treinador_novo.php", {
      method: "POST",
      body: formData
    });

    window.location.href = "treinador.html";
  });
});

function aplicarMascarasTreinador(form) {
  const telefone = form.elements.telefone;
  const cref = form.elements.cref;

  if (telefone) {
    telefone.addEventListener("input", () => {
      telefone.value = mascararTelefone(telefone.value);
    });
  }

  if (cref) {
    cref.addEventListener("input", () => {
      cref.value = mascararCref(cref.value);
    });
  }
}

function mascararTelefone(valor) {
  const numeros = String(valor || "").replace(/\D/g, "").slice(0, 11);

  if (numeros.length <= 2) {
    return numeros;
  }

  if (numeros.length <= 6) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  }

  if (numeros.length <= 10) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
  }

  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
}

function mascararCref(valor) {
  const limpo = String(valor || "").toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 9);
  const numeros = limpo.slice(0, 6).replace(/\D/g, "");
  const categoria = limpo.slice(6, 7).replace(/[^A-Z]/g, "");
  const uf = limpo.slice(7, 9).replace(/[^A-Z]/g, "");

  if (!categoria) {
    return numeros;
  }

  return `${numeros}-${categoria}${uf ? "/" + uf : ""}`;
}

function validarTreinador(form) {
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

  if (form.elements.telefone.value.replace(/\D/g, "").length < 10) {
    form.elements.telefone.classList.add("campo-invalido");
    form.elements.telefone.focus();
    mostrarToast("Informe um telefone valido.", "aviso");
    return false;
  }

  if (!/^\d{6}-[A-Z]\/[A-Z]{2}$/.test(form.elements.cref.value)) {
    form.elements.cref.classList.add("campo-invalido");
    form.elements.cref.focus();
    mostrarToast("Informe o CREF no formato 123456-G/PR.", "aviso");
    return false;
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

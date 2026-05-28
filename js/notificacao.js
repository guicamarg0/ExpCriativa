(function () {
  const tipos = {
    sucesso: "sucesso",
    success: "sucesso",
    erro: "erro",
    error: "erro",
    aviso: "aviso",
    warning: "aviso",
    info: "info"
  };

  function obterContainer() {
    let container = document.getElementById("toast-container");

    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.setAttribute("aria-live", "polite");
      container.setAttribute("aria-atomic", "true");
      document.body.appendChild(container);
    }

    return container;
  }

  function mostrarToast(mensagem, tipo = "info", opcoes = {}) {
    const container = obterContainer();
    const tipoNormalizado = tipos[tipo] || "info";
    const duracao = Number(opcoes.duracao || 3500);

    const toast = document.createElement("div");
    toast.className = `mitra-toast mitra-toast-${tipoNormalizado}`;
    toast.setAttribute("role", tipoNormalizado === "erro" ? "alert" : "status");

    const conteudo = document.createElement("span");
    conteudo.className = "mitra-toast-mensagem";
    conteudo.textContent = mensagem || "";

    const fechar = document.createElement("button");
    fechar.type = "button";
    fechar.className = "mitra-toast-fechar";
    fechar.setAttribute("aria-label", "Fechar aviso");
    fechar.textContent = "x";

    toast.appendChild(conteudo);
    toast.appendChild(fechar);
    container.appendChild(toast);

    const remover = () => {
      toast.classList.add("saindo");
      window.setTimeout(() => toast.remove(), 220);
    };

    fechar.addEventListener("click", remover);
    window.setTimeout(remover, duracao);

    return toast;
  }

  window.mostrarToast = mostrarToast;
  window.mitraToast = {
    show: mostrarToast,
    info: (mensagem, opcoes) => mostrarToast(mensagem, "info", opcoes),
    success: (mensagem, opcoes) => mostrarToast(mensagem, "sucesso", opcoes),
    warning: (mensagem, opcoes) => mostrarToast(mensagem, "aviso", opcoes),
    error: (mensagem, opcoes) => mostrarToast(mensagem, "erro", opcoes)
  };

  window.confirmarModal = async function () {
    return true;
  };
})();

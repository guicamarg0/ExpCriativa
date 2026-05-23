function obterNomeUsuario() {
  const nomeSessao = window.mitraSessao?.perfil?.nome || window.mitraSessao?.usuario?.nome;
  if (nomeSessao) {
    return nomeSessao;
  }

  try {
    const usuario = JSON.parse(localStorage.getItem("mitraUsuario") || "{}");
    return usuario.nome || "";
  } catch (error) {
    return "";
  }
}

function renderizarHome() {
  const titulo = document.getElementById("tituloBoasVindas");
  const painel = document.getElementById("painelHome");
  const tipo = document.getElementById("tipoUsuarioHome");

  if (!titulo) {
    return;
  }

  const nome = obterNomeUsuario();
  titulo.textContent = nome ? `Bem-vindo, ${nome}` : "Bem-vindo ao Mitra";

  if (tipo) {
    tipo.textContent = "";
  }

  if (painel) {
    painel.innerHTML = "";
  }
}

document.addEventListener("mitra:sessao", () => {
  renderizarHome();
});

document.addEventListener("DOMContentLoaded", () => {
  renderizarHome();
});

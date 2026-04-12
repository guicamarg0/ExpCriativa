// Validação de nível de acesso: só permite admin (id_nivel == 1)
const chaveSessao = localStorage.getItem("mitraSessionKey") || "";

if (!chaveSessao) {
  window.location.href = "../login/index.html";
}

fetch("../php/valida_sessao.php", {
  cache: "no-store",
  headers: {
    "X-Session-Key": chaveSessao,
  },
})
  .then((response) => response.json())
  .then((data) => {
    if (data.status !== "ok") {
      alert("Você precisa estar logado para acessar esta página.");
      window.location.href = "../login/index.html";
      return;
    }
    if (data.id_nivel != "1") {
      alert("Acesso restrito!");
      window.location.href = "../home/home.html";
    }
  })
  .catch((error) => {
    alert("Erro ao validar sessão.");
    window.location.href = "../login/index.html";
  });

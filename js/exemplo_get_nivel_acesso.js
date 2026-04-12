// Validação de nível de acesso: só permite admin (id_nivel == 1)
fetch("../php/valida_sessao.php")
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

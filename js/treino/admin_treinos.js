document.addEventListener("mitra:sessao", (e) => {
  const sessao = e.detail;

  if (sessao.id_nivel != 1) {
    alert("Acesso restrito ao administrador.");
    window.location.href = "../home/home.html";
    return;
  }

  buscarTodos();

  document.getElementById("logoff").addEventListener("click", async () => {
    await fetch("../php/usuario_logoff.php");
    localStorage.removeItem("mitraSessionKey");
    localStorage.removeItem("mitraUsuario");
    window.location.href = "../login/index.html";
  });
});
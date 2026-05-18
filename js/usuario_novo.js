document.addEventListener("DOMContentLoaded", () => {
  const botao = document.getElementById("enviar");

  botao.addEventListener("click", async () => {
    const fd = new FormData();
    fd.append("nome", document.getElementById("nome")?.value || "");
    fd.append("usuario", document.getElementById("usuario")?.value || "");
    fd.append("senha", document.getElementById("senha")?.value || "");
    fd.append("email", document.getElementById("email")?.value || "");
    fd.append("instagram", document.getElementById("instagram")?.value || "");
    fd.append("ativo", document.getElementById("ativo")?.value || "");

    await fetch("../php/usuario_novo.php", {
      method: "POST",
      body: fd
    });

    window.location.href = "../exemplo/";
  });
});

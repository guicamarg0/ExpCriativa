document.addEventListener("DOMContentLoaded", async () => {
  const url = new URLSearchParams(window.location.search);
  const id = url.get("id");

  const retorno = await fetch(`../php/usuario_get.php?id=${id}`);
  const resposta = await retorno.json();

  const registro = resposta.data[0];
  document.getElementById("nome").value = registro.nome || "";
  document.getElementById("usuario").value = registro.usuario || "";
  document.getElementById("email").value = registro.email || "";
  document.getElementById("senha").value = registro.senha || "";
  document.getElementById("ativo").value = registro.ativo || "";
  document.getElementById("id").value = id;

  const botao = document.getElementById("enviar");

  botao.addEventListener("click", async () => {
    const fd = new FormData();
    fd.append("nome", document.getElementById("nome")?.value || "");
    fd.append("usuario", document.getElementById("usuario")?.value || "");
    fd.append("senha", document.getElementById("senha")?.value || "");
    fd.append("email", document.getElementById("email")?.value || "");
    fd.append("ativo", document.getElementById("ativo")?.value || "");

    await fetch(`../php/usuario_alterar.php?id=${id}`, {
      method: "POST",
      body: fd
    });

    window.location.href = "../exemplo/";
  });
});

document.addEventListener("DOMContentLoaded", async () => {
  const id = new URLSearchParams(window.location.search).get("id");

  const campoNome = document.getElementById("nome");
  const campoUsuario = document.getElementById("usuario");
  const campoEmail = document.getElementById("email");
  const campoSenha = document.getElementById("senha");
  const campoAtivo = document.getElementById("ativo");
  const campoId = document.getElementById("id");
  const botao = document.getElementById("enviar");

  const retorno = await fetch(`../php/usuario_get.php?id=${id}`);
  const resposta = await retorno.json();
  const registro = (resposta.data || [])[0] || {};

  campoNome.value = registro.nome || "";
  campoUsuario.value = registro.usuario || "";
  campoEmail.value = registro.email || "";
  campoSenha.value = registro.senha || "";
  campoAtivo.value = registro.ativo || "";
  campoId.value = id || "";

  botao.addEventListener("click", async () => {
    const formData = new FormData();
    formData.append("nome", campoNome.value || "");
    formData.append("usuario", campoUsuario.value || "");
    formData.append("senha", campoSenha.value || "");
    formData.append("email", campoEmail.value || "");
    formData.append("ativo", campoAtivo.value || "");

    await fetch(`../php/usuario_alterar.php?id=${id}`, {
      method: "POST",
      body: formData
    });

    window.location.href = "../exemplo/";
  });
});

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formTreinadorEdicao");
  if (!form) {
    return;
  }

  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) {
    window.location.href = "treinador.html";
    return;
  }

  const retornoTreinador = await fetch(`../php/treinador/treinador_get.php?id=${id}`);
  const respostaTreinador = await retornoTreinador.json();
  const treinador = (respostaTreinador.data || [])[0] || {};

  if (!treinador.id) {
    window.location.href = "treinador.html";
    return;
  }

  form.elements.id.value = treinador.id || "";
  form.elements.nome.value = treinador.nome || "";
  form.elements.data_nascimento.value = treinador.data_nascimento
    ? String(treinador.data_nascimento).slice(0, 10)
    : "";
  form.elements.telefone.value = treinador.telefone || "";
  form.elements.cref.value = treinador.cref || "";
  form.elements.data_inicio.value = treinador.data_inicio
    ? String(treinador.data_inicio).slice(0, 10)
    : "";
  form.elements.status.value = treinador.status || "ativo";

  if (treinador.id_usuario) {
    const retornoUsuario = await fetch(`../php/usuario_get.php?id=${treinador.id_usuario}`);
    const respostaUsuario = await retornoUsuario.json();
    const usuario = (respostaUsuario.data || [])[0] || {};

    form.elements.email.value = usuario.email || "";
    form.elements.senha.value = usuario.senha || "";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    await fetch("../php/treinador/treinador_alterar.php", {
      method: "POST",
      body: formData
    });

    window.location.href = "treinador.html";
  });
});

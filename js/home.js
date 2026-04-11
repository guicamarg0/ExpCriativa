// home.js - Exibe o nome do usuário logado na tela home
fetch("../php/valida_sessao.php")
  .then((response) => response.json())
  .then((data) => {
    if (data.status === "ok" && data.data && data.data[0]) {
      const usuario = data.data[0];
      const nome =
        usuario.nome && usuario.nome.trim()
          ? usuario.nome.trim()
          : usuario.email || "Usuário";
      const h1 = document.querySelector(".conteudo h1");
      if (h1) {
        h1.textContent = `Bem-vindo, ${nome}`;
      }
    }
  });

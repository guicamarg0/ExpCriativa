document.getElementById("entrar").addEventListener("click", () => {
  login();
});

async function login() {
  //Pega os valores
  var email_input = document.getElementById("email").value;
  var senha_input = document.getElementById("senha").value;

  // Limpa os espaços em branco 
  var email_limpo = email_input.trim();
  var senha_limpa = senha_input.trim();

  //Prepara o FormData com os valores limpos
  const fd = new FormData();
  fd.append("email", email_limpo);
  fd.append("senha", senha_limpa);

  const retorno = await fetch("../php/usuario_login.php", {
    method: "POST",
    body: fd,
  });

  const resposta = await retorno.json();
  if (resposta.status == "ok") {
    localStorage.setItem("id_usuario", resposta.data[0].id);
    localStorage.setItem("id_treinador", resposta.data[0].id_treinador);
    alert("Login Efetuado com Sucesso");
    window.location.href = "../home/home.html";
  } else {
    alert("Credenciais inválidas");
  }
}

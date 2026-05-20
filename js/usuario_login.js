const STORAGE_SESSION_KEY = "mitraSessionKey";
const STORAGE_USER_KEY = "mitraUsuario";

const formLogin = document.getElementById("formLogin");

if (formLogin) {
  formLogin.addEventListener("submit", (event) => {
    event.preventDefault();
    login();
  });
}

function limparStorageLogin() {
  localStorage.removeItem(STORAGE_SESSION_KEY);
  localStorage.removeItem(STORAGE_USER_KEY);
}

async function login() {
<<<<<<< HEAD
  const email = document.getElementById("email")?.value || "";
  const senha = document.getElementById("senha")?.value || "";

  if (!email || !senha) {
    alert("Informe e-mail e senha.");
    return;
  }

=======
  //Pega os valores
  var email_input = document.getElementById("email").value;
  var senha_input = document.getElementById("senha").value;

  // Limpa os espaços em branco 
  var email_limpo = email_input.trim();
  var senha_limpa = senha_input.trim();

  //Prepara o FormData com os valores limpos
>>>>>>> modalidade-esportes
  const fd = new FormData();
  fd.append("email", email);
  fd.append("senha", senha);

  try {
    const retorno = await fetch("../php/usuario_login.php", {
      method: "POST",
      body: fd,
      cache: "no-store",
    });

<<<<<<< HEAD
    const resposta = await retorno.json();
    if (resposta.status === "ok" && resposta.session_key) {
      localStorage.setItem(STORAGE_SESSION_KEY, resposta.session_key);
      if (resposta.usuario) {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(resposta.usuario));
      } else {
        localStorage.removeItem(STORAGE_USER_KEY);
      }

      window.location.replace("../home/home.html");
      return;
    }

    limparStorageLogin();
    alert(resposta.mensagem || "Credenciais inválidas.");
  } catch (erro) {
    limparStorageLogin();
    alert("Erro ao realizar login.");
    console.error(erro);
=======
  const resposta = await retorno.json();
  if (resposta.status == "ok") {
    localStorage.setItem("id_usuario", resposta.data[0].id);
    localStorage.setItem("id_treinador", resposta.data[0].id_treinador);
    alert("Login Efetuado com Sucesso");
    window.location.href = "../home/home.html";
  } else {
    alert("Credenciais inválidas");
>>>>>>> modalidade-esportes
  }
}

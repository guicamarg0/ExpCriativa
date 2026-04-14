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
  const email = document.getElementById("email")?.value || "";
  const senha = document.getElementById("senha")?.value || "";

  if (!email || !senha) {
    alert("Informe e-mail e senha.");
    return;
  }

  const fd = new FormData();
  fd.append("email", email);
  fd.append("senha", senha);

  try {
    const retorno = await fetch("../php/usuario_login.php", {
      method: "POST",
      body: fd,
      cache: "no-store",
    });

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
  }
}

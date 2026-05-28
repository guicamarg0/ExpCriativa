const STORAGE_SESSION_KEY = "mitraSessionKey";
const STORAGE_USER_KEY = "mitraUsuario";

const formLogin = document.getElementById("formLogin");

if (formLogin) {
  formLogin.addEventListener("submit", async (event) => {
    event.preventDefault();
    await login();
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
    mostrarToast("Informe e-mail e senha.", "aviso");
    return;
  }

  const fd = new FormData();
  fd.append("email", email);
  fd.append("senha", senha);

  try {
    const retorno = await fetch("../php/usuario_login.php", {
      method: "POST",
      body: fd,
      cache: "no-store"
    });

    const resposta = await retorno.json();
    if (resposta.status == "ok") {
      localStorage.setItem("id_usuario", resposta.data[0].id);
      if (resposta.data[0].id_treinador) {
        localStorage.setItem("id_treinador", resposta.data[0].id_treinador);
      } else {
        localStorage.removeItem("id_treinador");
      }
      mostrarToast("Login efetuado com sucesso.", "sucesso", { duracao: 1200 });
      window.setTimeout(() => {
        window.location.href = "../home/home.html";
      }, 700);
    } else {
      mostrarToast("Credenciais invalidas.", "erro");
    }
  }

  catch (error) {
    console.error(error);
  }
}

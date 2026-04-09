
const nivelAcesso = localStorage.getItem("nivel_acesso");

if (!nivelAcesso) {
    alert("Você precisa estar logado para acessar esta página.");
    window.location.href = "../../login/index_login.html";
}

// Exemplo: só permite acesso para nível 1 (admin)
if (nivelAcesso != "1") {
    alert("Acesso restrito!");
    window.location.href = "../../home/home.html";
}
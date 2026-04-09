document.getElementById("entrar").addEventListener("click", () => {
    login();
})

async function login() {
    // 1. Pega os valores
    var email_input = document.getElementById("email").value;
    var senha_input = document.getElementById("senha").value;

    // 2. *** A CORREÇÃO ESTÁ AQUI: Limpa os espaços em branco ***
    var email_limpo = email_input.trim();
    var senha_limpa = senha_input.trim();

    // 3. Prepara o FormData com os valores limpos
    const fd = new FormData();
    fd.append("email", email_limpo);
    fd.append("senha", senha_limpa);

    const retorno = await fetch ("../php/cliente_login.php",{
            method: "POST",
            body: fd
        }
    );
    
    // O resto do seu código está perfeito
    const resposta = await retorno.json();
    if(resposta.status == "ok"){
        alert("Login Efetuado com Sucesso")
        window.location.href = "../home/home.html";
    } else {
        alert("Credenciais inválidas.");
    }
}
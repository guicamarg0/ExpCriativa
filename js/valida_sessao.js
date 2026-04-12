<<<<<<< HEAD
async function valida_sessao(){
    const retorno = await fetch("../php/valida_sessao.php");
    const resposta = await retorno.json();
    if(resposta.status == "nok"){
        window.location.href = '../login/index.html';
    }
}
=======
// valida_sessao.js - Redireciona para login se não houver sessão válida
(function () {
  // Caminho relativo para o PHP, ajusta automaticamente para subpastas
  let phpPath = "php/valida_sessao.php";
  const path = window.location.pathname;
  if (path.includes("/home/")) phpPath = "../php/valida_sessao.php";
  else if (path.includes("/js/") || path.includes("/componentes/"))
    phpPath = "../../php/valida_sessao.php";
  else if (path.includes("/login/")) phpPath = "../php/valida_sessao.php";
  else if (path.includes("/exemplo/")) phpPath = "../php/valida_sessao.php";
  else if (path.includes("/equipe/")) phpPath = "../php/valida_sessao.php";
  else phpPath = "php/valida_sessao.php";

  fetch(phpPath, { cache: "no-store" }) // força a não usar cache
    .then((response) => response.json())
    .then((data) => {
      if (data.status !== "ok") {
        // Sempre redireciona para a página de login absoluta
        window.location.replace("/login/index.html");
      }
    })
    .catch(() => {
      window.location.replace("/login/index.html");
    });
})();
>>>>>>> 98daac1f06bce6814783b8d304e869b2fb3385df

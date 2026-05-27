(function () {
  const userStorageKey =
    typeof STORAGE_USER_KEY !== "undefined" ? STORAGE_USER_KEY : "mitraUsuario";

  // Caminho relativo para o PHP, ajusta automaticamente para subpastas
  let phpPath = "php/valida_sessao.php";
  const path = window.location.pathname;
  if (path.includes("/home/")) phpPath = "../php/valida_sessao.php";
  else if (path.includes("/js/") || path.includes("/componentes/"))
    phpPath = "../../php/valida_sessao.php";
  else if (path.includes("../login/")) phpPath = "../php/valida_sessao.php";
  else if (path.includes("../esportes/")) phpPath = "../php/valida_sessao.php";
  else if (path.includes("../exemplo/")) phpPath = "../php/valida_sessao.php";
  else if (path.includes("../equipe/")) phpPath = "../php/valida_sessao.php";
  else phpPath = "../php/valida_sessao.php";

  function redirecionarLogin() {
    window.location.href = "../login/index.html";
  }

  fetch(phpPath, { cache: "no-store" })
    .then((response) => response.json())
    .then((data) => {
      if (data.status !== "ok") {
        throw new Error("Sessao invalida");
      }

      if (data.usuario) {
        localStorage.setItem(userStorageKey, JSON.stringify(data.usuario));
      }

      window.mitraSessao = data;
      document.dispatchEvent(new CustomEvent("mitra:sessao", { detail: data }));
    })
    .catch(() => {
      redirecionarLogin();
    });
})();

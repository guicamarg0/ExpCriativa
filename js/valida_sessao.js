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

  function redirecionarHome() {
    window.location.href = "../home/home.html";
  }

  function caminhoAtual() {
    return window.location.pathname.toLowerCase();
  }

  function validarPermissao(data) {
    const path = caminhoAtual();
    const perfil = data.perfil || {};
    const tipo = perfil.tipo || "";

    if (tipo === "admin") {
      return;
    }

    if (tipo === "treinador") {
      const permitido =
        path.includes("/home/") ||
        path.includes("/analise/") ||
        path.includes("/atleta/atleta.html") ||
        path.includes("/treino/");

      if (!permitido) {
        redirecionarHome();
      }
      return;
    }

    if (tipo === "atleta") {
      if (path.includes("/treino/atletas_treino.html")) {
        window.location.href = `../treino/planilha_treino.html?id=${perfil.id}`;
        return;
      }

      if (path.includes("/treino/planilha_treino.html")) {
        const idUrl = new URLSearchParams(window.location.search).get("id");
        if (String(idUrl || "") !== String(perfil.id || "")) {
          window.location.href = `../treino/planilha_treino.html?id=${perfil.id}`;
        }
        return;
      }

      const permitido =
        path.includes("/home/") ||
        path.includes("/analise/");

      if (!permitido) {
        redirecionarHome();
      }
    }
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
      validarPermissao(data);
    })
    .catch(() => {
      redirecionarLogin();
    });
})();

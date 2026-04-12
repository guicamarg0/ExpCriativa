// valida_sessao.js - Redireciona para login se não houver sessão válida
(function () {
  const STORAGE_SESSION_KEY = "mitraSessionKey";
  const STORAGE_USER_KEY = "mitraUsuario";

  const scriptTag =
    document.currentScript ||
    document.querySelector('script[src*="valida_sessao.js"]');

  let basePath = "";
  if (scriptTag && scriptTag.src) {
    const scriptUrl = new URL(scriptTag.src, window.location.href);
    const sufixo = "/js/valida_sessao.js";
    if (scriptUrl.pathname.endsWith(sufixo)) {
      basePath = scriptUrl.pathname.slice(0, -sufixo.length);
    }
  }

  const phpPath = `${basePath}/php/valida_sessao.php`;
  const loginPath = `${basePath}/login/index.html`;
  const homePath = `${basePath}/home/home.html`;

  function normalizarPathname(pathname) {
    return String(pathname || "")
      .replace(/\/index\.php$/i, "/")
      .replace(/\/index\.html$/i, "/")
      .toLowerCase();
  }

  function limparSessaoLocal() {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
  }

  function encerrarSessaoServidor() {
    fetch(`${basePath}/php/usuario_logoff.php`, {
      cache: "no-store",
    }).catch(() => {});
  }

  function redirecionarLogin(encerrarServidor = false) {
    if (encerrarServidor) {
      encerrarSessaoServidor();
    }
    limparSessaoLocal();
    window.location.replace(loginPath);
  }

  function usuarioTemAcesso(idNivel, caminhoAtual) {
    if (caminhoAtual.includes("/home/home.html") || caminhoAtual.endsWith("/home/")) {
      return true;
    }

    if (idNivel === 1) {
      return true;
    }

    if (idNivel === 2) {
      return caminhoAtual.includes("/equipe/equipe.html") || caminhoAtual.endsWith("/equipe/");
    }

    if (idNivel === 3) {
      return false;
    }

    return false;
  }

  const caminhoAtual = normalizarPathname(window.location.pathname);
  const sessionKey = localStorage.getItem(STORAGE_SESSION_KEY) || "";

  if (!sessionKey) {
    redirecionarLogin(true);
    return;
  }

  fetch(phpPath, {
    cache: "no-store",
    headers: {
      "X-Session-Key": sessionKey,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Falha ao validar sessão (${response.status})`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.status !== "ok") {
        redirecionarLogin();
        return;
      }

      if (data.usuario) {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data.usuario));
      }

      window.mitraSessao = data;
      document.dispatchEvent(new CustomEvent("mitra:sessao", { detail: data }));

      const idNivel = Number(data.id_nivel || 0);
      if (!usuarioTemAcesso(idNivel, caminhoAtual)) {
        window.location.replace(homePath);
      }
    })
    .catch(() => {
      redirecionarLogin();
    });
})();

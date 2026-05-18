(function () {
  const STORAGE_SESSION_KEY = "mitraSessionKey";
  const STORAGE_USER_KEY = "mitraUsuario";

  const scriptTag =
    document.currentScript ||
    document.querySelector('script[src*="valida_sessao.js"]');

  let basePath = "";
  if (scriptTag && scriptTag.src) {
    const scriptUrl = new URL(scriptTag.src, window.location.href);
    const suffix = "/js/valida_sessao.js";
    if (scriptUrl.pathname.endsWith(suffix)) {
      basePath = scriptUrl.pathname.slice(0, -suffix.length);
    }
  }

  const phpPath = `${basePath}/php/valida_sessao.php`;
  const loginPath = `${basePath}/login/index.html`;

  function limparSessaoLocal() {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
  }

  function redirecionarLogin() {
    limparSessaoLocal();
    window.location.replace(loginPath);
  }

  const sessionKey = localStorage.getItem(STORAGE_SESSION_KEY) || "";
  if (!sessionKey) {
    redirecionarLogin();
    return;
  }

  fetch(phpPath, {
    cache: "no-store",
    headers: {
      "X-Session-Key": sessionKey
    }
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Sessao invalida");
      }
      return response.json();
    })
    .then((data) => {
      if (data.status !== "ok") {
        throw new Error("Sessao invalida");
      }

      if (data.usuario) {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data.usuario));
      }

      window.mitraSessao = data;
      document.dispatchEvent(new CustomEvent("mitra:sessao", { detail: data }));
    })
    .catch(() => {
      redirecionarLogin();
    });
})();

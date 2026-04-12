const STORAGE_SESSION_KEY = "mitraSessionKey";
const STORAGE_USER_KEY = "mitraUsuario";

function loadCSS(href) {
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }
}

function getMenuScriptTag() {
  return (
    document.currentScript ||
    document.querySelector('script[src*="menu_lateral.js"]')
  );
}

function getBasePath(scriptTag) {
  if (!scriptTag || !scriptTag.src) {
    return "";
  }

  const scriptUrl = new URL(scriptTag.src, window.location.href);
  const sufixo = "/js/menu_lateral.js";
  if (scriptUrl.pathname.endsWith(sufixo)) {
    return scriptUrl.pathname.slice(0, -sufixo.length);
  }
  return "";
}

function normalizarPath(path) {
  return String(path || "")
    .replace(/\/index\.html$/i, "/")
    .replace(/\/index\.php$/i, "/")
    .toLowerCase();
}

function limparSessaoLocal() {
  localStorage.removeItem(STORAGE_SESSION_KEY);
  localStorage.removeItem(STORAGE_USER_KEY);
}

function setActiveLink(container) {
  const currentPath = normalizarPath(window.location.pathname);
  const currentHash = window.location.hash;
  const links = container.querySelectorAll(".links a");

  links.forEach((link) => {
    link.classList.remove("active");

    const href = link.getAttribute("href") || "";
    if (!href || href === "#") {
      return;
    }

    if (href.startsWith("#")) {
      if (href === currentHash) {
        link.classList.add("active");
      }
      return;
    }

    try {
      const linkUrl = new URL(href, window.location.href);
      const linkPath = normalizarPath(linkUrl.pathname);
      if (linkPath === currentPath) {
        link.classList.add("active");
      }
    } catch (error) {
      console.warn("Link inválido no menu:", href);
    }
  });
}

function aplicarPermissoesMenu(container, idNivel) {
  const links = container.querySelectorAll(".links a");
  const nivel = Number(idNivel || 0);

  let permitidos = [];
  if (nivel === 1) {
    permitidos = ["esportes", "equipe", "treinador", "atleta"];
  } else if (nivel === 2) {
    permitidos = ["equipe"];
  } else if (nivel === 3) {
    permitidos = [];
  }

  links.forEach((link) => {
    const modulo = (link.dataset.modulo || "").toLowerCase();
    if (!permitidos.includes(modulo)) {
      link.remove();
    }
  });
}

async function obterSessaoAtual(basePath) {
  const sessionKey = localStorage.getItem(STORAGE_SESSION_KEY) || "";
  if (!sessionKey) {
    return null;
  }

  const retorno = await fetch(`${basePath}/php/valida_sessao.php`, {
    cache: "no-store",
    headers: {
      "X-Session-Key": sessionKey,
    },
  });

  if (!retorno.ok) {
    return null;
  }

  const resposta = await retorno.json();
  if (resposta.status !== "ok") {
    return null;
  }

  if (resposta.usuario) {
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(resposta.usuario));
  }

  return resposta;
}

async function logout(basePath) {
  try {
    await fetch(`${basePath}/php/usuario_logoff.php`, {
      cache: "no-store",
    });
  } catch (erro) {
    console.error("Erro ao encerrar sessão:", erro);
  }

  limparSessaoLocal();
  window.location.replace(`${basePath}/login/index.html`);
}

loadCSS("https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css");
loadCSS("https://unpkg.com/bootstrap-icons@1.11.3/font/bootstrap-icons.css");

document.addEventListener("DOMContentLoaded", async () => {
  const scriptTag = getMenuScriptTag();
  const menuHtmlPath = scriptTag?.dataset.menuHtml || "../componentes/menuLateral.html";
  const menuCssPath = scriptTag?.dataset.menuCss || "../componentes/menuLateral.css";
  const targetSelector = scriptTag?.dataset.menuTarget || ".menu";
  const basePath = getBasePath(scriptTag);

  if (!document.querySelector(`link[rel="stylesheet"][href="${menuCssPath}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = menuCssPath;
    document.head.appendChild(link);
  }

  try {
    const response = await fetch(menuHtmlPath);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const menu = doc.querySelector(".menu");
    const target = document.querySelector(targetSelector);

    if (!menu || !target) {
      return;
    }

    target.innerHTML = menu.innerHTML;

    let sessao = null;
    try {
      sessao = await obterSessaoAtual(basePath);
    } catch (erro) {
      sessao = null;
    }

    if (sessao && sessao.status === "ok") {
      window.mitraSessao = window.mitraSessao || sessao;
      aplicarPermissoesMenu(target, sessao.id_nivel);
    } else {
      const links = target.querySelector(".links");
      if (links) {
        links.innerHTML = "";
      }
    }

    const btnLogout = target.querySelector("#btnMenuLogout");
    if (btnLogout) {
      btnLogout.addEventListener("click", () => {
        logout(basePath);
      });
    }

    setActiveLink(target);
    window.addEventListener("hashchange", () => setActiveLink(target));
    window.addEventListener("popstate", () => setActiveLink(target));
  } catch (error) {
    console.error("Erro ao carregar o menu lateral:", error);
  }
});

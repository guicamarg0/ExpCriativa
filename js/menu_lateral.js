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
  const suffix = "/js/menu_lateral.js";
  if (scriptUrl.pathname.endsWith(suffix)) {
    return scriptUrl.pathname.slice(0, -suffix.length);
  }

  return "";
}

function limparSessaoLocal() {
  localStorage.removeItem(STORAGE_SESSION_KEY);
  localStorage.removeItem(STORAGE_USER_KEY);
}

async function logout(basePath) {
  try {
    await fetch(`${basePath}/php/usuario_logoff.php`, {
      cache: "no-store"
    });
  } catch (error) {
    console.error(error);
  }

  limparSessaoLocal();
  window.location.replace(`${basePath}/login/index.html`);
}

function marcarLinkAtivo(menu) {
  const atual = window.location.pathname.toLowerCase();
  const links = menu.querySelectorAll(".links a");

  links.forEach((link) => {
    const href = link.getAttribute("href") || "";
    const url = new URL(href, window.location.href);
    const alvo = url.pathname.toLowerCase();
    if (atual === alvo) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
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
    marcarLinkAtivo(target);

    const btnLogout = target.querySelector("#btnMenuLogout");
    if (btnLogout) {
      btnLogout.addEventListener("click", () => logout(basePath));
    }
  } catch (error) {
    console.error(error);
  }
});

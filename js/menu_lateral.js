const STORAGE_SESSION_KEY = "mitraSessionKey";
const STORAGE_USER_KEY = "mitraUsuario";

document.addEventListener("DOMContentLoaded", async () => {
  const scriptTag = document.currentScript || document.querySelector('script[src*="menu_lateral.js"]');

  let basePath = "";
  if (scriptTag?.src) {
    const scriptUrl = new URL(scriptTag.src, window.location.href);
    const sufixo = "/js/menu_lateral.js";
    if (scriptUrl.pathname.endsWith(sufixo)) {
      basePath = scriptUrl.pathname.slice(0, -sufixo.length);
    }
  }

  const menuHtmlPath = scriptTag?.dataset.menuHtml || (basePath ? `${basePath}/componentes/menuLateral.html` : "../componentes/menuLateral.html");
  const menuCssPath = basePath ? `${basePath}/componentes/menuLateral.css` : "../componentes/menuLateral.css";
  const logoutPath = basePath ? `${basePath}/php/usuario_logoff.php` : "../php/usuario_logoff.php";
  const loginPath = basePath ? `${basePath}/login/index.html` : "../login/index.html";
  const targetSelector = scriptTag?.dataset.menuTarget || ".menu";

  const cssArquivos = [
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css",
    "https://unpkg.com/bootstrap-icons@1.11.3/font/bootstrap-icons.css",
    menuCssPath
  ];

  for (let i = 0; i < cssArquivos.length; i++) {
    const href = cssArquivos[i];
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }
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

    const telaAtual = (document.querySelector('meta[name="menu-tela-atual"]')?.getAttribute("content") || "")
      .trim()
      .toUpperCase();

    let moduloAtivo = "";
    switch (telaAtual) {
      case "ESPORTES":
        moduloAtivo = "esportes";
        break;
      case "EQUIPE":
        moduloAtivo = "equipe";
        break;
      case "TREINADOR":
        moduloAtivo = "treinador";
        break;
      case "ATLETA":
        moduloAtivo = "atleta";
        break;
      case "HOME":
      default:
        moduloAtivo = "";
        break;
    }

    const links = target.querySelectorAll(".links a");
    links.forEach((link) => link.classList.remove("active"));

    if (moduloAtivo) {
      const linkAtivo = target.querySelector(`.links a[data-modulo="${moduloAtivo}"]`);
      if (linkAtivo) {
        linkAtivo.classList.add("active");
      }
    }

    const btnLogout = target.querySelector("#btnMenuLogout");
    if (btnLogout) {
      btnLogout.addEventListener("click", async () => {
        try {
          await fetch(logoutPath, { cache: "no-store" });
        } catch (error) {
          console.error(error);
        }

        localStorage.removeItem(STORAGE_SESSION_KEY);
        localStorage.removeItem(STORAGE_USER_KEY);
        window.location.replace(loginPath);
      });
    }
  } catch (error) {
    console.error(error);
  }
});

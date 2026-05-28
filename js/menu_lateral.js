const STORAGE_SESSION_KEY = "mitraSessionKey";
const STORAGE_USER_KEY = "mitraUsuario";

document.addEventListener("DOMContentLoaded", async () => {
  const scriptTag =
    document.currentScript ||
    document.querySelector('script[src*="menu_lateral.js"]');

  let basePath =
    document.querySelector('meta[name="app-base"]')?.getAttribute("content") ||
    "";
  if (!basePath && scriptTag?.src) {
    const scriptUrl = new URL(scriptTag.src, window.location.href);
    const sufixo = "/js/menu_lateral.js";
    if (scriptUrl.pathname.endsWith(sufixo)) {
      basePath = scriptUrl.pathname.slice(0, -sufixo.length);
    }
  }

  const normalizedBasePath = basePath.endsWith("/")
    ? basePath.slice(0, -1)
    : basePath;

  const menuHtmlPath = `${normalizedBasePath}/componentes/menuLateral.html`;
  const logoutPath = `${normalizedBasePath}/php/usuario_logoff.php`;
  const loginPath = `${normalizedBasePath}/login/index.html`;
  const target =
    document.querySelector("#menu-lateral") || document.querySelector(".menu");

  try {
    if (!target) {
      return;
    }

    const response = await fetch(menuHtmlPath);
    if (!response.ok) {
      return;
    }

    const menuHtml = await response.text();
    target.classList.add("menu");
    target.innerHTML = menuHtml;

    const path = window.location.pathname.toLowerCase();
    const search = window.location.search.toLowerCase();

    const grupoCadastro = target.querySelector("#menuGrupoCadastro");
    const resumoCadastro = grupoCadastro?.querySelector(".menuGrupoResumo");
    const grupoTreinos = target.querySelector("#menuGrupoTreinos");
    const resumoTreinos = grupoTreinos?.querySelector(".menuGrupoResumo");
    const linkAnalise = target.querySelector('[data-menu="analise"]');

    const linksCadastro = {
      modalidades: target.querySelector('[data-menu="modalidades"]'),
      equipes: target.querySelector('[data-menu="equipes"]'),
      treinadores: target.querySelector('[data-menu="treinadores"]'),
      atletas: target.querySelector('[data-menu="atletas"]')
    };
    const linksTreinos = {
      atletasTreino: target.querySelector('[data-menu="atletas-treino"]'),
      planilhasTreino: target.querySelector('[data-menu="planilhas-treino"]')
    };

    const isEsportes = path.includes("/esportes/");
    const isEquipe = path.includes("/equipe/");
    const isTreinador = path.includes("/treinador/");
    const isAtleta = path.includes("/atleta/");
    const isAnalise = path.includes("/analise/");
    const isTreinoNovo = path.includes("/treino/treino_novo.html");
    const isTreinoAlterar = path.includes("/treino/treino_alterar.html");
    const isAtletasTreino = path.includes("/treino/atletas_treino.html");
    const isPlanilhaTreino = path.includes("/treino/planilha_treino.html");
    const isEntradaPlanilhas = isAtletasTreino && search.includes("origem=planilhas");
    const cadastroAtivo =
      isEsportes ||
      isEquipe ||
      isTreinador ||
      isAtleta;
    const treinosAtivo =
      isAtletasTreino ||
      isPlanilhaTreino ||
      isTreinoNovo ||
      isTreinoAlterar;

    if (resumoCadastro) {
      resumoCadastro.classList.remove("active");
    }
    if (resumoTreinos) {
      resumoTreinos.classList.remove("active");
    }
    linkAnalise?.classList.remove("active");
    Object.values(linksCadastro).forEach((link) => {
      link?.classList.remove("active");
    });
    Object.values(linksTreinos).forEach((link) => {
      link?.classList.remove("active");
    });

    if (cadastroAtivo) {
      grupoCadastro?.setAttribute("open", "open");
      resumoCadastro?.classList.add("active");
      if (isEsportes) {
        linksCadastro.modalidades?.classList.add("active");
      } else if (isEquipe) {
        linksCadastro.equipes?.classList.add("active");
      } else if (isTreinador) {
        linksCadastro.treinadores?.classList.add("active");
      } else if (isAtleta) {
        linksCadastro.atletas?.classList.add("active");
      }
    } else {
      grupoCadastro?.removeAttribute("open");
    }

    if (treinosAtivo) {
      grupoTreinos?.setAttribute("open", "open");
      resumoTreinos?.classList.add("active");
      if (isPlanilhaTreino || isEntradaPlanilhas) {
        linksTreinos.planilhasTreino?.classList.add("active");
      } else {
        linksTreinos.atletasTreino?.classList.add("active");
      }
    } else {
      grupoTreinos?.removeAttribute("open");
    }

    if (isAnalise) {
      linkAnalise?.classList.add("active");
    }

    const btnLogout = document.querySelector("#btnMenuLogout");
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

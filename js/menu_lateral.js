function loadCSS(href) {
    if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
    }
}

// CDNs globais
loadCSS("https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css");
loadCSS("https://unpkg.com/bootstrap-icons@1.11.3/font/bootstrap-icons.css");


document.addEventListener("DOMContentLoaded", () => {
    const scriptTag = document.querySelector('script[src$="menu_lateral.js"]');
    const menuHtmlPath = scriptTag?.dataset.menuHtml || "../componentes/menuLateral.html";
    const menuCssPath = scriptTag?.dataset.menuCss || "../componentes/menuLateral.css";
    const targetSelector = scriptTag?.dataset.menuTarget || ".menu";

    if (!document.querySelector(`link[rel="stylesheet"][href="${menuCssPath}"]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = menuCssPath;
        document.head.appendChild(link);
    }

    const setActiveLink = (container) => {
        const currentPath = window.location.pathname.replace(/\/index\.html$/, "/");
        const currentHash = window.location.hash;
        const links = container.querySelectorAll(".links a").length
            ? container.querySelectorAll(".links a")
            : container.querySelectorAll("a");

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
                const linkPath = linkUrl.pathname.replace(/\/index\.html$/, "/");
                if (linkPath === currentPath) {
                    link.classList.add("active");
                }
            } catch (error) {
                console.warn("Link invalido no menu:", href);
            }
        });
    };

    fetch(menuHtmlPath)
        .then((response) => response.text())
        .then((html) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const menu = doc.querySelector(".menu");

            if (menu) {
                const target = document.querySelector(targetSelector);
                if (target) {
                    target.innerHTML = menu.innerHTML;
                    setActiveLink(target);
                    window.addEventListener("hashchange", () => setActiveLink(target));
                    window.addEventListener("popstate", () => setActiveLink(target));
                }
            }
        })
        .catch((error) => {
            console.error("Erro ao carregar o menu lateral:", error);
        });
});

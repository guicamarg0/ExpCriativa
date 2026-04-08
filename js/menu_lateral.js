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
                }
            }
        })
        .catch((error) => {
            console.error("Erro ao carregar o menu lateral:", error);
        });
});

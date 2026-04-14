let esportesView = [];

document.addEventListener("DOMContentLoaded", async () => {
    await window.esportesSessao.aplicarPermissoesTelaEsportes();
    await buscarEsportes();
});

function formatarStatus(valor) {
    return String(valor || "").toLowerCase() === "inativo" ? "Inativo" : "Ativo";
}

function preencherTabelaEsportes() {
    const lista = document.querySelector(".listViewEsportes");
    if (!lista) {
        return;
    }

    let html = "";
    for (let i = 0; i < esportesView.length; i++) {
        const esporte = esportesView[i];
        html += `
            <div class="linhaEsporte">
                <a class="btnEditarEsporte" data-id="${esporte.id}" href="esportes_alterar.html?id=${esporte.id}">
                    <i class="bi bi-pencil-square"></i>
                </a>
                <p><b>${esporte.nome || ""}</b></p>
                <p>${esporte.equipes_vinculadas || "0"}</p>
                <p>${formatarStatus(esporte.status)}</p>
            </div>
        `;
    }

    lista.innerHTML = html;
}

async function buscarEsportes() {
    const retorno = await fetch("../php/esportes/esportes_get.php?status=todos");
    const resposta = await retorno.json();
    esportesView = resposta.status === "ok" && Array.isArray(resposta.data) ? resposta.data : [];
    preencherTabelaEsportes();
}

let atletasView = [];

document.addEventListener("DOMContentLoaded", async () => {
    await window.atletaSessao.aplicarPermissoesTelaAtleta();
    await buscarAtletas();
});

function formatarStatusAtleta(valor) {
    return String(valor || "").toLowerCase() === "inativo" ? "Inativo" : "Ativo";
}

function formatarDataAtleta(valor) {
    if (!valor) {
        return "";
    }

    const partes = String(valor).slice(0, 10).split("-");
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : valor;
}

function preencherTabelaAtletas() {
    const lista = document.querySelector(".listViewAtletas");
    if (!lista) {
        return;
    }

    let html = "";
    for (let i = 0; i < atletasView.length; i++) {
        const atleta = atletasView[i];
        html += `
            <div class="linhaAtleta">
                <a class="btnEditarAtleta" href="atleta_alterar.html?id=${atleta.id}"><i class="bi bi-pencil-square"></i></a>
                <p><b>${atleta.nome || ""}</b></p>
                <p>${formatarDataAtleta(atleta.data_nascimento)}</p>
                <p>${atleta.genero_nome || ""}</p>
                <p>${atleta.altura || ""}</p>
                <p>${atleta.peso || ""}</p>
                <p>${formatarStatusAtleta(atleta.status)}</p>
            </div>
        `;
    }

    lista.innerHTML = html;
}

async function buscarAtletas() {
    const retorno = await fetch("../php/atleta/atleta_get.php?status=todos");
    const resposta = await retorno.json();
    atletasView = resposta.status === "ok" && Array.isArray(resposta.data) ? resposta.data : [];
    preencherTabelaAtletas();
}

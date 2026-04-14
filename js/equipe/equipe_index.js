let equipesView = [];

document.addEventListener("DOMContentLoaded", async () => {
    await window.equipeSessao.aplicarPermissoesTelaEquipe();
    await buscarEquipes();
});

function formatarStatusEquipe(valor) {
    return String(valor || "").toLowerCase() === "inativa" ? "Inativa" : "Ativa";
}

function preencherTabelaEquipes() {
    const lista = document.querySelector(".listViewEquipes");
    if (!lista) {
        return;
    }

    let html = "";
    for (let i = 0; i < equipesView.length; i++) {
        const equipe = equipesView[i];
        html += `
            <div class="linhaEquipe">
                <a class="btnEditarEquipe" href="equipe_alterar.html?id=${equipe.id}">
                    <i class="bi bi-pencil-square"></i>
                </a>
                <p><b>${equipe.nome || ""}</b></p>
                <p>${equipe.modalidade || ""}</p>
                <p>${equipe.categoria || ""}</p>
                <p>${equipe.genero || ""}</p>
                <p>${equipe.treinador_responsavel_nome || ""}</p>
                <p>${equipe.integrantes || ""}</p>
                <p>${formatarStatusEquipe(equipe.status)}</p>
            </div>
        `;
    }

    lista.innerHTML = html;
}

async function buscarEquipes() {
    const sessao = await window.equipeSessao.obterSessaoEquipeAtual();
    const retorno = await fetch("../php/equipe/equipe_get.php?status=todos");
    const resposta = await retorno.json();
    const data = resposta.status === "ok" && Array.isArray(resposta.data) ? resposta.data : [];
    equipesView = window.equipeSessao.filtrarEquipesPorSessao(data, sessao);
    preencherTabelaEquipes();
}

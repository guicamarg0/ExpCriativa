let treinadoresView = [];

document.addEventListener("DOMContentLoaded", async () => {
    await window.treinadorSessao.aplicarPermissoesTelaTreinador();
    await buscarTreinadores();
});

function formatarStatusTreinador(valor) {
    return String(valor || "").toLowerCase() === "inativo" ? "Inativo" : "Ativo";
}

function preencherTabelaTreinadores() {
    const lista = document.getElementById("listViewTreinadores");
    if (!lista) {
        return;
    }

    if (!treinadoresView.length) {
        lista.innerHTML = '<p class="estadoListaVazia">Nenhum treinador cadastrado.</p>';
        return;
    }

    let html = "";
    for (let i = 0; i < treinadoresView.length; i++) {
        const treinador = treinadoresView[i];
        html += `
            <div class="linhaTreinador">
                <a class="btnEditarTreinador" href="treinador_alterar.html?id=${treinador.id}"><i class="bi bi-pencil-square"></i></a>
                <p><b>${treinador.nome || ""}</b></p>
                <p>${treinador.email || ""}</p>
                <p>${treinador.equipes_responsavel || ""}</p>
                <p>${treinador.telefone || ""}</p>
                <p>${treinador.cref || ""}</p>
                <p>${formatarStatusTreinador(treinador.status)}</p>
            </div>
        `;
    }

    lista.innerHTML = html;
}

async function buscarTreinadores() {
    const resposta = await window.treinadorCRUD.listarTreinadores("todos");
    treinadoresView = resposta.status === "ok" && Array.isArray(resposta.data) ? resposta.data : [];
    preencherTabelaTreinadores();
}

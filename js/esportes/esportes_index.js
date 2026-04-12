let esportesView = [];

document.addEventListener("DOMContentLoaded", () => {
    prepararFiltroStatusEsporte();
    buscarEsportes();
    prepararModalEsporte();
    prepararModalEdicaoEsporte();
});

function escaparHtml(valor) {
    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function normalizarStatusEsporte(valor) {
    const texto = String(valor ?? "").toLowerCase();
    if (texto === "inativo" || texto === "inativa" || texto === "0") {
        return "inativo";
    }
    return "ativo";
}

function formatStatus(valor) {
    if (valor === null || typeof valor === "undefined") {
        return "-";
    }
    return normalizarStatusEsporte(valor) === "inativo" ? "Inativo" : "Ativo";
}

function obterFiltroStatusEsporte() {
    const filtro = document.getElementById("filtroStatusEsporte");
    if (!filtro) {
        return "ativo";
    }

    const valor = String(filtro.value || "").toLowerCase();
    if (valor === "inativo" || valor === "todos") {
        return valor;
    }
    return "ativo";
}

function prepararFiltroStatusEsporte() {
    const filtro = document.getElementById("filtroStatusEsporte");
    if (!filtro) {
        return;
    }

    filtro.addEventListener("change", () => {
        buscarEsportes();
    });
}

function atualizarBotaoAlternarStatusEsporte(form) {
    if (!form || !form.elements.status) {
        return;
    }

    const botao = form.querySelector(".btnAlternarStatusEsporte");
    if (!botao) {
        return;
    }

    const statusAtual = normalizarStatusEsporte(form.elements.status.value);
    botao.textContent = statusAtual === "ativo" ? "Inativar" : "Ativar";
}

async function perguntarConfirmacao(mensagem) {
    if (window.mitraToast && typeof window.mitraToast.confirm === "function") {
        return window.mitraToast.confirm(mensagem);
    }
    return window.confirm(mensagem);
}

function preencherTabelaEsportes() {
    const lista = document.querySelector(".listViewEsportes");
    if (!lista) {
        return;
    }

    if (!esportesView.length) {
        lista.innerHTML = '<p class="estadoListaVazia">Nenhuma modalidade encontrada.</p>';
        return;
    }

    let html = "";
    for (let i = 0; i < esportesView.length; i++) {
        const esporte = esportesView[i];
        const nome = esporte.nome || "Sem nome";
        const equipesVinculadas = esporte.equipes_vinculadas ?? "0";
        const status = formatStatus(esporte.status);

        html += `
            <div class="linhaEsporte">
                <button class="btnEditarEsporte" data-id="${escaparHtml(esporte.id)}" type="button">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <p title="${escaparHtml(nome)}"><b>${escaparHtml(nome)}</b></p>
                <p title="${escaparHtml(equipesVinculadas)}">${escaparHtml(equipesVinculadas)}</p>
                <p title="${escaparHtml(status)}">${escaparHtml(status)}</p>
            </div>
        `;
    }

    lista.innerHTML = html;
}

async function buscarEsportes() {
    const status = obterFiltroStatusEsporte();

    try {
        const retorno = await fetch(`../php/esportes/esportes_get.php?status=${encodeURIComponent(status)}`);
        const resposta = await retorno.json();
        if (resposta.status === "ok" && Array.isArray(resposta.data)) {
            esportesView = resposta.data;
        } else {
            esportesView = [];
        }
        preencherTabelaEsportes();
    } catch (erro) {
        esportesView = [];
        preencherTabelaEsportes();
        alert("Erro ao buscar modalidades.");
        console.error(erro);
    }
}

function abrirModalEsporte() {
    const modal = document.getElementById("modalEsporte");
    if (!modal) {
        return;
    }
    modal.classList.add("ativo");
    modal.setAttribute("aria-hidden", "false");
}

function fecharModalEsporte() {
    const modal = document.getElementById("modalEsporte");
    if (!modal) {
        return;
    }
    modal.classList.remove("ativo");
    modal.setAttribute("aria-hidden", "true");
}

function abrirModalEsporteEdicao() {
    const modal = document.getElementById("modalEsporteEdicao");
    if (!modal) {
        return;
    }
    modal.classList.add("ativo");
    modal.setAttribute("aria-hidden", "false");
}

function fecharModalEsporteEdicao() {
    const modal = document.getElementById("modalEsporteEdicao");
    if (!modal) {
        return;
    }
    modal.classList.remove("ativo");
    modal.setAttribute("aria-hidden", "true");
}

function prepararModalEsporte() {
    const botaoAbrir = document.getElementById("btnAbrirModalEsporte");
    const modal = document.getElementById("modalEsporte");
    const form = document.getElementById("formEsporteNovo");

    if (!botaoAbrir || !modal || !form) {
        return;
    }

    botaoAbrir.addEventListener("click", abrirModalEsporte);

    modal.addEventListener("click", (event) => {
        if (event.target && event.target.hasAttribute("data-modal-close")) {
            fecharModalEsporte();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("ativo")) {
            fecharModalEsporte();
        }
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        formData.set("status", "ativo");

        try {
            const retorno = await fetch("../php/esportes/esportes_novo.php", {
                method: "POST",
                body: formData
            });
            const resposta = await retorno.json();
            if (resposta.status === "ok") {
                form.reset();
                fecharModalEsporte();
                await buscarEsportes();
                alert("SUCESSO: " + resposta.mensagem);
            } else {
                alert("ERRO: " + resposta.mensagem);
            }
        } catch (erro) {
            alert("Erro ao cadastrar modalidade.");
            console.error(erro);
        }
    });
}

function preencherModalEdicaoEsporte(esporte, form) {
    if (!form || !esporte) {
        return;
    }

    form.elements.id.value = esporte.id || "";
    form.elements.nome.value = esporte.nome || "";
    form.elements.status.value = normalizarStatusEsporte(esporte.status);
    atualizarBotaoAlternarStatusEsporte(form);
}

function prepararModalEdicaoEsporte() {
    const lista = document.querySelector(".listViewEsportes");
    const modal = document.getElementById("modalEsporteEdicao");
    const form = document.getElementById("formEsporteEdicao");
    const btnAlternarStatus = form ? form.querySelector(".btnAlternarStatusEsporte") : null;

    if (!lista || !modal || !form) {
        return;
    }

    lista.addEventListener("click", async (event) => {
        const botaoEditar = event.target.closest(".btnEditarEsporte");
        if (!botaoEditar) {
            return;
        }

        const id = botaoEditar.getAttribute("data-id");
        if (!id) {
            return;
        }

        try {
            const retorno = await fetch(`../php/esportes/esportes_get.php?id=${encodeURIComponent(id)}&status=todos`);
            const resposta = await retorno.json();
            if (resposta.status !== "ok" || !Array.isArray(resposta.data) || !resposta.data[0]) {
                alert("Não foi possível carregar a modalidade.");
                return;
            }

            preencherModalEdicaoEsporte(resposta.data[0], form);
            abrirModalEsporteEdicao();
        } catch (erro) {
            alert("Erro ao carregar modalidade.");
            console.error(erro);
        }
    });

    modal.addEventListener("click", (event) => {
        if (event.target && event.target.hasAttribute("data-modal-close-edit")) {
            fecharModalEsporteEdicao();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("ativo")) {
            fecharModalEsporteEdicao();
        }
    });

    const enviarAlteracao = async (statusForcado = "") => {
        const formData = new FormData(form);
        const id = String(formData.get("id") || "");
        if (!id) {
            alert("Selecione uma modalidade para editar.");
            return false;
        }

        const status = normalizarStatusEsporte(statusForcado || formData.get("status"));
        formData.set("status", status);

        try {
            const retorno = await fetch(`../php/esportes/esportes_alterar.php?id=${encodeURIComponent(id)}`, {
                method: "POST",
                body: formData
            });
            const resposta = await retorno.json();
            if (resposta.status === "ok") {
                fecharModalEsporteEdicao();
                await buscarEsportes();
                alert("SUCESSO: " + resposta.mensagem);
                return true;
            }

            alert("ERRO: " + resposta.mensagem);
            return false;
        } catch (erro) {
            alert("Erro ao editar modalidade.");
            console.error(erro);
            return false;
        }
    };

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        await enviarAlteracao();
    });

    if (btnAlternarStatus) {
        btnAlternarStatus.addEventListener("click", async () => {
            const statusAtual = normalizarStatusEsporte(form.elements.status.value);
            const proximoStatus = statusAtual === "ativo" ? "inativo" : "ativo";
            const acao = proximoStatus === "ativo" ? "ativar" : "inativar";
            const confirmou = await perguntarConfirmacao(`Deseja ${acao} esta modalidade?`);
            if (!confirmou) {
                return;
            }
            await enviarAlteracao(proximoStatus);
        });
    }
}

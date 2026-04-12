let treinadoresView = [];

document.addEventListener("DOMContentLoaded", () => {
    const botaoEnviar = document.getElementById("enviar");
    if (botaoEnviar) {
        botaoEnviar.addEventListener("click", () => {
            novo();
        });
    }

    prepararModalTreinador();
    prepararModalEdicaoTreinador();
    prepararFiltroStatus();
    getTreinadores();
});

function escaparHtml(valor) {
    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function normalizarStatus(valor) {
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
    return normalizarStatus(valor) === "inativo" ? "Inativo" : "Ativo";
}

function atualizarBotaoAlternarStatusTreinador(form) {
    if (!form || !form.elements.status) {
        return;
    }

    const botao = form.querySelector(".btnAlternarStatusTreinador");
    if (!botao) {
        return;
    }

    const statusAtual = normalizarStatus(form.elements.status.value);
    botao.textContent = statusAtual === "ativo" ? "Inativar" : "Ativar";
}

function formatarDataParaInput(valor) {
    if (!valor) {
        return "";
    }
    return String(valor).slice(0, 10);
}

function obterFiltroStatusSelecionado() {
    const filtro = document.getElementById("filtroStatusTreinador");
    if (!filtro) {
        return "ativo";
    }

    const valor = (filtro.value || "").toLowerCase();
    if (valor === "inativo" || valor === "todos") {
        return valor;
    }
    return "ativo";
}

function prepararFiltroStatus() {
    const filtro = document.getElementById("filtroStatusTreinador");
    if (!filtro) {
        return;
    }

    filtro.addEventListener("change", () => {
        getTreinadores();
    });
}

function preencherTabelaTreinadores() {
    const lista = document.getElementById("listViewTreinadores");
    if (!lista) {
        return;
    }

    if (!treinadoresView.length) {
        lista.innerHTML = '<p class="estadoListaVazia">Nenhum treinador encontrado.</p>';
        return;
    }

    let html = "";
    for (let i = 0; i < treinadoresView.length; i++) {
        const treinador = treinadoresView[i];
        const nome = treinador.nome || "Sem nome";
        const email = treinador.email || "-";
        const equipe = treinador.equipes_responsavel || "-";
        const telefone = treinador.telefone || "-";
        const cref = treinador.cref || "-";
        const statusTexto = formatStatus(treinador.status);

        html += `
            <div class="linhaTreinador">
                <button class="btnEditarTreinador" data-id="${escaparHtml(treinador.id)}" type="button"><i class="bi bi-pencil-square"></i></button>
                <p title="${escaparHtml(nome)}"><b>${escaparHtml(nome)}</b></p>
                <p title="${escaparHtml(email)}">${escaparHtml(email)}</p>
                <p title="${escaparHtml(equipe)}">${escaparHtml(equipe)}</p>
                <p title="${escaparHtml(telefone)}">${escaparHtml(telefone)}</p>
                <p title="${escaparHtml(cref)}">${escaparHtml(cref)}</p>
                <p title="${escaparHtml(statusTexto)}">${escaparHtml(statusTexto)}</p>
            </div>
        `;
    }

    lista.innerHTML = html;
}

async function getTreinadores() {
    const status = obterFiltroStatusSelecionado();

    try {
        const retorno = await fetch(`../php/treinador/treinador_get.php?status=${encodeURIComponent(status)}`);
        const resposta = await retorno.json();
        if (resposta.status === "ok" && Array.isArray(resposta.data)) {
            treinadoresView = resposta.data;
        } else {
            treinadoresView = [];
        }
        preencherTabelaTreinadores();
    } catch (erro) {
        treinadoresView = [];
        preencherTabelaTreinadores();
        alert("Erro ao buscar treinadores.");
        console.error(erro);
    }
}

function abrirModalTreinador() {
    const modal = document.getElementById("modalTreinador");
    if (!modal) {
        return;
    }
    modal.classList.add("ativo");
    modal.setAttribute("aria-hidden", "false");
}

function fecharModalTreinador() {
    const modal = document.getElementById("modalTreinador");
    if (!modal) {
        return;
    }
    modal.classList.remove("ativo");
    modal.setAttribute("aria-hidden", "true");
}

function abrirModalTreinadorEdicao() {
    const modal = document.getElementById("modalTreinadorEdicao");
    if (!modal) {
        return;
    }
    modal.classList.add("ativo");
    modal.setAttribute("aria-hidden", "false");
}

function fecharModalTreinadorEdicao() {
    const modal = document.getElementById("modalTreinadorEdicao");
    if (!modal) {
        return;
    }
    modal.classList.remove("ativo");
    modal.setAttribute("aria-hidden", "true");
}

function prepararModalTreinador() {
    const botaoAbrir = document.getElementById("btnAbrirModalTreinador");
    const modal = document.getElementById("modalTreinador");

    if (!botaoAbrir || !modal) {
        return;
    }

    botaoAbrir.addEventListener("click", abrirModalTreinador);

    modal.addEventListener("click", (event) => {
        if (event.target && event.target.hasAttribute("data-modal-close")) {
            fecharModalTreinador();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("ativo")) {
            fecharModalTreinador();
        }
    });
}

function preencherModalEdicaoTreinador(treinador, form) {
    if (!form || !treinador) {
        return;
    }

    form.elements.id.value = treinador.id || "";
    form.elements.nome.value = treinador.nome || "";
    form.elements.data_nascimento.value = formatarDataParaInput(treinador.data_nascimento);
    form.elements.telefone.value = treinador.telefone || "";
    form.elements.cref.value = treinador.cref || "";
    form.elements.data_inicio.value = formatarDataParaInput(treinador.data_inicio);
    form.elements.email.value = treinador.email || "";
    form.elements.senha.value = "";
    form.elements.status.value = normalizarStatus(treinador.status);
    atualizarBotaoAlternarStatusTreinador(form);
}

function prepararModalEdicaoTreinador() {
    const lista = document.getElementById("listViewTreinadores");
    const modal = document.getElementById("modalTreinadorEdicao");
    const form = document.getElementById("formTreinadorEdicao");
    const btnAlternarStatus = form ? form.querySelector(".btnAlternarStatusTreinador") : null;

    if (!lista || !modal || !form) {
        return;
    }

    lista.addEventListener("click", async (event) => {
        const botaoEditar = event.target.closest(".btnEditarTreinador");
        if (!botaoEditar) {
            return;
        }

        const id = botaoEditar.getAttribute("data-id");
        if (!id) {
            return;
        }

        try {
            const retorno = await fetch(`../php/treinador/treinador_get.php?id=${encodeURIComponent(id)}&status=todos`);
            const resposta = await retorno.json();
            if (resposta.status !== "ok" || !Array.isArray(resposta.data) || !resposta.data[0]) {
                alert("Não foi possível carregar o treinador.");
                return;
            }

            preencherModalEdicaoTreinador(resposta.data[0], form);
            abrirModalTreinadorEdicao();
        } catch (erro) {
            alert("Erro ao carregar treinador.");
            console.error(erro);
        }
    });

    modal.addEventListener("click", (event) => {
        if (event.target && event.target.hasAttribute("data-modal-close-edit")) {
            fecharModalTreinadorEdicao();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("ativo")) {
            fecharModalTreinadorEdicao();
        }
    });

    const enviarFormularioEdicao = async (statusForcado = "") => {
        const formData = new FormData(form);
        const statusAtual = statusForcado
            ? normalizarStatus(statusForcado)
            : normalizarStatus(formData.get("status"));
        formData.set("status", statusAtual);

        const senha = String(formData.get("senha") || "").trim();
        if (senha === "") {
            formData.delete("senha");
        }

        try {
            const retorno = await fetch("../php/treinador/treinador_alterar.php", {
                method: "POST",
                body: formData,
            });
            const resposta = await retorno.json();
            if (resposta.status === "ok") {
                fecharModalTreinadorEdicao();
                await getTreinadores();
                alert("SUCESSO: " + resposta.mensagem);
                return true;
            } else {
                alert("ERRO: " + resposta.mensagem);
                return false;
            }
        } catch (erro) {
            alert("Erro ao alterar treinador.");
            console.error(erro);
            return false;
        }
    };

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        await enviarFormularioEdicao();
    });

    if (btnAlternarStatus) {
        btnAlternarStatus.addEventListener("click", async () => {
            const statusAtual = normalizarStatus(form.elements.status.value);
            const proximoStatus = statusAtual === "ativo" ? "inativo" : "ativo";
            await enviarFormularioEdicao(proximoStatus);
        });
    }
}

async function novo() {
    const formNovo = document.getElementById("meuForm");
    if (!formNovo) {
        return;
    }

    const nome = document.getElementById("nome").value;
    const data_nascimento = document.getElementById("data_nascimento").value;
    const telefone = document.getElementById("telefone").value;
    const cref = document.getElementById("cref").value;
    const data_inicio = document.getElementById("data_inicio").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const fd = new FormData();
    fd.append("nome", nome);
    fd.append("data_nascimento", data_nascimento);
    fd.append("telefone", telefone);
    fd.append("cref", cref);
    fd.append("data_inicio", data_inicio);
    fd.append("email", email);
    fd.append("senha", senha);
    fd.append("status", "ativo");

    try {
        const retorno = await fetch("../php/treinador/treinador_novo.php", {
            method: "POST",
            body: fd,
        });
        const resposta = await retorno.json();
        if (resposta.status == "ok") {
            formNovo.reset();

            await getTreinadores();
            fecharModalTreinador();
            alert("SUCESSO: " + resposta.mensagem);
        } else {
            alert("ERRO: " + resposta.mensagem);
        }
    } catch (erro) {
        alert("Erro ao cadastrar treinador.");
        console.error(erro);
    }
}

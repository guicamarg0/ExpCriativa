document.addEventListener("DOMContentLoaded", () => {
    prepararFiltroStatusAtleta();
    buscar();
    prepararModalAtleta();
    prepararModalEdicao();
    prepararModalConfirmacao();
    carregarGenerosAtivos();
    prepararMascarasCadastroAtleta();
});

let confirmarAcao = null;
let generosAtivos = [];

function escaparHtml(valor) {
    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatStatus(valor) {
    if (valor === null || typeof valor === "undefined") {
        return "-";
    }
    const texto = String(valor).toLowerCase();
    if (texto === "ativo" || texto === "ativa") {
        return "Ativo";
    }
    if (texto === "inativo" || texto === "inativa") {
        return "Inativo";
    }
    return String(valor);
}

function normalizarStatusAtleta(valor) {
    const texto = String(valor ?? "").toLowerCase();
    if (texto === "inativo" || texto === "inativa" || texto === "0") {
        return "inativo";
    }
    return "ativo";
}

function atualizarBotaoAlternarStatusAtleta(form) {
    if (!form || !form.elements.status) {
        return;
    }

    const botao = form.querySelector(".btnAlternarStatusAtleta");
    if (!botao) {
        return;
    }

    const statusAtual = normalizarStatusAtleta(form.elements.status.value);
    botao.textContent = statusAtual === "ativo" ? "Inativar" : "Ativar";
}

function formatarDataParaInput(valor) {
    if (!valor) {
        return "";
    }
    return String(valor).slice(0, 10);
}

function formatarDataExibicao(valor) {
    if (!valor) {
        return "-";
    }
    const texto = String(valor).slice(0, 10);
    const partes = texto.split("-");
    if (partes.length !== 3) {
        return texto;
    }
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function normalizarNomeGenero(nome) {
    return String(nome ?? "").trim().toLowerCase();
}

function aplicarMascaraDecimal(input, maxInteiros = 3) {
    if (!input) {
        return;
    }

    input.addEventListener("input", () => {
        let valor = String(input.value || "").replace(/[^\d,\.]/g, "");
        valor = valor.replace(/\./g, ",");

        const primeiraVirgula = valor.indexOf(",");
        if (primeiraVirgula >= 0) {
            const inteiro = valor
                .slice(0, primeiraVirgula)
                .replace(/,/g, "")
                .slice(0, maxInteiros);
            const decimal = valor
                .slice(primeiraVirgula + 1)
                .replace(/,/g, "")
                .slice(0, 2);

            input.value = decimal.length > 0 ? `${inteiro},${decimal}` : `${inteiro},`;
            return;
        }

        input.value = valor.replace(/,/g, "").slice(0, maxInteiros);
    });
}

function normalizarDecimalParaEnvio(valor) {
    const texto = String(valor ?? "").trim().replace(/\s+/g, "");
    if (texto === "") {
        return "";
    }

    if (texto.includes(",")) {
        return texto.replace(/\./g, "").replace(",", ".");
    }

    const partes = texto.split(".");
    if (partes.length <= 1) {
        return texto;
    }

    const decimal = partes.pop();
    const inteiro = partes.join("");
    return `${inteiro}.${decimal}`;
}

function formatarDecimalParaCampo(valor) {
    if (valor === null || typeof valor === "undefined" || valor === "") {
        return "";
    }
    return String(valor).replace(".", ",");
}

function prepararMascarasCadastroAtleta() {
    const campoAltura = document.getElementById("alturaAtleta");
    const campoPeso = document.getElementById("pesoAtleta");
    const campoAlturaEdicao = document.querySelector("#modalAtletaEdicao input[name='altura']");
    const campoPesoEdicao = document.querySelector("#modalAtletaEdicao input[name='peso']");

    aplicarMascaraDecimal(campoAltura, 3);
    aplicarMascaraDecimal(campoPeso, 3);
    aplicarMascaraDecimal(campoAlturaEdicao, 3);
    aplicarMascaraDecimal(campoPesoEdicao, 3);
}

function obterFiltroStatusAtleta() {
    const filtro = document.getElementById("filtroStatusAtleta");
    if (!filtro) {
        return "ativo";
    }

    const valor = String(filtro.value || "").toLowerCase();
    if (valor === "inativo" || valor === "todos") {
        return valor;
    }
    return "ativo";
}

function prepararFiltroStatusAtleta() {
    const filtro = document.getElementById("filtroStatusAtleta");
    if (!filtro) {
        return;
    }

    filtro.addEventListener("change", () => {
        buscar();
    });
}

function preencherSelectGenero(select, selecionado = "") {
    if (!select) {
        return;
    }

    let optionsHtml = '<option value="">Selecione</option>';
    for (let i = 0; i < generosAtivos.length; i++) {
        const genero = generosAtivos[i];
        optionsHtml += `<option value="${escaparHtml(genero.id)}">${escaparHtml(genero.nome || "Sem nome")}</option>`;
    }

    select.innerHTML = optionsHtml;
    select.value = selecionado ? String(selecionado) : "";
}

async function carregarGenerosAtivos() {
    try {
        const retorno = await fetch("../php/genero_get.php?status=ativo");
        const resposta = await retorno.json();
        if (resposta.status === "ok" && Array.isArray(resposta.data)) {
            generosAtivos = resposta.data.filter((genero) => {
                const nome = normalizarNomeGenero(genero.nome);
                return nome === "feminino" || nome === "masculino";
            });
        } else {
            generosAtivos = [];
        }
    } catch (erro) {
        generosAtivos = [];
        console.error(erro);
    }

    const selectCadastro = document.querySelector("#modalAtleta .selectGeneroAtleta");
    const selectEdicao = document.querySelector("#modalAtletaEdicao .selectGeneroAtletaEdicao");
    preencherSelectGenero(selectCadastro, selectCadastro ? selectCadastro.value : "");
    preencherSelectGenero(selectEdicao, selectEdicao ? selectEdicao.value : "");
}

function prepararModalConfirmacao() {
    if (window.mitraToast && typeof window.mitraToast.confirm === "function") {
        window.confirmarModal = (mensagem) => window.mitraToast.confirm(mensagem);
        return;
    }

    const modal = document.querySelector("#modalConfirmacao");
    if (!modal) {
        return;
    }

    const texto = modal.querySelector("#modalConfirmacaoTexto");
    const btnOk = modal.querySelector("[data-confirm-ok]");
    const btnCancelar = modal.querySelector("[data-confirm-cancelar]");

    const fecharModal = () => {
        modal.classList.remove("ativo");
        modal.setAttribute("aria-hidden", "true");
    };

    const resolver = (valor) => {
        if (typeof confirmarAcao === "function") {
            confirmarAcao(valor);
            confirmarAcao = null;
        }
        fecharModal();
    };

    modal.addEventListener("click", (event) => {
        if (event.target && event.target.hasAttribute("data-confirm-close")) {
            resolver(false);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("ativo")) {
            resolver(false);
        }
    });

    if (btnOk) {
        btnOk.addEventListener("click", () => resolver(true));
    }

    if (btnCancelar) {
        btnCancelar.addEventListener("click", () => resolver(false));
    }

    window.confirmarModal = (mensagem) => new Promise((resolve) => {
        if (texto) {
            texto.textContent = mensagem || "Tem certeza que deseja continuar?";
        }
        confirmarAcao = resolve;
        modal.classList.add("ativo");
        modal.setAttribute("aria-hidden", "false");
    });
}

async function buscar() {
    try {
        const status = obterFiltroStatusAtleta();
        const retorno = await fetch(`../php/atleta/atleta_get.php?status=${encodeURIComponent(status)}`);
        const resposta = await retorno.json();
        if (resposta.status === "ok") {
            preencherTabela(resposta.data);
        } else {
            preencherTabela([]);
        }
    } catch (erro) {
        preencherTabela([]);
        console.error(erro);
    }
}

function preencherTabela(tabela) {
    const lista = document.querySelector(".listViewAtletas");
    if (!lista) {
        return;
    }

    if (!tabela || tabela.length === 0) {
        lista.innerHTML = '<p class="estadoListaVazia">Nenhum atleta cadastrado.</p>';
        return;
    }

    let html = "";
    for (let i = 0; i < tabela.length; i++) {
        const atleta = tabela[i];
        const nome = atleta.nome || "Sem nome";
        const dataNascimento = formatarDataExibicao(atleta.data_nascimento);
        const genero = atleta.genero_nome || "-";
        const altura = atleta.altura || "-";
        const peso = atleta.peso || "-";
        const status = formatStatus(atleta.status);

        html += `
            <div class="linhaAtleta">
                <button class="btnEditarAtleta" data-id="${escaparHtml(atleta.id)}"><i class="bi bi-pencil-square"></i></button>
                <p title="${escaparHtml(nome)}"><b>${escaparHtml(nome)}</b></p>
                <p title="${escaparHtml(dataNascimento)}">${escaparHtml(dataNascimento)}</p>
                <p title="${escaparHtml(genero)}">${escaparHtml(genero)}</p>
                <p title="${escaparHtml(altura)}">${escaparHtml(altura)}</p>
                <p title="${escaparHtml(peso)}">${escaparHtml(peso)}</p>
                <p title="${escaparHtml(status)}">${escaparHtml(status)}</p>
            </div>
        `;
    }

    lista.innerHTML = html;
}

function prepararModalAtleta() {
    const botaoAbrir = document.querySelector("#btnAbrirModalAtleta");
    const modal = document.querySelector("#modalAtleta");
    const form = document.querySelector("#modalAtleta .modalAtletaForm");
    const selectGenero = document.querySelector("#modalAtleta .selectGeneroAtleta");

    if (!botaoAbrir || !modal || !form) {
        return;
    }

    const abrirModal = async () => {
        await carregarGenerosAtivos();
        preencherSelectGenero(selectGenero, "");
        modal.classList.add("ativo");
        modal.setAttribute("aria-hidden", "false");
    };

    const fecharModal = () => {
        modal.classList.remove("ativo");
        modal.setAttribute("aria-hidden", "true");
    };

    botaoAbrir.addEventListener("click", abrirModal);

    modal.addEventListener("click", (event) => {
        if (event.target && event.target.hasAttribute("data-modal-close")) {
            fecharModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("ativo")) {
            fecharModal();
        }
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        formData.set("status", "ativo");
        formData.set("altura", normalizarDecimalParaEnvio(formData.get("altura")));
        formData.set("peso", normalizarDecimalParaEnvio(formData.get("peso")));

        try {
            const retorno = await fetch("../php/atleta/atleta_novo.php", {
                method: "POST",
                body: formData
            });

            const resposta = await retorno.json();
            if (resposta.status === "ok") {
                form.reset();
                preencherSelectGenero(selectGenero, "");

                fecharModal();
                buscar();
            } else {
                alert(resposta.mensagem || "Falha ao cadastrar atleta.");
            }
        } catch (erro) {
            alert("Erro ao cadastrar atleta.");
            console.error(erro);
        }
    });
}

function prepararModalEdicao() {
    const lista = document.querySelector(".listViewAtletas");
    const modal = document.querySelector("#modalAtletaEdicao");
    const form = document.querySelector(".modalAtletaFormEditar");
    const btnAlternarStatus = modal ? modal.querySelector(".btnAlternarStatusAtleta") : null;
    const selectGenero = modal ? modal.querySelector(".selectGeneroAtletaEdicao") : null;

    if (!lista || !modal || !form) {
        return;
    }

    const abrirModal = () => {
        modal.classList.add("ativo");
        modal.setAttribute("aria-hidden", "false");
    };

    const fecharModal = () => {
        modal.classList.remove("ativo");
        modal.setAttribute("aria-hidden", "true");
    };

    const enviarAlteracao = async (statusForcado = "") => {
        const formData = new FormData(form);
        const status = normalizarStatusAtleta(statusForcado || formData.get("status"));
        formData.set("status", status);
        formData.set("altura", normalizarDecimalParaEnvio(formData.get("altura")));
        formData.set("peso", normalizarDecimalParaEnvio(formData.get("peso")));

        try {
            const retorno = await fetch("../php/atleta/atleta_alterar.php", {
                method: "POST",
                body: formData
            });

            const resposta = await retorno.json();
            if (resposta.status === "ok") {
                fecharModal();
                buscar();
                return true;
            }

            alert(resposta.mensagem || "Falha ao alterar cadastro do atleta.");
            return false;
        } catch (erro) {
            alert("Erro ao alterar cadastro do atleta.");
            console.error(erro);
            return false;
        }
    };

    lista.addEventListener("click", async (event) => {
        const botao = event.target.closest(".btnEditarAtleta");
        if (!botao) {
            return;
        }

        const id = botao.getAttribute("data-id");
        if (!id) {
            return;
        }

        try {
            await carregarGenerosAtivos();
            const retorno = await fetch(`../php/atleta/atleta_get.php?id=${encodeURIComponent(id)}`);
            const resposta = await retorno.json();
            if (resposta.status !== "ok" || !resposta.data || !resposta.data[0]) {
                alert("Nao foi possivel carregar o atleta.");
                return;
            }

            preencherModalEdicao(resposta.data[0], form);
            preencherSelectGenero(selectGenero, resposta.data[0].id_genero || "");
            abrirModal();
        } catch (erro) {
            alert("Erro ao carregar atleta.");
            console.error(erro);
        }
    });

    modal.addEventListener("click", (event) => {
        if (event.target && event.target.hasAttribute("data-modal-close-edit")) {
            fecharModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("ativo")) {
            fecharModal();
        }
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        await enviarAlteracao();
    });

    if (btnAlternarStatus) {
        btnAlternarStatus.addEventListener("click", async () => {
            const id = form.id.value;
            if (!id) {
                alert("Selecione um atleta para alterar o status.");
                return;
            }

            const statusAtual = normalizarStatusAtleta(form.elements.status.value);
            const proximoStatus = statusAtual === "ativo" ? "inativo" : "ativo";
            const acaoTexto = proximoStatus === "ativo" ? "ativar" : "inativar";
            const confirmou = await window.confirmarModal(`Deseja ${acaoTexto} este atleta?`);
            if (!confirmou) {
                return;
            }

            await enviarAlteracao(proximoStatus);
        });
    }
}

function preencherModalEdicao(atleta, form) {
    if (!form || !atleta) {
        return;
    }

    form.id.value = atleta.id || "";
    form.nome.value = atleta.nome || "";
    form.data_nascimento.value = formatarDataParaInput(atleta.data_nascimento);
    form.id_genero.value = atleta.id_genero || "";
    form.altura.value = formatarDecimalParaCampo(atleta.altura);
    form.peso.value = formatarDecimalParaCampo(atleta.peso);
    form.status.value = normalizarStatusAtleta(atleta.status);
    atualizarBotaoAlternarStatusAtleta(form);
}

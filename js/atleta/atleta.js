document.addEventListener("DOMContentLoaded", () => {
    buscar();
    prepararModalAtleta();
    prepararModalEdicao();
    prepararModalConfirmacao();
});

let confirmarAcao = null;

function prepararModalConfirmacao(){
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

async function buscar(){
    const retorno = await fetch("../php/atleta/atleta_get.php");
    const resposta = await retorno.json();
    if(resposta.status == "ok"){
        preencherTabela(resposta.data);
    }else{
        preencherTabela([]);
    }
}

function formatStatus(valor){
    if (valor === null || typeof valor === "undefined") {
        return "-";
    }
    if (String(valor).toLowerCase() === "ativa") {
        return "Ativa";
    }
    if (String(valor).toLowerCase() === "ativo") {
        return "Ativo";
    }
    if (valor === 1 || valor === "1" || valor === true) {
        return "Ativo";
    }
    if (valor === 0 || valor === "0" || valor === false) {
        return "Inativo";
    }
    return String(valor);
}

function preencherTabela(tabela){
    const lista = document.querySelector(".listViewAtletas");
    if (!lista) {
        return;
    }

    let html = "";
    if (!tabela || tabela.length === 0) {
        html = "<p>Nenhum atleta cadastrado.</p>";
        lista.innerHTML = html;
        return;
    }

    for (let i = 0; i < tabela.length; i++) {
        const atleta = tabela[i];
        const integrantes = atleta.integrantes || atleta.numero_integrantes || "-";

        html += `
            <div class="linhaAtleta">
                <button class="btnEditarAtleta" data-id="${atleta.id}"><i class="bi bi-pencil-square"></i></button>
                <p><b>${atleta.nome || "Sem nome"}</b></p>
                <p>Data de nascimento: ${atleta.datadenasc || "-"}</p>
                <p>Genero: ${formatStatus(atleta.id_genero) || "-"}</p>
                <p>Altura: ${atleta.altura || "-"}</p>
                <p>Peso: ${atleta.peso || "-"}</p>
            </div>
        `;
    }

    lista.innerHTML = html;
}

function prepararModalAtleta(){
    const botaoAbrir = document.querySelector("#btnAbrirModalAtleta");
    const modal = document.querySelector("#modalAtleta");
    const form = document.querySelector(".modalAtletaForm");

    if (!botaoAbrir || !modal) {
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

    if (form) {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const formData = new FormData(form);

            try {
                const retorno = await fetch("../php/atleta/atleta_novo.php", {
                    method: "POST",
                    body: formData
                });

                const resposta = await retorno.json();
                if (resposta.status === "ok") {
                    form.reset();
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
}

function prepararModalEdicao(){
    const lista = document.querySelector(".listViewAtletas");
    const modal = document.querySelector("#modalAtletaEdicao");
    const form = document.querySelector(".modalAtletaFormEditar");
    const btnExcluir = modal ? modal.querySelector(".btnExcluir") : null;

    if (!lista || !modal) {
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
            const retorno = await fetch(`../php/atleta/atleta_get.php?id=${id}`);
            const resposta = await retorno.json();
            if (resposta.status !== "ok" || !resposta.data || !resposta.data[0]) {
                alert("Nao foi possivel carregar o atleta.");
                return;
            }

            preencherModalEdicao(resposta.data[0], form);
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

    if (form) {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const formData = new FormData(form);

            try {
                const retorno = await fetch("../php/atleta/atleta_alterar.php", {
                    method: "POST",
                    body: formData
                });

                const resposta = await retorno.json();
                if (resposta.status === "ok") {
                    fecharModal();
                    buscar();
                } else {
                    alert(resposta.mensagem || "Falha ao alterar cadastro do atleta.");
                }
            } catch (erro) {
                alert("Erro ao alterar cadastro do atleta.");
                console.error(erro);
            }
        });
    }

    if (btnExcluir && form) {
        btnExcluir.addEventListener("click", async () => {
            const id = form.id.value;
            if (!id) {
                alert("Selecione um atleta para excluir.");
                return;
            }

            const confirmou = await window.confirmarModal("Deseja excluir este atleta?");
            if (!confirmou) {
                return;
            }

            try {
                const retorno = await fetch(`../php/atleta/atleta_excluir.php?id=${id}`);
                const resposta = await retorno.json();
                if (resposta.status === "ok") {
                    fecharModal();
                    buscar();
                } else {
                    alert(resposta.mensagem || "Falha ao excluir atleta.");
                }
            } catch (erro) {
                alert("Erro ao excluir atleta.");
                console.error(erro);
            }
        });
    }
}

function preencherModalEdicao(atleta, form){
    if (!form || !atleta) {
        return;
    }

    form.id.value = atleta.id || "";
    form.nome.value = atleta.nome || "";
    form.datadenasc.value = atleta.datadenasc || "";
    form.id_genero.value = atleta.id_genero || "";
    form.altura.value = atleta.alturao || "";
    form.peso.value = atleta.peso || "";
}

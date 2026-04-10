// Validação de nível de acesso: só permite admin (id_nivel == 1)
fetch('../php/valida_sessao.php')
    .then(response => response.json())
    .then(data => {
        if (data.status !== 'ok') {
            alert('Você precisa estar logado para acessar esta página.');
            window.location.href = '../login/index_login.html';
            return;
        }
        if (data.id_nivel != '1') {
            alert('Acesso restrito!');
            window.location.href = '../home/home.html';
        }
    })
    .catch(error => {
        alert('Erro ao validar sessão.');
        window.location.href = '../login/index_login.html';
    });

document.addEventListener("DOMContentLoaded", () => {
    buscar();
    prepararModalEquipe();
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
    const retorno = await fetch("../php/equipe/equipe_get.php");
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
    const lista = document.querySelector(".listViewEquipes");
    if (!lista) {
        return;
    }

    let html = "";
    if (!tabela || tabela.length === 0) {
        html = "<p>Nenhuma equipe cadastrada.</p>";
        lista.innerHTML = html;
        return;
    }

    for (let i = 0; i < tabela.length; i++) {
        const equipe = tabela[i];
        const integrantes = equipe.integrantes || equipe.numero_integrantes || "-";

        html += `
            <div class="linhaEquipe">
                <button class="btnEditarEquipe" data-id="${equipe.id}"><i class="bi bi-pencil-square"></i></button>
                <p><b>${equipe.nome || "Sem nome"}</b></p>
                <p>Modalidade: ${equipe.modalidade || "-"}</p>
                <p>Categoria: ${equipe.categoria || "-"}</p>
                <p>Genero: ${equipe.genero || "-"}</p>
                <p>Numero de integrantes: ${integrantes}</p>
                <p>Status: ${formatStatus(equipe.status)}</p>
            </div>
        `;
    }

    lista.innerHTML = html;
}

function prepararModalEquipe(){
    const botaoAbrir = document.querySelector("#btnAbrirModalEquipe");
    const modal = document.querySelector("#modalEquipe");
    const form = document.querySelector(".modalEquipeForm");

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
                const retorno = await fetch("../php/equipe/equipe_novo.php", {
                    method: "POST",
                    body: formData
                });

                const resposta = await retorno.json();
                if (resposta.status === "ok") {
                    form.reset();
                    fecharModal();
                    buscar();
                } else {
                    alert(resposta.mensagem || "Falha ao cadastrar equipe.");
                }
            } catch (erro) {
                alert("Erro ao cadastrar equipe.");
                console.error(erro);
            }
        });
    }
}

function prepararModalEdicao(){
    const lista = document.querySelector(".listViewEquipes");
    const modal = document.querySelector("#modalEquipeEdicao");
    const form = document.querySelector(".modalEquipeFormEditar");
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
        const botao = event.target.closest(".btnEditarEquipe");
        if (!botao) {
            return;
        }

        const id = botao.getAttribute("data-id");
        if (!id) {
            return;
        }

        try {
            const retorno = await fetch(`../php/equipe/equipe_get.php?id=${id}`);
            const resposta = await retorno.json();
            if (resposta.status !== "ok" || !resposta.data || !resposta.data[0]) {
                alert("Nao foi possivel carregar a equipe.");
                return;
            }

            preencherModalEdicao(resposta.data[0], form);
            abrirModal();
        } catch (erro) {
            alert("Erro ao carregar equipe.");
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
                const retorno = await fetch("../php/equipe/equipe_alterar.php", {
                    method: "POST",
                    body: formData
                });

                const resposta = await retorno.json();
                if (resposta.status === "ok") {
                    fecharModal();
                    buscar();
                } else {
                    alert(resposta.mensagem || "Falha ao alterar equipe.");
                }
            } catch (erro) {
                alert("Erro ao alterar equipe.");
                console.error(erro);
            }
        });
    }

    if (btnExcluir && form) {
        btnExcluir.addEventListener("click", async () => {
            const id = form.id.value;
            if (!id) {
                alert("Selecione uma equipe para excluir.");
                return;
            }

            const confirmou = await window.confirmarModal("Deseja excluir esta equipe?");
            if (!confirmou) {
                return;
            }

            try {
                const retorno = await fetch(`../php/equipe/equipe_excluir.php?id=${id}`);
                const resposta = await retorno.json();
                if (resposta.status === "ok") {
                    fecharModal();
                    buscar();
                } else {
                    alert(resposta.mensagem || "Falha ao excluir equipe.");
                }
            } catch (erro) {
                alert("Erro ao excluir equipe.");
                console.error(erro);
            }
        });
    }
}

function preencherModalEdicao(equipe, form){
    if (!form || !equipe) {
        return;
    }

    form.id.value = equipe.id || "";
    form.nome.value = equipe.nome || "";
    form.descricao.value = equipe.descricao || "";
    form.id_modalidade.value = equipe.id_modalidade || "";
    form.id_genero.value = equipe.id_genero || "";
    form.categoria.value = equipe.categoria || "";
    form.status.value = equipe.status || "ativa";
}

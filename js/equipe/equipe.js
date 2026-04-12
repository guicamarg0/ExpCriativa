// Validação de nível de acesso: só permite admin (id_nivel == 1)
fetch("../php/valida_sessao.php")
  .then((response) => response.json())
  .then((data) => {
    if (data.status !== "ok") {
      alert("Você precisa estar logado para acessar esta página.");
      window.location.href = "../login/index.html";
      return;
    }
    if (data.id_nivel != "1") {
      alert("Acesso restrito!");
      window.location.href = "../home/home.html";
    }
  })
  .catch((error) => {
    alert("Erro ao validar sessão.");
    window.location.href = "../login/index.html";
  });

document.addEventListener("DOMContentLoaded", () => {
  prepararFiltroStatusEquipe();
  buscar();
  carregarTreinadoresAtivos();
  carregarGenerosAtivos();
  prepararModalEquipe();
  prepararModalEdicao();
  prepararModalConfirmacao();
});

let confirmarAcao = null;
let treinadoresAtivos = [];
let generosAtivos = [];

function obterFiltroStatusEquipe() {
  const filtro = document.querySelector("#filtroStatusEquipe");
  if (!filtro) {
    return "ativa";
  }

  const valor = (filtro.value || "").toLowerCase();
  if (valor === "inativa" || valor === "todos") {
    return valor;
  }
  return "ativa";
}

function prepararFiltroStatusEquipe() {
  const filtro = document.querySelector("#filtroStatusEquipe");
  if (!filtro) {
    return;
  }

  filtro.addEventListener("change", () => {
    buscar();
  });
}

function preencherSelectTreinadorResponsavel(select, selecionado = "") {
  if (!select) {
    return;
  }

  let optionsHtml = '<option value="">Sem treinador responsavel</option>';
  for (let i = 0; i < treinadoresAtivos.length; i++) {
    const treinador = treinadoresAtivos[i];
    optionsHtml += `<option value="${escaparHtml(treinador.id)}">${escaparHtml(treinador.nome || "Sem nome")}</option>`;
  }

  select.innerHTML = optionsHtml;
  select.value = selecionado ? String(selecionado) : "";
}

function preencherSelectsTreinadorResponsavel(selecionadoEditar = "") {
  const selectCadastro = document.querySelector("#modalEquipe .selectTreinadorResponsavel");
  const selectEdicao = document.querySelector("#modalEquipeEdicao .selectTreinadorResponsavel");
  preencherSelectTreinadorResponsavel(selectCadastro, "");
  preencherSelectTreinadorResponsavel(selectEdicao, selecionadoEditar);
}

async function carregarTreinadoresAtivos() {
  try {
    const retorno = await fetch("../php/treinador/treinador_get.php?status=ativo");
    const resposta = await retorno.json();
    if (resposta.status === "ok" && Array.isArray(resposta.data)) {
      treinadoresAtivos = resposta.data;
    } else {
      treinadoresAtivos = [];
    }
    preencherSelectsTreinadorResponsavel();
  } catch (erro) {
    treinadoresAtivos = [];
    preencherSelectsTreinadorResponsavel();
    console.error(erro);
  }
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

function preencherSelectsGenero(selecionadoEditar = "") {
  const selectCadastro = document.querySelector("#modalEquipe .selectGenero");
  const selectEdicao = document.querySelector("#modalEquipeEdicao .selectGenero");
  preencherSelectGenero(selectCadastro, "");
  preencherSelectGenero(selectEdicao, selecionadoEditar);
}

async function carregarGenerosAtivos() {
  try {
    const retorno = await fetch("../php/genero_get.php?status=ativo");
    const resposta = await retorno.json();
    if (resposta.status === "ok" && Array.isArray(resposta.data)) {
      generosAtivos = resposta.data;
    } else {
      generosAtivos = [];
    }
    preencherSelectsGenero();
  } catch (erro) {
    generosAtivos = [];
    preencherSelectsGenero();
    console.error(erro);
  }
}

function prepararModalConfirmacao() {
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

  window.confirmarModal = (mensagem) =>
    new Promise((resolve) => {
      if (texto) {
        texto.textContent = mensagem || "Tem certeza que deseja continuar?";
      }
      confirmarAcao = resolve;
      modal.classList.add("ativo");
      modal.setAttribute("aria-hidden", "false");
    });
}

async function buscar() {
  const status = obterFiltroStatusEquipe();
  const retorno = await fetch(
    `../php/equipe/equipe_get.php?status=${encodeURIComponent(status)}`,
  );
  const resposta = await retorno.json();
  if (resposta.status == "ok") {
    preencherTabela(resposta.data);
  } else {
    preencherTabela([]);
  }
}

function formatStatus(valor) {
  if (valor === null || typeof valor === "undefined") {
    return "-";
  }
  if (String(valor).toLowerCase() === "ativa") {
    return "Ativa";
  }
  if (String(valor).toLowerCase() === "inativa") {
    return "Inativa";
  }
  if (String(valor).toLowerCase() === "ativo") {
    return "Ativo";
  }
  if (String(valor).toLowerCase() === "inativo") {
    return "Inativo";
  }
  if (valor === 1 || valor === "1" || valor === true) {
    return "Ativo";
  }
  if (valor === 0 || valor === "0" || valor === false) {
    return "Inativo";
  }
  return String(valor);
}

function escaparHtml(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function preencherTabela(tabela) {
  const lista = document.querySelector(".listViewEquipes");
  if (!lista) {
    return;
  }

  let html = "";
  if (!tabela || tabela.length === 0) {
    html = '<p class="estadoListaVazia">Nenhuma equipe cadastrada.</p>';
    lista.innerHTML = html;
    return;
  }

  for (let i = 0; i < tabela.length; i++) {
    const equipe = tabela[i];
    const nome = equipe.nome || "Sem nome";
    const modalidade = equipe.modalidade || "-";
    const categoria = equipe.categoria || "-";
    const genero = equipe.genero || "-";
    const treinadorResponsavel = equipe.treinador_responsavel_nome || "-";
    const integrantes = equipe.integrantes || equipe.numero_integrantes || "-";
    const status = formatStatus(equipe.status);

    html += `
            <div class="linhaEquipe">
                <button class="btnEditarEquipe" data-id="${escaparHtml(equipe.id)}"><i class="bi bi-pencil-square"></i></button>
                <p title="${escaparHtml(nome)}"><b>${escaparHtml(nome)}</b></p>
                <p title="${escaparHtml(modalidade)}">${escaparHtml(modalidade)}</p>
                <p title="${escaparHtml(categoria)}">${escaparHtml(categoria)}</p>
                <p title="${escaparHtml(genero)}">${escaparHtml(genero)}</p>
                <p title="${escaparHtml(treinadorResponsavel)}">${escaparHtml(treinadorResponsavel)}</p>
                <p title="${escaparHtml(integrantes)}">${escaparHtml(integrantes)}</p>
                <p title="${escaparHtml(status)}">${escaparHtml(status)}</p>
            </div>
        `;
  }

  lista.innerHTML = html;
}

function prepararModalEquipe() {
  const botaoAbrir = document.querySelector("#btnAbrirModalEquipe");
  const modal = document.querySelector("#modalEquipe");
  const form = document.querySelector("#modalEquipe .modalEquipeForm");
  const selectTreinador = document.querySelector(
    "#modalEquipe .selectTreinadorResponsavel",
  );
  const selectGenero = document.querySelector("#modalEquipe .selectGenero");

  if (!botaoAbrir || !modal) {
    return;
  }

  const abrirModal = async () => {
    await carregarTreinadoresAtivos();
    await carregarGenerosAtivos();
    preencherSelectTreinadorResponsavel(selectTreinador, "");
    preencherSelectGenero(selectGenero, "");
    modal.classList.add("ativo");
    modal.setAttribute("aria-hidden", "false");
  };

  const fecharModal = () => {
    modal.classList.remove("ativo");
    modal.setAttribute("aria-hidden", "true");
  };

  botaoAbrir.addEventListener("click", () => {
    abrirModal();
  });

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
          body: formData,
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

function prepararModalEdicao() {
  const lista = document.querySelector(".listaEquipesGrid");
  const modal = document.querySelector("#modalEquipeEdicao");
  const form = document.querySelector(".modalEquipeFormEditar");
  const btnExcluir = modal ? modal.querySelector(".btnExcluir") : null;
  const selectTreinador = modal
    ? modal.querySelector(".selectTreinadorResponsavel")
    : null;
  const selectGenero = modal ? modal.querySelector(".selectGenero") : null;

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
      await carregarTreinadoresAtivos();
      await carregarGenerosAtivos();
      const retorno = await fetch(
        `../php/equipe/equipe_get.php?id=${id}&status=todos`,
      );
      const resposta = await retorno.json();
      if (resposta.status !== "ok" || !resposta.data || !resposta.data[0]) {
        alert("Nao foi possivel carregar a equipe.");
        return;
      }

      preencherModalEdicao(resposta.data[0], form);
      if (selectTreinador) {
        preencherSelectTreinadorResponsavel(
          selectTreinador,
          resposta.data[0].id_treinador_responsavel || "",
        );
      }
      if (selectGenero) {
        preencherSelectGenero(selectGenero, resposta.data[0].id_genero || "");
      }
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
          body: formData,
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

      const confirmou = await window.confirmarModal(
        "Deseja excluir esta equipe?",
      );
      if (!confirmou) {
        return;
      }

      try {
        const retorno = await fetch(
          `../php/equipe/equipe_excluir.php?id=${id}`,
        );
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

function preencherModalEdicao(equipe, form) {
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
  if (form.id_treinador_responsavel) {
    form.id_treinador_responsavel.value = equipe.id_treinador_responsavel || "";
  }
}

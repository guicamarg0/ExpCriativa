document.addEventListener("DOMContentLoaded", async () => {
  await aplicarPermissoesTelaEquipe();
  prepararFiltroStatusEquipe();
  buscar();
  carregarTreinadoresAtivos();
  carregarGenerosAtivos();
  carregarModalidadesAtivas();
  carregarAtletasAtivos();
  prepararModalEquipe();
  prepararModalEdicao();
  prepararModalConfirmacao();
  prepararModalVincularAtletas();
});

let confirmarAcao = null;
let treinadoresAtivos = [];
let generosAtivos = [];
let modalidadesAtivas = [];
let atletasAtivos = [];
const EQUIPE_STORAGE_SESSION_KEY = "mitraSessionKey";
let sessaoEquipeAtual = null;
let contextoVinculoAtletas = {
  formAlvo: null,
  equipeIdAtual: "",
  idsSelecionados: [],
};

document.addEventListener("mitra:sessao", (event) => {
  if (event.detail && event.detail.status === "ok") {
    sessaoEquipeAtual = event.detail;
    atualizarVisibilidadeBotaoAdicionarEquipe(sessaoEquipeAtual);
  }
});

function escaparHtml(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizarIds(valor) {
  if (!valor) {
    return [];
  }

  let itens = [];
  if (Array.isArray(valor)) {
    itens = valor;
  } else {
    itens = String(valor)
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");
  }

  const ids = itens
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0);

  return [...new Set(ids)];
}

function obterIdEquipeDoForm(form) {
  if (!form || !form.elements || !form.elements.id) {
    return 0;
  }
  const valor = Number(form.elements.id.value || 0);
  return Number.isInteger(valor) && valor > 0 ? valor : 0;
}

function formatarStatus(valor) {
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

function normalizarStatusEquipe(valor) {
  const texto = String(valor ?? "").toLowerCase();
  if (texto === "inativa" || texto === "inativo" || texto === "0") {
    return "inativa";
  }
  return "ativa";
}

function sessaoEhTreinador(sessao) {
  return Number(sessao?.id_nivel || 0) === 2;
}

function obterIdTreinadorSessao(sessao) {
  const valor = Number(sessao?.perfil?.id || 0);
  return Number.isInteger(valor) && valor > 0 ? valor : 0;
}

async function obterSessaoEquipeAtual() {
  if (window.mitraSessao && window.mitraSessao.status === "ok") {
    sessaoEquipeAtual = window.mitraSessao;
    return sessaoEquipeAtual;
  }

  if (sessaoEquipeAtual && sessaoEquipeAtual.status === "ok") {
    return sessaoEquipeAtual;
  }

  const sessionKey = localStorage.getItem(EQUIPE_STORAGE_SESSION_KEY) || "";
  if (!sessionKey) {
    return null;
  }

  try {
    const retorno = await fetch("../php/valida_sessao.php", {
      cache: "no-store",
      headers: {
        "X-Session-Key": sessionKey,
      },
    });
    if (!retorno.ok) {
      return null;
    }

    const resposta = await retorno.json();
    if (resposta.status === "ok") {
      sessaoEquipeAtual = resposta;
      window.mitraSessao = window.mitraSessao || resposta;
      return resposta;
    }
  } catch (erro) {
    console.error(erro);
  }

  return null;
}

function filtrarEquipesPorSessao(tabela, sessao) {
  if (!Array.isArray(tabela)) {
    return [];
  }

  if (!sessaoEhTreinador(sessao)) {
    return tabela;
  }

  const idTreinador = obterIdTreinadorSessao(sessao);
  if (!idTreinador) {
    return [];
  }

  return tabela.filter(
    (equipe) => Number(equipe.id_treinador_responsavel || 0) === idTreinador,
  );
}

function atualizarVisibilidadeBotaoAdicionarEquipe(sessao) {
  const botao = document.querySelector("#btnAbrirModalEquipe");
  if (!botao) {
    return;
  }

  const ocultar = sessaoEhTreinador(sessao);
  botao.style.display = ocultar ? "none" : "";
  botao.disabled = ocultar;
}

async function aplicarPermissoesTelaEquipe() {
  const sessao = await obterSessaoEquipeAtual();
  atualizarVisibilidadeBotaoAdicionarEquipe(sessao);
}

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
  const selectCadastro = document.querySelector(
    "#modalEquipe .selectTreinadorResponsavel",
  );
  const selectEdicao = document.querySelector(
    "#modalEquipeEdicao .selectTreinadorResponsavel",
  );
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

function preencherSelectModalidade(select, selecionado = "") {
  if (!select) {
    return;
  }

  let optionsHtml = '<option value="">Selecione</option>';
  for (let i = 0; i < modalidadesAtivas.length; i++) {
    const modalidade = modalidadesAtivas[i];
    optionsHtml += `<option value="${escaparHtml(modalidade.id)}">${escaparHtml(modalidade.nome || "Sem nome")}</option>`;
  }

  select.innerHTML = optionsHtml;
  select.value = selecionado ? String(selecionado) : "";
}

function preencherSelectsModalidade(selecionadoEditar = "") {
  const selectCadastro = document.querySelector("#modalEquipe .selectModalidade");
  const selectEdicao = document.querySelector(
    "#modalEquipeEdicao .selectModalidade",
  );
  preencherSelectModalidade(selectCadastro, "");
  preencherSelectModalidade(selectEdicao, selecionadoEditar);
}

async function carregarModalidadesAtivas() {
  try {
    const retorno = await fetch("../php/esportes/esportes_get.php?status=ativo");
    const resposta = await retorno.json();
    if (resposta.status === "ok" && Array.isArray(resposta.data)) {
      modalidadesAtivas = resposta.data;
    } else {
      modalidadesAtivas = [];
    }
    preencherSelectsModalidade();
  } catch (erro) {
    modalidadesAtivas = [];
    preencherSelectsModalidade();
    console.error(erro);
  }
}

async function carregarAtletasAtivos() {
  try {
    const retorno = await fetch("../php/atleta/atleta_get.php?status=ativo");
    const resposta = await retorno.json();
    if (resposta.status === "ok" && Array.isArray(resposta.data)) {
      atletasAtivos = resposta.data;
    } else {
      atletasAtivos = [];
    }
  } catch (erro) {
    atletasAtivos = [];
    console.error(erro);
  }
}

function formatarNumero(valor) {
  if (valor === null || typeof valor === "undefined" || valor === "") {
    return "-";
  }
  const numero = Number(valor);
  if (Number.isNaN(numero)) {
    return String(valor);
  }
  return numero.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function obterIdsAtletasSelecionados(form) {
  if (!form || !form.atletas_ids) {
    return [];
  }
  return normalizarIds(form.atletas_ids.value);
}

function definirIdsAtletasSelecionados(form, ids) {
  if (!form || !form.atletas_ids) {
    return;
  }
  const lista = normalizarIds(ids);
  form.atletas_ids.value = lista.join(",");
}

function atualizarResumoAtletasSelecionados(form) {
  if (!form) {
    return;
  }

  const resumo = form.querySelector(".resumoAtletasVinculados");
  if (!resumo) {
    return;
  }

  const ids = obterIdsAtletasSelecionados(form);
  if (!ids.length) {
    resumo.textContent = "Nenhum atleta selecionado.";
    return;
  }

  const nomes = ids
    .map((id) => atletasAtivos.find((atleta) => Number(atleta.id) === Number(id)))
    .filter((atleta) => Boolean(atleta))
    .map((atleta) => atleta.nome || "Sem nome");

  resumo.textContent =
    nomes.length > 0
      ? `${nomes.length} atleta(s): ${nomes.join(", ")}`
      : `${ids.length} atleta(s) selecionado(s).`;
}

function idsAtletasComConflito(idsAtletas, idEquipeAtual) {
  const equipeAtual = Number(idEquipeAtual || 0);
  const ids = normalizarIds(idsAtletas);
  const conflitos = [];

  for (let i = 0; i < ids.length; i++) {
    const atleta = atletasAtivos.find(
      (item) => Number(item.id) === Number(ids[i]),
    );
    if (!atleta) {
      continue;
    }

    const equipeAtleta = Number(atleta.id_equipe || 0);
    if (equipeAtleta > 0 && equipeAtleta !== equipeAtual) {
      conflitos.push(atleta);
    }
  }

  return conflitos;
}

function montarTabelaVinculoAtletas(idsSelecionados = [], idEquipeAtual = 0) {
  const lista = document.getElementById("listaVinculoAtletas");
  if (!lista) {
    return;
  }

  if (!atletasAtivos.length) {
    lista.innerHTML =
      '<p class="estadoListaVazia">Nenhum atleta ativo disponível para vínculo.</p>';
    return;
  }

  const idsMarcados = new Set(normalizarIds(idsSelecionados).map(Number));
  let html = `
    <div class="cabecalhoVinculoAtletas">
      <span></span>
      <span>Nome</span>
      <span>Altura</span>
      <span>Peso</span>
      <span>Equipe atual</span>
    </div>
  `;

  for (let i = 0; i < atletasAtivos.length; i++) {
    const atleta = atletasAtivos[i];
    const id = Number(atleta.id || 0);
    const marcado = idsMarcados.has(id) ? "checked" : "";
    const equipeAtualAtleta = atleta.equipe_nome || "-";
    const classeConflito =
      Number(atleta.id_equipe || 0) > 0 &&
      Number(atleta.id_equipe || 0) !== Number(idEquipeAtual || 0)
        ? " linhaConflitoVinculo"
        : "";

    html += `
      <label class="linhaVinculoAtleta${classeConflito}">
        <input type="checkbox" class="checkboxAtletaVinculo" value="${escaparHtml(id)}" ${marcado}>
        <p title="${escaparHtml(atleta.nome || "Sem nome")}">${escaparHtml(atleta.nome || "Sem nome")}</p>
        <p title="${escaparHtml(formatarNumero(atleta.altura))}">${escaparHtml(formatarNumero(atleta.altura))}</p>
        <p title="${escaparHtml(formatarNumero(atleta.peso))}">${escaparHtml(formatarNumero(atleta.peso))}</p>
        <p title="${escaparHtml(equipeAtualAtleta)}">${escaparHtml(equipeAtualAtleta)}</p>
      </label>
    `;
  }

  lista.innerHTML = html;
}

function prepararModalVincularAtletas() {
  const modal = document.getElementById("modalVinculoAtletas");
  const lista = document.getElementById("listaVinculoAtletas");
  const btnCancelar = modal
    ? modal.querySelector("[data-vinculo-cancelar]")
    : null;
  const btnConfirmar = modal
    ? modal.querySelector("[data-vinculo-confirmar]")
    : null;

  if (!modal || !lista) {
    return;
  }

  const abrirModal = async (formAlvo) => {
    if (!formAlvo) {
      return;
    }

    await carregarAtletasAtivos();

    const idEquipeAtual = obterIdEquipeDoForm(formAlvo);
    let idsSelecionados = obterIdsAtletasSelecionados(formAlvo);

    if (!idsSelecionados.length && idEquipeAtual > 0) {
      idsSelecionados = atletasAtivos
        .filter((atleta) => Number(atleta.id_equipe || 0) === idEquipeAtual)
        .map((atleta) => Number(atleta.id));
    }

    contextoVinculoAtletas = {
      formAlvo,
      equipeIdAtual: String(idEquipeAtual || ""),
      idsSelecionados: normalizarIds(idsSelecionados),
    };

    formAlvo.dataset.forcarVinculo = "0";

    montarTabelaVinculoAtletas(
      contextoVinculoAtletas.idsSelecionados,
      contextoVinculoAtletas.equipeIdAtual,
    );
    modal.classList.add("ativo");
    modal.setAttribute("aria-hidden", "false");
  };

  const fecharModal = () => {
    modal.classList.remove("ativo");
    modal.setAttribute("aria-hidden", "true");
  };

  document.addEventListener("click", (event) => {
    const botao = event.target.closest(".btnAbrirVinculoAtletas");
    if (!botao) {
      return;
    }

    const formAlvo = botao.closest("form");
    abrirModal(formAlvo);
  });

  modal.addEventListener("click", (event) => {
    if (event.target && event.target.hasAttribute("data-modal-vinculo-close")) {
      fecharModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("ativo")) {
      fecharModal();
    }
  });

  lista.addEventListener("change", (event) => {
    const checkbox = event.target.closest(".checkboxAtletaVinculo");
    if (!checkbox) {
      return;
    }

    const ids = new Set(normalizarIds(contextoVinculoAtletas.idsSelecionados));
    const id = Number(checkbox.value || 0);

    if (checkbox.checked) {
      ids.add(id);
    } else {
      ids.delete(id);
    }

    contextoVinculoAtletas.idsSelecionados = [...ids];
  });

  if (btnCancelar) {
    btnCancelar.addEventListener("click", () => {
      fecharModal();
    });
  }

  if (btnConfirmar) {
    btnConfirmar.addEventListener("click", async () => {
      const formAlvo = contextoVinculoAtletas.formAlvo;
      if (!formAlvo) {
        fecharModal();
        return;
      }

      const conflitos = idsAtletasComConflito(
        contextoVinculoAtletas.idsSelecionados,
        contextoVinculoAtletas.equipeIdAtual,
      );
      if (conflitos.length > 0) {
        const confirmou = await perguntarConfirmacao(
          "Algum atleta selecionado ja tem equipe, tem certeza que deseja alterar a equipe?",
        );
        if (!confirmou) {
          return;
        }
        formAlvo.dataset.forcarVinculo = "1";
      } else {
        formAlvo.dataset.forcarVinculo = "0";
      }

      definirIdsAtletasSelecionados(formAlvo, contextoVinculoAtletas.idsSelecionados);
      atualizarResumoAtletasSelecionados(formAlvo);
      fecharModal();
    });
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

async function perguntarConfirmacao(texto) {
  if (typeof window.confirmarModal === "function") {
    return window.confirmarModal(texto);
  }
  return window.confirm(texto);
}

async function buscar() {
  const status = obterFiltroStatusEquipe();
  const sessao = await obterSessaoEquipeAtual();
  try {
    const retorno = await fetch(
      `../php/equipe/equipe_get.php?status=${encodeURIComponent(status)}`,
    );
    const resposta = await retorno.json();
    if (resposta.status == "ok") {
      preencherTabela(filtrarEquipesPorSessao(resposta.data, sessao));
    } else {
      preencherTabela([]);
    }
  } catch (erro) {
    preencherTabela([]);
    console.error(erro);
  }
}

function atualizarBotaoAlternarStatusEquipe(form) {
  if (!form || !form.elements || !form.elements.status) {
    return;
  }

  const botao = form.querySelector(".btnAlternarStatusEquipe");
  if (!botao) {
    return;
  }

  const statusAtual = normalizarStatusEquipe(form.elements.status.value);
  botao.textContent = statusAtual === "ativa" ? "Inativar" : "Ativar";
}

function preencherTabela(tabela) {
  const lista = document.querySelector(".listViewEquipes");
  if (!lista) {
    return;
  }

  if (!tabela || tabela.length === 0) {
    lista.innerHTML = '<p class="estadoListaVazia">Nenhuma equipe cadastrada.</p>';
    return;
  }

  let html = "";
  for (let i = 0; i < tabela.length; i++) {
    const equipe = tabela[i];
    const nome = equipe.nome || "Sem nome";
    const modalidade = equipe.modalidade || "-";
    const categoria = equipe.categoria || "-";
    const genero = equipe.genero || "-";
    const treinadorResponsavel = equipe.treinador_responsavel_nome || "-";
    const integrantes = equipe.integrantes || equipe.numero_integrantes || "-";
    const status = formatarStatus(equipe.status);

    html += `
      <div class="linhaEquipe">
        <button class="btnEditarEquipe" data-id="${escaparHtml(equipe.id)}">
          <i class="bi bi-pencil-square"></i>
        </button>
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

async function vincularAtletasNaEquipe(idEquipe, idsAtletas, forcarVinculo = false) {
  const ids = normalizarIds(idsAtletas);
  if (!ids.length) {
    return true;
  }

  const fd = new FormData();
  fd.append("id_equipe", String(idEquipe || ""));
  fd.append("atletas_ids", ids.join(","));
  fd.append("forcar_vinculo", forcarVinculo ? "1" : "0");

  try {
    const retorno = await fetch("../php/equipe/equipe_vincular_atletas.php", {
      method: "POST",
      body: fd,
    });
    const resposta = await retorno.json();

    if (resposta.status === "ok") {
      return true;
    }

    if (resposta.status === "confirmar") {
      const confirmou = await perguntarConfirmacao(
        resposta.mensagem ||
          "Algum atleta selecionado ja tem equipe, tem certeza que deseja alterar a equipe?",
      );
      if (!confirmou) {
        return false;
      }
      return vincularAtletasNaEquipe(idEquipe, ids, true);
    }

    alert(resposta.mensagem || "Falha ao vincular atletas.");
    return false;
  } catch (erro) {
    alert("Erro ao vincular atletas.");
    console.error(erro);
    return false;
  }
}

function prepararModalEquipe() {
  const botaoAbrir = document.querySelector("#btnAbrirModalEquipe");
  const modal = document.querySelector("#modalEquipe");
  const form = document.querySelector("#modalEquipe .modalEquipeForm");
  const selectTreinador = document.querySelector(
    "#modalEquipe .selectTreinadorResponsavel",
  );
  const selectGenero = document.querySelector("#modalEquipe .selectGenero");
  const selectModalidade = document.querySelector("#modalEquipe .selectModalidade");

  if (!botaoAbrir || !modal || !form) {
    return;
  }

  const abrirModal = async () => {
    await carregarTreinadoresAtivos();
    await carregarGenerosAtivos();
    await carregarModalidadesAtivas();
    await carregarAtletasAtivos();
    form.reset();
    preencherSelectTreinadorResponsavel(selectTreinador, "");
    preencherSelectGenero(selectGenero, "");
    preencherSelectModalidade(selectModalidade, "");
    definirIdsAtletasSelecionados(form, []);
    form.dataset.forcarVinculo = "0";
    atualizarResumoAtletasSelecionados(form);
    modal.classList.add("ativo");
    modal.setAttribute("aria-hidden", "false");
  };

  const fecharModal = () => {
    modal.classList.remove("ativo");
    modal.setAttribute("aria-hidden", "true");
  };

  botaoAbrir.addEventListener("click", () => {
    if (sessaoEhTreinador(sessaoEquipeAtual || window.mitraSessao)) {
      return;
    }
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

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (sessaoEhTreinador(sessaoEquipeAtual || window.mitraSessao)) {
      alert("Treinador nao pode cadastrar equipe.");
      return;
    }

    const idsAtletas = obterIdsAtletasSelecionados(form);
    const forcarVinculo = form.dataset.forcarVinculo === "1";

    const formData = new FormData(form);
    formData.set("status", "ativa");

    try {
      const retorno = await fetch("../php/equipe/equipe_novo.php", {
        method: "POST",
        body: formData,
      });

      const resposta = await retorno.json();
      if (resposta.status !== "ok") {
        alert(resposta.mensagem || "Falha ao cadastrar equipe.");
        return;
      }

      const idEquipe = Number(resposta.data?.id || 0);
      if (idEquipe > 0 && idsAtletas.length > 0) {
        await vincularAtletasNaEquipe(idEquipe, idsAtletas, forcarVinculo);
      }

      form.reset();
      definirIdsAtletasSelecionados(form, []);
      form.dataset.forcarVinculo = "0";
      atualizarResumoAtletasSelecionados(form);
      fecharModal();
      buscar();
    } catch (erro) {
      alert("Erro ao cadastrar equipe.");
      console.error(erro);
    }
  });
}

function prepararModalEdicao() {
  const lista = document.querySelector(".listaEquipesGrid");
  const modal = document.querySelector("#modalEquipeEdicao");
  const form = document.querySelector(".modalEquipeFormEditar");
  const btnAlternarStatus = modal
    ? modal.querySelector(".btnAlternarStatusEquipe")
    : null;
  const selectTreinador = modal
    ? modal.querySelector(".selectTreinadorResponsavel")
    : null;
  const selectGenero = modal ? modal.querySelector(".selectGenero") : null;
  const selectModalidade = modal ? modal.querySelector(".selectModalidade") : null;

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
    const idsAtletas = obterIdsAtletasSelecionados(form);
    const forcarVinculo = form.dataset.forcarVinculo === "1";

    const formData = new FormData(form);
    const status = normalizarStatusEquipe(statusForcado || formData.get("status"));
    formData.set("status", status);

    try {
      const retorno = await fetch("../php/equipe/equipe_alterar.php", {
        method: "POST",
        body: formData,
      });

      const resposta = await retorno.json();
      if (resposta.status !== "ok") {
        alert(resposta.mensagem || "Falha ao alterar equipe.");
        return false;
      }

      const idEquipe = obterIdEquipeDoForm(form);
      if (idEquipe > 0 && idsAtletas.length > 0) {
        await vincularAtletasNaEquipe(idEquipe, idsAtletas, forcarVinculo);
      }

      fecharModal();
      buscar();
      return true;
    } catch (erro) {
      alert("Erro ao alterar equipe.");
      console.error(erro);
      return false;
    }
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
      await carregarModalidadesAtivas();
      await carregarAtletasAtivos();
      const retorno = await fetch(
        `../php/equipe/equipe_get.php?id=${id}&status=todos`,
      );
      const resposta = await retorno.json();
      if (resposta.status !== "ok" || !resposta.data || !resposta.data[0]) {
        alert("Nao foi possivel carregar a equipe.");
        return;
      }

      const sessao = await obterSessaoEquipeAtual();
      if (sessaoEhTreinador(sessao)) {
        const idTreinadorSessao = obterIdTreinadorSessao(sessao);
        const idTreinadorEquipe = Number(
          resposta.data[0].id_treinador_responsavel || 0,
        );
        if (!idTreinadorSessao || idTreinadorEquipe !== idTreinadorSessao) {
          alert("Voce so pode acessar equipes vinculadas ao seu cadastro.");
          return;
        }
      }

      preencherModalEdicao(resposta.data[0], form);

      const idsAtuaisEquipe = atletasAtivos
        .filter((atleta) => Number(atleta.id_equipe || 0) === Number(id))
        .map((atleta) => Number(atleta.id));
      definirIdsAtletasSelecionados(form, idsAtuaisEquipe);
      form.dataset.forcarVinculo = "0";
      atualizarResumoAtletasSelecionados(form);

      if (selectTreinador) {
        preencherSelectTreinadorResponsavel(
          selectTreinador,
          resposta.data[0].id_treinador_responsavel || "",
        );
      }
      if (selectGenero) {
        preencherSelectGenero(selectGenero, resposta.data[0].id_genero || "");
      }
      if (selectModalidade) {
        preencherSelectModalidade(
          selectModalidade,
          resposta.data[0].id_modalidade || "",
        );
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

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await enviarAlteracao();
  });

  if (btnAlternarStatus) {
    btnAlternarStatus.addEventListener("click", async () => {
      const id = obterIdEquipeDoForm(form);
      if (!id) {
        alert("Selecione uma equipe para alterar o status.");
        return;
      }

      const statusAtual = normalizarStatusEquipe(form.elements.status.value);
      const proximoStatus = statusAtual === "ativa" ? "inativa" : "ativa";
      const acaoTexto = proximoStatus === "ativa" ? "ativar" : "inativar";
      const confirmou = await perguntarConfirmacao(
        `Deseja ${acaoTexto} esta equipe?`,
      );
      if (!confirmou) {
        return;
      }

      await enviarAlteracao(proximoStatus);
    });
  }
}

function preencherModalEdicao(equipe, form) {
  if (!form || !form.elements || !equipe) {
    return;
  }

  if (form.elements.id) {
    form.elements.id.value = equipe.id || "";
  }
  if (form.elements.nome) {
    form.elements.nome.value = equipe.nome || "";
  }
  if (form.elements.descricao) {
    form.elements.descricao.value = equipe.descricao || "";
  }
  if (form.elements.id_modalidade) {
    form.elements.id_modalidade.value = equipe.id_modalidade || "";
  }
  if (form.elements.id_genero) {
    form.elements.id_genero.value = equipe.id_genero || "";
  }
  if (form.elements.categoria) {
    form.elements.categoria.value = equipe.categoria || "";
  }
  if (form.elements.status) {
    form.elements.status.value = normalizarStatusEquipe(equipe.status);
  }
  atualizarBotaoAlternarStatusEquipe(form);

  if (form.elements.id_treinador_responsavel) {
    form.elements.id_treinador_responsavel.value =
      equipe.id_treinador_responsavel || "";
  }
}

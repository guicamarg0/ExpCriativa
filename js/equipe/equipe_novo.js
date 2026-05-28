let atletasEquipe = [];
let atletasSelecionados = [];
let atletasRascunho = [];

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formEquipeNovo");
  if (!form) {
    return;
  }

  await popularSelect("id_modalidade", "../php/esportes/esportes_get.php", "Selecione uma modalidade");
  await popularSelect("id_genero", "../php/genero_get.php", "Selecione um genero");
  await popularSelect("id_treinador_responsavel", "../php/treinador/treinador_get.php", "Selecione um treinador");
  await carregarAtletasEquipe();
  configurarModalAtletas();
  atualizarAtletasSelecionados(form);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validarEquipe(form)) {
      return;
    }

    const formData = new FormData(form);
    formData.set("status", "ativa");

    const retorno = await fetch("../php/equipe/equipe_novo.php", {
      method: "POST",
      body: formData
    });
    const resposta = await retorno.json();
    const idEquipe = resposta?.data?.id;
    const idsAtletas = formData.get("atletas_ids") || "";

    if (idEquipe) {
      const vinculoData = new FormData();
      vinculoData.append("id_equipe", String(idEquipe));
      vinculoData.append("atletas_ids", String(idsAtletas));
      vinculoData.append("forcar_vinculo", "0");
      await fetch("../php/equipe/equipe_vincular_atletas.php", {
        method: "POST",
        body: vinculoData
      });
    }

    window.location.href = "equipe.html";
  });
});

async function popularSelect(selectId, url, placeholder) {
  const select = document.getElementById(selectId);
  if (!select) {
    return;
  }

  select.innerHTML = `<option value="">${placeholder}</option>`;
  const retorno = await fetch(url);
  const resposta = await retorno.json();

  for (let i = 0; i < (resposta.data || []).length; i++) {
    const registro = resposta.data[i];
    const option = document.createElement("option");
    option.value = String(registro.id ?? "");
    option.textContent = String(registro.nome ?? "");
    select.appendChild(option);
  }
}

async function carregarAtletasEquipe() {
  const retorno = await fetch("../php/atleta/atleta_get.php");
  const resposta = await retorno.json();
  atletasEquipe = resposta.data || [];
}

function configurarModalAtletas() {
  document.getElementById("btnAbrirModalAtletas")?.addEventListener("click", abrirModalAtletas);
  document.getElementById("btnFecharModalAtletas")?.addEventListener("click", fecharModalAtletas);
  document.getElementById("btnCancelarAtletas")?.addEventListener("click", fecharModalAtletas);
  document.getElementById("modalAtletasEquipeOverlay")?.addEventListener("click", fecharModalAtletas);
  document.getElementById("btnConfirmarAtletas")?.addEventListener("click", confirmarAtletas);
}

function abrirModalAtletas() {
  atletasRascunho = [...atletasSelecionados];
  renderizarModalAtletas();
  document.getElementById("modalAtletasEquipe")?.classList.add("ativo");
}

function fecharModalAtletas() {
  document.getElementById("modalAtletasEquipe")?.classList.remove("ativo");
}

function confirmarAtletas() {
  atletasSelecionados = [...atletasRascunho];
  atualizarAtletasSelecionados(document.getElementById("formEquipeNovo"));
  fecharModalAtletas();
}

function renderizarModalAtletas() {
  const listaDisponiveis = document.getElementById("listaAtletasDisponiveis");
  const listaSelecionados = document.getElementById("listaAtletasSelecionados");

  listaDisponiveis.innerHTML = "";
  listaSelecionados.innerHTML = "";

  const disponiveis = atletasEquipe.filter(
    (atleta) => !atletasRascunho.includes(String(atleta.id))
  );
  const selecionados = atletasEquipe.filter(
    (atleta) => atletasRascunho.includes(String(atleta.id))
  );

  preencherListaAtletas(listaDisponiveis, disponiveis, "adicionar");
  preencherListaAtletas(listaSelecionados, selecionados, "remover");
}

function preencherListaAtletas(container, atletas, acao) {
  if (atletas.length === 0) {
    container.innerHTML = `<div class="estadoModalAtletas">Nenhum atleta.</div>`;
    return;
  }

  for (let i = 0; i < atletas.length; i++) {
    const atleta = atletas[i];
    const item = document.createElement("div");
    item.className = "itemModalAtleta";

    const nome = document.createElement("span");
    nome.textContent = `${atleta.id} - ${atleta.nome || "Atleta"}`;

    const botao = document.createElement("button");
    botao.type = "button";
    botao.textContent = acao === "adicionar" ? "Selecionar" : "Remover";
    if (acao === "remover") {
      botao.className = "btnRemoverAtleta";
    }
    botao.addEventListener("click", () => {
      if (acao === "adicionar") {
        atletasRascunho.push(String(atleta.id));
      } else {
        atletasRascunho = atletasRascunho.filter((id) => id !== String(atleta.id));
      }
      renderizarModalAtletas();
    });

    item.appendChild(nome);
    item.appendChild(botao);
    container.appendChild(item);
  }
}

function atualizarAtletasSelecionados(form) {
  const campoIds = form.elements.atletas_ids;
  const resumo = document.getElementById("atletasSelecionadosResumo");
  campoIds.value = atletasSelecionados.join(",");

  if (atletasSelecionados.length === 0) {
    resumo.textContent = "Nenhum atleta selecionado.";
    return;
  }

  const nomes = atletasEquipe
    .filter((atleta) => atletasSelecionados.includes(String(atleta.id)))
    .map((atleta) => atleta.nome || `Atleta ${atleta.id}`);
  resumo.textContent = nomes.join(", ");
}

function validarEquipe(form) {
  const campos = form.querySelectorAll("[required]");

  for (let i = 0; i < campos.length; i++) {
    const campo = campos[i];
    campo.classList.remove("campo-invalido");

    if (!String(campo.value || "").trim()) {
      campo.classList.add("campo-invalido");
      campo.focus();
      mostrarToast("Preencha todos os campos obrigatorios.", "aviso");
      return false;
    }
  }

  if (atletasSelecionados.length === 0) {
    document.getElementById("btnAbrirModalAtletas").focus();
    mostrarToast("Selecione pelo menos um atleta para a equipe.", "aviso");
    return false;
  }

  return true;
}

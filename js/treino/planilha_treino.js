var usuarioLogado = {};

document.addEventListener("DOMContentLoaded", async () => {
  const url = new URLSearchParams(window.location.search);
  const id = url.get("id");
  usuarioLogado = obterUsuarioLogado();

  if (!id) {
    window.location.replace("atletas_treino.html");
    return;
  }

  document.getElementById("novo").addEventListener("click", () => {
    window.location.href = `treino_novo.html?id_atleta=${id}`;
  });

  buscarAtleta(id);
  buscarTreinos(id);
});

async function excluir(id) {
  const retorno = await fetch("../php/treino/treino_excluir.php?id=" + id);
  const resposta = await retorno.json();

  if (resposta.status == "ok") {
    window.location.reload();
  } else {
    alert(resposta.mensagem);
  }
}

async function buscarAtleta(id) {
  const retorno = await fetch("../php/atleta/atleta_get.php?id=" + id);
  const resposta = await retorno.json();

  if (resposta.status == "ok" && (resposta.data || []).length > 0) {
    document.getElementById("nome_atleta").innerHTML = resposta.data[0].nome || "";
  }
}

async function buscarTreinos(id) {
  const retorno = await fetch("../php/treino/treino_get.php?id_atleta=" + id);
  const resposta = await retorno.json();

  if (resposta.status == "ok" && (resposta.data || []).length > 0) {
    preencherCards(resposta.data);
  } else {
    document.getElementById("cards_treino").innerHTML = "<p>Nenhum treino cadastrado para esse atleta</p>";
  }
}

function preencherCards(tabela) {
  var html = "";
  var atletaPodePreencher = usuarioEhAtleta();

  for (var i = 0; i < tabela.length; i++) {
    var treino = tabela[i] || {};
    var dataTreino = treino.data_inicio || treino.data || "";
    var tituloTreino = treino.titulo || treino.modalidade || "";
    var descricaoTreino = treino.descricao || treino.detalhes || "";
    var treinador = treino.nome_treinador || "";
    var idTreinoAtleta = treino.id_treino_atleta || "";

    html += `
      <div class="card-treino">
        <h3>${formatarData(dataTreino)}</h3>
        <p><strong>Treino:</strong> ${tituloTreino}</p>
        <p><strong>Detalhes:</strong> ${descricaoTreino}</p>
        <p><strong>Treino montado pelo treinador: </strong> ${treinador}</p>
        <a href="treino_alterar.html?id=${treino.id}">Alterar</a>
        <a href="#" onclick="excluir(${treino.id})">Excluir</a>

        <div class="area-desempenho">
          <h4>Metricas do treino</h4>
          <div id="metricas_treino_${treino.id}"></div>
          ${atletaPodePreencher ? `<button type="button" class="btn-metrica" onclick="abrirModalMetricas(${treino.id})">Registrar metricas</button>` : ""}
          <div class="modal-metrica" id="modal_metricas_${treino.id}">
            <div class="modal-metrica-caixa">
              <div class="modal-metrica-topo">
                <h4>Registrar metricas</h4>
                <button type="button" onclick="fecharModalMetricas(${treino.id})">x</button>
              </div>
              <div id="form_metricas_${treino.id}"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  document.getElementById("cards_treino").innerHTML = html;

  for (var j = 0; j < tabela.length; j++) {
    carregarMetricasDoTreino(tabela[j].id, tabela[j].id_treino_atleta);
  }
}

async function carregarMetricasDoTreino(idTreino, idTreinoAtleta) {
  const retorno = await fetch("../php/treino_metricas/treino_metricas_get.php?id_treino=" + idTreino);
  const resposta = await retorno.json();
  const div = document.getElementById("metricas_treino_" + idTreino);
  const divFormulario = document.getElementById("form_metricas_" + idTreino);

  if (!div) {
    return;
  }

  if (resposta.status != "ok") {
    div.innerHTML = "<p>Nenhuma metrica vinculada ao treino.</p>";
    if (divFormulario) {
      divFormulario.innerHTML = "<p>Nenhuma metrica vinculada ao treino.</p>";
    }
    return;
  }

  var dados = resposta.data || [];
  var desempenhos = await buscarDesempenhos(idTreinoAtleta);
  var desempenhosPorMetrica = {};

  for (var d = 0; d < desempenhos.length; d++) {
    var idMetricaDesempenho = String(desempenhos[d].id_metrica || "");

    if (!desempenhosPorMetrica[idMetricaDesempenho]) {
      desempenhosPorMetrica[idMetricaDesempenho] = desempenhos[d];
    }
  }

  var html = `
    <table class="tabela-metricas">
      <thead>
        <tr>
          <th>Metrica</th>
          <th>Valor</th>
          <th>Observacao</th>
        </tr>
      </thead>
      <tbody>
  `;
  var htmlFormulario = "";
  var idsMetricas = [];

  for (var i = 0; i < dados.length; i++) {
    var metrica = dados[i];
    var desempenho = desempenhosPorMetrica[String(metrica.id)] || {};
    var valorPreenchido = desempenho.valor !== undefined && desempenho.valor !== null && desempenho.valor !== "";
    var valor = valorPreenchido ? formatarValorMetrica(desempenho.valor, metrica) : "N/A";
    var observacao = desempenho.observacao || "N/A";
    var observacaoInput = desempenho.observacao || "";
    idsMetricas.push(metrica.id);

    html += `
      <tr>
        <td>${metrica.nome} ${metrica.unidade_medida ? "(" + metrica.unidade_medida + ")" : ""}</td>
        <td>${valor}</td>
        <td>${observacao}</td>
      </tr>
    `;

    htmlFormulario += `
      <div class="linha-desempenho">
        <label for="valor_${idTreinoAtleta}_${metrica.id}">${metrica.nome} ${metrica.unidade_medida ? "(" + metrica.unidade_medida + ")" : ""}</label>
        ${montarCampoValorMetrica(idTreinoAtleta, metrica, desempenho.valor || "")}
        <input type="text" id="observacao_${idTreinoAtleta}_${metrica.id}" placeholder="Observacao" value="${observacaoInput}">
      </div>
    `;
  }

  htmlFormulario += `
    <button type="button" class="btn-metrica" onclick="salvarMetricasTreino(${idTreinoAtleta}, ${idTreino}, '${idsMetricas.join(",")}')">Salvar metricas</button>
  `;

  html += `
      </tbody>
    </table>
  `;

  div.innerHTML = html;

  if (divFormulario) {
    divFormulario.innerHTML = htmlFormulario;
  }
}

async function salvarMetricasTreino(idTreinoAtleta, idTreino, idsTexto) {
  var ids = String(idsTexto || "").split(",");
  var salvouAlguma = false;

  for (var i = 0; i < ids.length; i++) {
    var idMetrica = ids[i];
    var valor = pegarValorMetrica(idTreinoAtleta, idMetrica);
    var observacaoCampo = document.getElementById("observacao_" + idTreinoAtleta + "_" + idMetrica);

    if (valor === "") {
      continue;
    }

    const fd = new FormData();
    fd.append("id_treino_atleta", idTreinoAtleta);
    fd.append("id_metrica", idMetrica);
    fd.append("valor", valor);
    fd.append("observacao", observacaoCampo ? observacaoCampo.value : "");

    const retorno = await fetch("../php/desempenho/desempenho_novo.php", {
      method: "POST",
      body: fd
    });
    const resposta = await retorno.json();

    if (resposta.status != "ok") {
      alert(resposta.mensagem || "Nao foi possivel salvar uma das metricas.");
      return;
    }

    salvouAlguma = true;
  }

  if (!salvouAlguma) {
    alert("Preencha pelo menos uma metrica.");
    return;
  }

  fecharModalMetricas(idTreino);
  carregarMetricasDoTreino(idTreino, idTreinoAtleta);
}

async function buscarDesempenhos(idTreinoAtleta) {
  if (!idTreinoAtleta) {
    return [];
  }

  const retorno = await fetch("../php/desempenho/desempenho_get.php?id_treino_atleta=" + idTreinoAtleta);
  const resposta = await retorno.json();

  if (resposta.status != "ok") {
    return [];
  }

  return resposta.data || [];
}

function montarCampoValorMetrica(idTreinoAtleta, metrica, valorAtual) {
  var tipo = metrica.tipo || "numero";
  var idBase = idTreinoAtleta + "_" + metrica.id;

  if (tipo == "escala_0_10") {
    return `<input type="number" min="0" max="10" step="1" id="valor_${idBase}" placeholder="0 a 10" value="${valorAtual}">`;
  }

  if (tipo == "aproveitamento") {
    var partes = String(valorAtual || "").split("/");
    var acertos = partes.length == 2 ? partes[0] : "";
    var tentativas = partes.length == 2 ? partes[1] : "";

    return `
      <div class="campos-aproveitamento">
        <input type="number" min="0" step="1" id="acertos_${idBase}" placeholder="Acertos" value="${acertos}">
        <input type="number" min="0" step="1" id="tentativas_${idBase}" placeholder="Tentativas" value="${tentativas}">
      </div>
    `;
  }

  return `<input type="number" step="0.01" id="valor_${idBase}" placeholder="Valor" value="${valorAtual}">`;
}

function pegarValorMetrica(idTreinoAtleta, idMetrica) {
  var valorCampo = document.getElementById("valor_" + idTreinoAtleta + "_" + idMetrica);

  if (valorCampo) {
    return valorCampo.value;
  }

  var acertosCampo = document.getElementById("acertos_" + idTreinoAtleta + "_" + idMetrica);
  var tentativasCampo = document.getElementById("tentativas_" + idTreinoAtleta + "_" + idMetrica);

  if (acertosCampo && tentativasCampo && acertosCampo.value !== "" && tentativasCampo.value !== "") {
    return acertosCampo.value + "/" + tentativasCampo.value;
  }

  return "";
}

function formatarValorMetrica(valor, metrica) {
  if ((metrica.tipo || "") == "aproveitamento") {
    return valor;
  }

  if (metrica.unidade_medida) {
    return valor + " " + metrica.unidade_medida;
  }

  return valor;
}

function formatarData(data) {
  if (!data) {
    return "";
  }

  data = String(data).slice(0, 10);
  const partes = data.split("-");

  if (partes.length != 3) {
    return data;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function abrirModalMetricas(idTreino) {
  var modal = document.getElementById("modal_metricas_" + idTreino);

  if (modal) {
    modal.classList.add("aberto");
  }
}

function fecharModalMetricas(idTreino) {
  var modal = document.getElementById("modal_metricas_" + idTreino);

  if (modal) {
    modal.classList.remove("aberto");
  }
}

function obterUsuarioLogado() {
  try {
    return JSON.parse(localStorage.getItem("mitraUsuario") || "{}");
  } catch (erro) {
    return {};
  }
}

function usuarioEhAtleta() {
  return String(usuarioLogado.id_nivel || "") == "3";
}

var metricas = [];
var metricasMarcadas = [];

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formTreinoEdicao");
  if (!form) {
    return;
  }

  const idTreino = new URLSearchParams(window.location.search).get("id");
  if (!idTreino) {
    window.location.href = "atletas_treino.html";
    return;
  }

  const retornoTreino = await fetch(`../php/treino/treino_get.php?id=${idTreino}`);
  const respostaTreino = await retornoTreino.json();
  const treino = (respostaTreino.data || [])[0] || {};

  if (!treino.id) {
    alert(`Erro: ${respostaTreino.mensagem || "Treino não encontrado."}`);
    window.location.href = "atletas_treino.html";
    return;
  }

  form.elements.id.value = treino.id || "";
  form.elements.id_atleta.value = treino.id_atleta || "";
  form.elements.id_treinador.value = treino.id_treinador || "";
  form.elements.modalidade.value = treino.titulo || "";
  form.elements.data.value = treino.data_inicio ? String(treino.data_inicio).slice(0, 10) : "";
  form.elements.detalhes.value = treino.descricao || "";

  const retornoAtleta = await fetch(`../php/atleta/atleta_get.php?id=${treino.id_atleta}`);
  const respostaAtleta = await retornoAtleta.json();
  if ((respostaAtleta.data || []).length > 0) {
    form.elements.atleta.value = respostaAtleta.data[0].nome || "";
  }

  await buscarMetricas();
  await buscarMetricasDoTreino(idTreino);

  document.getElementById("btnCadastrarMetrica").addEventListener("click", async () => {
    await cadastrarMetrica();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const retorno = await fetch(`../php/treino/treino_alterar.php?id=${idTreino}`, {
      method: "POST",
      body: formData
    });
    const resposta = await retorno.json();

    if (resposta.status === "ok") {
      const metricasSalvas = await salvarMetricasDoTreino(idTreino);

      if (!metricasSalvas) {
        return;
      }

      window.location.href = `planilha_treino.html?id=${form.elements.id_atleta.value}`;
      return;
    }

    alert(`Erro: ${resposta.mensagem || "Não foi possível salvar as alterações."}`);
  });
});

async function buscarMetricas() {
  const retorno = await fetch("../php/metrica/metrica_get.php");
  const resposta = await retorno.json();

  if (resposta.status == "ok") {
    metricas = resposta.data || [];
  }
}

async function buscarMetricasDoTreino(idTreino) {
  const retorno = await fetch("../php/treino_metricas/treino_metricas_get.php?id_treino=" + idTreino);
  const resposta = await retorno.json();
  metricasMarcadas = [];

  if (resposta.status == "ok") {
    for (var i = 0; i < (resposta.data || []).length; i++) {
      metricasMarcadas.push(String(resposta.data[i].id));
    }
  }

  montarMetricas(metricasMarcadas);
}

function montarMetricas(marcadas) {
  var html = "";

  for (var i = 0; i < metricas.length; i++) {
    var metrica = metricas[i];
    var nome = String(metrica.nome || "").toLowerCase();

    if (nome == "percepcao de esforco") {
      continue;
    }

    var checked = marcadas.includes(String(metrica.id)) ? "checked" : "";
    html += `
      <label>
        <input type="checkbox" name="metricas_treino" value="${metrica.id}" ${checked}>
        ${metrica.nome} ${metrica.unidade_medida ? "(" + metrica.unidade_medida + ")" : ""}
      </label>
    `;
  }

  document.getElementById("lista_metricas").innerHTML = html || "<p>Nenhuma metrica cadastrada.</p>";
}

async function cadastrarMetrica() {
  const nome = document.getElementById("nova_metrica_nome").value;
  const unidade = document.getElementById("nova_metrica_unidade").value;
  const tipo = document.getElementById("nova_metrica_tipo").value;
  const descricao = document.getElementById("nova_metrica_descricao").value;

  const fd = new FormData();
  fd.append("nome", nome);
  fd.append("unidade_medida", unidade);
  fd.append("tipo", tipo);
  fd.append("descricao", descricao);
  fd.append("status", "ativo");

  const retorno = await fetch("../php/metrica/metrica_novo.php", {
    method: "POST",
    body: fd
  });
  const resposta = await retorno.json();

  if (resposta.status == "ok") {
    document.getElementById("nova_metrica_nome").value = "";
    document.getElementById("nova_metrica_unidade").value = "";
    document.getElementById("nova_metrica_tipo").value = "numero";
    document.getElementById("nova_metrica_descricao").value = "";
    await buscarMetricas();
    montarMetricas(metricasMarcadas);
  } else {
    alert(resposta.mensagem);
  }
}

async function salvarMetricasDoTreino(idTreino) {
  var checks = document.querySelectorAll('input[name="metricas_treino"]:checked');
  var ids = [];

  for (var i = 0; i < checks.length; i++) {
    ids.push(checks[i].value);
  }

  const fd = new FormData();
  fd.append("id_treino", idTreino);
  fd.append("metricas_ids", ids.join(","));

  const retorno = await fetch("../php/treino_metricas/treino_metricas_salvar.php", {
    method: "POST",
    body: fd
  });
  const resposta = await retorno.json();

  if (resposta.status != "ok") {
    alert(resposta.mensagem || "Nao foi possivel salvar as metricas do treino.");
    return false;
  }

  return true;
}

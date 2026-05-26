document.addEventListener("DOMContentLoaded", async () => {
  await window.esportesSessao.aplicarPermissoesTelaEsportes();
  const lista = document.querySelector(".listViewEsportes");
  if (!lista) {
    return;
  }
  const retornoEsportes = await fetch("../php/esportes/esportes_get.php");
  const respostaEsportes = await retornoEsportes.json();
  const esportesView = respostaEsportes.data || [];

  const retornoEquipes = await fetch("../php/equipe/equipe_get.php");
  const respostaEquipes = await retornoEquipes.json();
  const equipesPorModalidade = {};

  for (let i = 0; i < (respostaEquipes.data || []).length; i++) {
    const equipe = respostaEquipes.data[i];
    const idModalidade = equipe.id_modalidade;

    if (!idModalidade) {
      continue;
    }

    equipesPorModalidade[idModalidade] = (equipesPorModalidade[idModalidade] || 0) + 1;
  }

  let html = "";
  for (let i = 0; i < esportesView.length; i++) {
    const esporte = esportesView[i];
    const equipesVinculadas = equipesPorModalidade[esporte.id] || 0;

    html += `
      <div class="linhaEsporte">
        <a class="btnEditarEsporte" href="esportes_alterar.html?id=${esporte.id}"><i class="bi bi-pencil-square"></i><span class="visually-hidden">Editar</span></a>
        <p>${esporte.nome || ""}</p>
        <p>${equipesVinculadas}</p>
        <p>${esporte.status || ""}</p>
      </div>
    `;
  }

  if (!html) {
    lista.innerHTML = '<p class="estadoListaVazia">Nenhuma modalidade cadastrada.</p>';
    return;
  }

  lista.innerHTML = html;
});

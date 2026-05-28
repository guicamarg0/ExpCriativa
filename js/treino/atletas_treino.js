document.addEventListener("DOMContentLoaded", buscar);

async function buscar() {
  const retornoAtletas = await fetch("../php/atleta/atleta_get.php");
  const respostaAtletas = await retornoAtletas.json();

  if (respostaAtletas.status !== "ok") {
    return;
  }

  preencherLista(respostaAtletas.data || []);
}

function preencherLista(atletas) {
  const lista = document.getElementById("listaAtletasTreino");

  if (!atletas.length) {
    lista.innerHTML = '<p class="estadoListaVazia">Nenhum atleta cadastrado.</p>';
    return;
  }

  let html = "";

  for (let i = 0; i < atletas.length; i++) {
    const atleta = atletas[i];

    html += `
      <div class="linhaAtletaTreino">
        <a class="btnPlanilhaAtleta" href="planilha_treino.html?id=${atleta.id}">
          <i class="bi bi-clipboard2-pulse"></i>
          <span class="visually-hidden">Visualizar treinos</span>
        </a>
        <p>${atleta.nome || ""}</p>
        <p>${atleta.status || ""}</p>
      </div>
    `;
  }

  lista.innerHTML = html;
}

let esportesView = [];

document.addEventListener("DOMContentLoaded", async () => {
  await window.esportesSessao.aplicarPermissoesTelaEsportes();
  await buscarEsportes();
});

function preencherTabelaEsportes() {
  const lista = document.querySelector(".listViewEsportes");

  let html = "";
  for (let i = 0; i < esportesView.length; i++) {
    const esporte = esportesView[i];
    html += `
      <div class="linhaEsporte">
        <a class="btnEditarEsporte" href="esportes_alterar.html?id=${esporte.id}"><i class="bi bi-pencil-square"></i><span class="visually-hidden">Editar</span></a>
        <p>${esporte.nome || ""}</p>
        <p>${esporte.equipes_vinculadas || "0"}</p>
        <p>${esporte.status || ""}</p>
      </div>
    `;
  }

  lista.innerHTML = html;
}

async function buscarEsportes() {
  const retorno = await fetch("../php/esportes/esportes_get.php");
  const resposta = await retorno.json();
  esportesView = resposta.data;
  preencherTabelaEsportes();
}

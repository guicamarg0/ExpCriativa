let equipesView = [];

document.addEventListener("DOMContentLoaded", async () => {
  await window.equipeSessao.aplicarPermissoesTelaEquipe();
  await buscarEquipes();
});

function preencherTabelaEquipes() {
  const lista = document.querySelector(".listViewEquipes");

  let html = "";
  for (let i = 0; i < equipesView.length; i++) {
    const equipe = equipesView[i];
    html += `
      <div class="linhaEquipe">
        <a class="btnEditarEquipe" href="equipe_alterar.html?id=${equipe.id}"><i class="bi bi-pencil-square"></i><span class="visually-hidden">Editar</span></a>
        <p>${equipe.nome || ""}</p>
        <p>${equipe.modalidade || ""}</p>
        <p>${equipe.categoria || ""}</p>
        <p>${equipe.genero || ""}</p>
        <p>${equipe.treinador_responsavel_nome || ""}</p>
        <p>${equipe.integrantes || ""}</p>
        <p>${equipe.status || ""}</p>
      </div>
    `;
  }

  lista.innerHTML = html;
}

async function buscarEquipes() {
  const retorno = await fetch("../php/equipe/equipe_get.php");
  const resposta = await retorno.json();
  equipesView = resposta.data;
  preencherTabelaEquipes();
}

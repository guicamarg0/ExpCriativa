let atletasView = [];

document.addEventListener("DOMContentLoaded", async () => {
  await window.atletaSessao.aplicarPermissoesTelaAtleta();
  await buscarAtletas();
});

function preencherTabelaAtletas() {
  const lista = document.querySelector(".listViewAtletas");

  let html = "";
  for (let i = 0; i < atletasView.length; i++) {
    const atleta = atletasView[i];
    html += `
      <div class="linhaAtleta">
        <a class="btnEditarAtleta" href="atleta_alterar.html?id=${atleta.id}"><i class="bi bi-pencil-square"></i><span class="visually-hidden">Editar</span></a>
        <p>${atleta.nome || ""}</p>
        <p>${String(atleta.data_nascimento || "").slice(0, 10)}</p>
        <p>${atleta.genero_nome || ""}</p>
        <p>${atleta.altura || ""}</p>
        <p>${atleta.peso || ""}</p>
        <p>${atleta.status || ""}</p>
      </div>
    `;
  }

  lista.innerHTML = html;
}

async function buscarAtletas() {
  const retorno = await fetch("../php/atleta/atleta_get.php");
  const resposta = await retorno.json();
  atletasView = resposta.data;
  preencherTabelaAtletas();
}

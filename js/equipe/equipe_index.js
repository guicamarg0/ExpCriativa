document.addEventListener("DOMContentLoaded", async () => {
  await window.equipeSessao.aplicarPermissoesTelaEquipe();
  const lista = document.querySelector(".listViewEquipes");
  const retornoEquipes = await fetch("../php/equipe/equipe_get.php");
  const respostaEquipes = await retornoEquipes.json();
  const equipesView = respostaEquipes.data || [];

  const retornoModalidades = await fetch("../php/esportes/esportes_get.php");
  const respostaModalidades = await retornoModalidades.json();
  const modalidadesPorId = {};

  for (let i = 0; i < (respostaModalidades.data || []).length; i++) {
    const modalidade = respostaModalidades.data[i];
    modalidadesPorId[modalidade.id] = modalidade;
  }

  const retornoGeneros = await fetch("../php/genero_get.php");
  const respostaGeneros = await retornoGeneros.json();
  const generosPorId = {};

  for (let i = 0; i < (respostaGeneros.data || []).length; i++) {
    const genero = respostaGeneros.data[i];
    generosPorId[genero.id] = genero;
  }

  const retornoTreinadores = await fetch("../php/treinador/treinador_get.php");
  const respostaTreinadores = await retornoTreinadores.json();
  const treinadoresPorId = {};

  for (let i = 0; i < (respostaTreinadores.data || []).length; i++) {
    const treinador = respostaTreinadores.data[i];
    treinadoresPorId[treinador.id] = treinador;
  }

  const retornoAtletas = await fetch("../php/atleta/atleta_get.php");
  const respostaAtletas = await retornoAtletas.json();
  const integrantesPorEquipe = {};

  for (let i = 0; i < (respostaAtletas.data || []).length; i++) {
    const atleta = respostaAtletas.data[i];
    const idEquipe = atleta.id_equipe;

    if (!idEquipe) {
      continue;
    }

    integrantesPorEquipe[idEquipe] = (integrantesPorEquipe[idEquipe] || 0) + 1;
  }

  let html = "";
  for (let i = 0; i < equipesView.length; i++) {
    const equipe = equipesView[i];
    const modalidadeNome = modalidadesPorId[equipe.id_modalidade]?.nome || "";
    const generoNome = generosPorId[equipe.id_genero]?.nome || "";
    const treinadorNome = treinadoresPorId[equipe.id_treinador_responsavel]?.nome || "";
    const totalIntegrantes = integrantesPorEquipe[equipe.id] || 0;

    html += `
      <div class="linhaEquipe">
        <a class="btnEditarEquipe" href="equipe_alterar.html?id=${equipe.id}"><i class="bi bi-pencil-square"></i><span class="visually-hidden">Editar</span></a>
        <p>${equipe.nome || ""}</p>
        <p>${modalidadeNome}</p>
        <p>${equipe.categoria || ""}</p>
        <p>${generoNome}</p>
        <p>${treinadorNome}</p>
        <p>${totalIntegrantes}</p>
        <p>${equipe.status || ""}</p>
      </div>
    `;
  }

  lista.innerHTML = html;
});

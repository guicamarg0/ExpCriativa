document.addEventListener("DOMContentLoaded", async () => {
  await window.atletaSessao.aplicarPermissoesTelaAtleta();
  const lista = document.querySelector(".listViewAtletas");
  const retornoAtletas = await fetch("../php/atleta/atleta_get.php");
  const respostaAtletas = await retornoAtletas.json();
  const atletasView = respostaAtletas.data || [];

  const retornoGeneros = await fetch("../php/genero_get.php");
  const respostaGeneros = await retornoGeneros.json();
  const generosPorId = {};

  for (let i = 0; i < (respostaGeneros.data || []).length; i++) {
    const genero = respostaGeneros.data[i];
    generosPorId[genero.id] = genero;
  }

  let html = "";
  for (let i = 0; i < atletasView.length; i++) {
    const atleta = atletasView[i];
    const generoNome = generosPorId[atleta.id_genero]?.nome || "";

    html += `
      <div class="linhaAtleta">
        <a class="btnEditarAtleta" href="atleta_alterar.html?id=${atleta.id}"><i class="bi bi-pencil-square"></i><span class="visually-hidden">Editar</span></a>
        <p>${atleta.nome || ""}</p>
        <p>${String(atleta.data_nascimento || "").slice(0, 10)}</p>
        <p>${generoNome}</p>
        <p>${atleta.altura || ""}</p>
        <p>${atleta.peso || ""}</p>
        <p>${atleta.status || ""}</p>
      </div>
    `;
  }

  lista.innerHTML = html;
});

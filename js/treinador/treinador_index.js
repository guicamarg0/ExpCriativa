document.addEventListener("DOMContentLoaded", async () => {
  await window.treinadorSessao.aplicarPermissoesTelaTreinador();
  const lista = document.getElementById("listViewTreinadores");
  const retornoTreinadores = await fetch("../php/treinador/treinador_get.php");
  const respostaTreinadores = await retornoTreinadores.json();
  const treinadoresView = respostaTreinadores.data || [];

  const retornoUsuarios = await fetch("../php/usuario_get.php");
  const respostaUsuarios = await retornoUsuarios.json();
  const usuariosPorId = {};

  for (let i = 0; i < (respostaUsuarios.data || []).length; i++) {
    const usuario = respostaUsuarios.data[i];
    usuariosPorId[usuario.id] = usuario;
  }

  const retornoEquipes = await fetch("../php/equipe/equipe_get.php");
  const respostaEquipes = await retornoEquipes.json();
  const equipesPorTreinador = {};

  for (let i = 0; i < (respostaEquipes.data || []).length; i++) {
    const equipe = respostaEquipes.data[i];
    const idTreinador = equipe.id_treinador_responsavel;

    if (!idTreinador) {
      continue;
    }

    if (!equipesPorTreinador[idTreinador]) {
      equipesPorTreinador[idTreinador] = [];
    }

    equipesPorTreinador[idTreinador].push(equipe.nome || "");
  }

  for (const idTreinador in equipesPorTreinador) {
    equipesPorTreinador[idTreinador].sort();
  }

  let html = "";
  for (let i = 0; i < treinadoresView.length; i++) {
    const treinador = treinadoresView[i];
    const email = usuariosPorId[treinador.id_usuario]?.email || "";
    const equipesResponsavel = (equipesPorTreinador[treinador.id] || []).join(", ");

    html += `
      <div class="linhaTreinador">
        <a class="btnEditarTreinador" href="treinador_alterar.html?id=${treinador.id}"><i class="bi bi-pencil-square"></i><span class="visually-hidden">Editar</span></a>
        <p>${treinador.nome || ""}</p>
        <p>${email}</p>
        <p>${equipesResponsavel}</p>
        <p>${treinador.telefone || ""}</p>
        <p>${treinador.cref || ""}</p>
        <p>${treinador.status || ""}</p>
      </div>
    `;
  }

  lista.innerHTML = html;
});

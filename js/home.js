const HOME_STORAGE_SESSION_KEY = "mitraSessionKey";

function escaparHtml(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatarNumero(valor) {
  if (valor === null || typeof valor === "undefined" || valor === "") {
    return "-";
  }

  const numero = Number(valor);
  if (Number.isNaN(numero)) {
    return String(valor);
  }

  return numero.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function textoEquipesAtleta(perfil) {
  if (!perfil || !Array.isArray(perfil.equipes) || perfil.equipes.length === 0) {
    return "Sem equipe vinculada";
  }

  return perfil.equipes
    .map((item) => item.nome || "Equipe")
    .join(", ");
}

function obterTipoUsuario(sessao) {
  const idNivel = Number(sessao?.id_nivel || 0);
  const tipoPerfil = String(sessao?.perfil?.tipo || "").toLowerCase();

  if (idNivel === 1 || tipoPerfil === "admin") {
    return "Admin";
  }
  if (idNivel === 2 || tipoPerfil === "treinador") {
    return "Treinador";
  }
  if (idNivel === 3 || tipoPerfil === "atleta") {
    return "Atleta";
  }
  return "Usuario";
}

function renderizarHome(sessao) {
  if (!sessao || sessao.status !== "ok") {
    return;
  }

  const titulo = document.getElementById("tituloBoasVindas");
  const tipoUsuario = document.getElementById("tipoUsuarioHome");
  const painel = document.getElementById("painelHome");
  if (!titulo || !painel) {
    return;
  }

  const idNivel = Number(sessao.id_nivel || 0);
  const perfil = sessao.perfil || {};
  const nome = (perfil.nome || sessao.usuario?.nome || "Usuário").trim();
  if (tipoUsuario) {
    tipoUsuario.textContent = `Tipo de usuário: ${obterTipoUsuario(sessao)}`;
  }

  if (idNivel === 1) {
    titulo.textContent = "Bem-Vindo ao Mitra, Admin";
    painel.innerHTML = "";
    return;
  }

  if (idNivel === 2) {
    titulo.textContent = `Bem vindo ao Mitra, ${nome}`;
    painel.innerHTML = "";
    return;
  }

  if (idNivel === 3) {
    titulo.textContent = `Bem vindo ao Mitra, ${nome}`;
    painel.innerHTML = `
      <article class="cardDadosAtleta">
        <h2>Seus dados</h2>
        <div class="infoAtletaLinha">
          <strong>Peso</strong>
          <span>${escaparHtml(formatarNumero(perfil.peso))}</span>
        </div>
        <div class="infoAtletaLinha">
          <strong>Altura</strong>
          <span>${escaparHtml(formatarNumero(perfil.altura))}</span>
        </div>
        <div class="infoAtletaLinha">
          <strong>Equipes vinculadas</strong>
          <span>${escaparHtml(textoEquipesAtleta(perfil))}</span>
        </div>
      </article>
    `;
    return;
  }

  titulo.textContent = `Bem vindo ao Mitra, ${nome}`;
  painel.innerHTML = "";
}

async function carregarSessaoHome() {
  if (window.mitraSessao && window.mitraSessao.status === "ok") {
    renderizarHome(window.mitraSessao);
    return;
  }

  const sessionKey = localStorage.getItem(HOME_STORAGE_SESSION_KEY) || "";
  if (!sessionKey) {
    return;
  }

  try {
    const retorno = await fetch("../php/valida_sessao.php", {
      cache: "no-store",
      headers: {
        "X-Session-Key": sessionKey,
      },
    });
    if (!retorno.ok) {
      return;
    }

    const resposta = await retorno.json();
    if (resposta.status === "ok") {
      window.mitraSessao = resposta;
      renderizarHome(resposta);
    }
  } catch (erro) {
    console.error(erro);
  }
}

document.addEventListener("mitra:sessao", (event) => {
  renderizarHome(event.detail);
});

document.addEventListener("DOMContentLoaded", () => {
  carregarSessaoHome();
});

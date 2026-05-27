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

function formatarTaxa(valor) {
  if (valor === null || typeof valor === "undefined" || valor === "") {
    return "-";
  }

  const numero = Number(valor);
  if (Number.isNaN(numero)) {
    return String(valor);
  }

  return `${numero}%`;
}

function renderizarHome(sessao) {
  console.log("renderizarHome called", { sessao });
  if (!sessao || sessao.status !== "ok") {
    console.warn("Sessão inválida ou não encontrada em renderizarHome", sessao);
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
  const nome = perfil.nome || sessao.usuario?.nome || "Usuário";
  const equipeNome = perfil.equipes?.[0]?.nome || "Sem equipe";
  const esporteNome = perfil.esporte || "Futebol";
  const proximoTreino = perfil.proximo_treino || "Treino tático";
  const treinadorNome = perfil.treinador || "Guilherme";

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
    try {
      titulo.textContent = `Bem vindo ao Mitra, ${nome}`;
      painel.innerHTML = `
      <div class="painelAtleta">
        <section class="atletaTopo">
          <div class="atletaPerfil">
            <span class="atletaIcon">👤</span>
            <div>
              <strong>${escaparHtml(nome)}</strong>
              <span>${escaparHtml(equipeNome)} · ${escaparHtml(esporteNome)}</span>
            </div>
          </div>
        </section>

        <article class="cardAgenda">
          <div class="agendaData">
            <span>28</span>
            <small>Mai</small>
          </div>
          <div class="agendaInfo">
            <strong>Próximo treino: ${escaparHtml(proximoTreino)}</strong>
            <span>Qua, 09:00 · Treinador ${escaparHtml(treinadorNome)}</span>
          </div>
        </article>

        <div class="cardsResumo">
          <article class="statCard">
            <small>Presenças</small>
            <div class="statValue">18</div>
            <span>de 22 treinos</span>
          </article>
          <article class="statCard">
            <small>Frequência</small>
            <div class="statValue">82%</div>
            <span>Últimos 3 meses</span>
          </article>
          <article class="statCard">
            <small>Sequência</small>
            <div class="statValue">5</div>
            <span>dias seguidos</span>
          </article>
          <article class="statCard">
            <small>Evolução</small>
            <div class="statValue">+12%</div>
            <span>vs mês anterior</span>
          </article>
        </div>

        <div class="graficosResumo">
          <article class="cardGrafico cardGraficoBarras">
            <div class="graficoHeader">
              <h3>Presenças por mês</h3>
            </div>
            <div class="barrasChart">
              <div>
                <div class="bar" style="height:65%"></div>
                <span>Mar</span>
              </div>
              <div>
                <div class="bar" style="height:80%"></div>
                <span>Abr</span>
              </div>
              <div>
                <div class="bar" style="height:95%"></div>
                <span>Mai</span>
              </div>
            </div>
          </article>

          <article class="cardGrafico cardGraficoLinha">
            <div class="graficoHeader linhaHeader">
              <h3>Evolução de desempenho</h3>
              <div class="graficoLegenda">
                <span><i class="legendaPonto pontoVelocidade"></i> Velocidade (km/h)</span>
                <span><i class="legendaPonto pontoResistencia"></i> Resistência (min)</span>
              </div>
            </div>
            <div class="graficoLinhaSvgWrapper">
              <svg viewBox="0 0 320 180" preserveAspectRatio="none">
                <polyline points="20,140 80,130 140,125 200,115 280,95" class="linhaVelocidade" />
                <polyline points="20,120 80,105 140,100 200,90 280,70" class="linhaResistencia" />
              </svg>
              <div class="graficoEixo">
                <span>T1</span>
                <span>T2</span>
                <span>T3</span>
                <span>T4</span>
                <span>T5</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    `;
    } catch (err) {
      console.error("Erro ao renderizar painel de atleta:", err);
      painel.innerHTML = `<div style="padding:1rem;background:#fff;border-radius:8px;color:#c00">Erro ao carregar painel do atleta. Veja o console para detalhes.</div>`;
    }
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

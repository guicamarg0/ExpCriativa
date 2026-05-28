document.addEventListener("DOMContentLoaded", async () => {
  const pageButtons = document.querySelectorAll(".analise-nav button");
  const pages = document.querySelectorAll(".analise-page");
  const sessao = await obterSessaoAnalise();
  const tipoPerfil = sessao.perfil?.tipo || "";

  configurarAbas(pageButtons, pages, tipoPerfil);
  await carregarSelectsAnalise(tipoPerfil);

  document.getElementById("carregarAtleta").addEventListener("click", carregarAtleta);
  document.getElementById("carregarTreinador").addEventListener("click", carregarTreinador);
  document.getElementById("carregarAdmin").addEventListener("click", carregarAdmin);

  if (tipoPerfil === "atleta") {
    mostrarPagina("atleta");
    carregarAtleta();
  } else if (tipoPerfil === "treinador") {
    mostrarPagina("treinador");
    carregarTreinador();
  } else {
    mostrarPagina("atleta");
    carregarAtleta();
  }
});

let evolucaoChart = null;
let comparacaoChart = null;

async function obterSessaoAnalise() {
  if (!window.mitraSessao) {
    await new Promise((resolve) => {
      document.addEventListener("mitra:sessao", resolve, { once: true });
    });
  }
  return window.mitraSessao || {};
}

function configurarAbas(pageButtons, pages, tipoPerfil) {
  if (tipoPerfil === "atleta") {
    document.querySelector('[data-page="treinador"]')?.remove();
    document.querySelector('[data-page="admin"]')?.remove();
  } else if (tipoPerfil === "treinador") {
    document.querySelector('[data-page="admin"]')?.remove();
  }

  pageButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      mostrarPagina(btn.getAttribute("data-page"));
    });
  });
}

function mostrarPagina(page) {
  document.querySelectorAll(".analise-nav button").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-page") === page);
  });
  document.querySelectorAll(".analise-page").forEach((pagina) => {
    pagina.style.display = "none";
  });
  document.getElementById("page-" + page).style.display = "block";
}

async function carregarSelectsAnalise(tipoPerfil) {
  await popularSelect("atletaId", "../php/atleta/atleta_get.php", "Selecione um atleta");

  if (tipoPerfil !== "atleta") {
    await popularSelect("treinadorId", "../php/treinador/treinador_get.php", "Selecione um treinador");
    await popularSelect("equipeFiltro", "../php/equipe/equipe_get.php", "Todas as equipes", true);
  }
}

async function popularSelect(id, url, placeholder, permitirVazio = false) {
  const select = document.getElementById(id);
  if (!select) {
    return;
  }

  select.innerHTML = `<option value="">${placeholder}</option>`;
  const retorno = await fetch(url);
  const resposta = await retorno.json();

  for (let i = 0; i < (resposta.data || []).length; i++) {
    const item = resposta.data[i];
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.nome || item.email || `Registro ${item.id}`;
    select.appendChild(option);
  }

  if (!permitirVazio && select.options.length > 1) {
    select.selectedIndex = 1;
  }
}

function carregarAtleta() {
  const id = document.getElementById("atletaId").value;
  if (!id) {
    return;
  }

  fetch("../php/analise_atleta.php?id_atleta=" + encodeURIComponent(id))
    .then((r) => r.json())
    .then((data) => {
      document.getElementById("presencasCount").innerText = data.presencas || 0;
      document.getElementById("proximoTreino").innerText = data.proximo_treino
        ? `${data.proximo_treino.data} - ${data.proximo_treino.modalidade}`
        : "Nenhum agendado";

      const labels = (data.evolucao || []).map((item) => item.data);
      const pesos = (data.evolucao || []).map((item) => item.peso || null);
      const alturas = (data.evolucao || []).map((item) => item.altura || null);

      const ctx = document.getElementById("evolucaoChart").getContext("2d");
      if (evolucaoChart) evolucaoChart.destroy();
      evolucaoChart = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Peso (kg)",
              data: pesos,
              borderColor: "rgba(34, 28, 105, 0.95)",
              backgroundColor: "rgba(34, 28, 105, 0.15)",
              tension: 0.3,
              fill: true,
              pointRadius: 4,
            },
            {
              label: "Altura (m)",
              data: alturas,
              borderColor: "rgba(80, 127, 255, 0.9)",
              backgroundColor: "rgba(80, 127, 255, 0.12)",
              tension: 0.3,
              fill: true,
              pointRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: false, ticks: { color: "#333" }, grid: { color: "rgba(34, 28, 105, 0.08)" } },
            x: { ticks: { color: "#333" }, grid: { color: "rgba(34, 28, 105, 0.05)" } },
          },
          plugins: {
            legend: { labels: { color: "#1b1b3b" } },
            tooltip: { backgroundColor: "rgba(34, 28, 105, 0.95)", titleColor: "#fff", bodyColor: "#fff" },
          },
        },
      });

      const detailsList = document.getElementById("evolucaoDetails");
      detailsList.innerHTML = "";
      (data.evolucao || []).forEach((item) => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${item.data}</strong><br>Peso: ${item.peso || "N/A"} kg - Altura: ${item.altura || "N/A"} m<br>${item.observacao || "Sem observacao"}`;
        detailsList.appendChild(li);
      });
    });
}

function carregarTreinador() {
  const id = document.getElementById("treinadorId").value;
  const equipe = document.getElementById("equipeFiltro").value;
  if (!id) {
    return;
  }

  const url =
    "../php/analise_treinador.php?id_treinador=" +
    encodeURIComponent(id) +
    (equipe ? "&id_equipe=" + encodeURIComponent(equipe) : "");

  fetch(url)
    .then((r) => r.json())
    .then((data) => {
      const list = document.getElementById("treinosList");
      list.innerHTML = "";
      (data.treinos || []).forEach((t) => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `<strong>${t.data} - ${t.modalidade}</strong><p>${t.detalhes || "Sem detalhes registrados."}</p>`;
        list.appendChild(div);
      });

      document.getElementById("treinosCount").innerText = (data.treinos || []).length;
      document.getElementById("atletasCount").innerText = (data.comparacao || []).length;

      const labels = (data.comparacao || []).map((c) => c.nome);
      const valores = (data.comparacao || []).map((c) => c.presencas);
      const ctx = document.getElementById("comparacaoAtletasChart").getContext("2d");
      if (comparacaoChart) comparacaoChart.destroy();
      comparacaoChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [{ label: "Presencas", data: valores, backgroundColor: "rgba(34, 28, 105, 0.85)", borderColor: "rgba(34, 28, 105, 1)", borderWidth: 1 }],
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true, ticks: { color: "#333" }, grid: { color: "rgba(34, 28, 105, 0.08)" } },
            x: { ticks: { color: "#333" }, grid: { display: false } },
          },
          plugins: { legend: { display: false } },
        },
      });
    });
}

function carregarAdmin() {
  fetch("../php/analise_admin.php")
    .then((r) => r.json())
    .then((data) => {
      const eq = document.getElementById("equipesList");
      const tr = document.getElementById("treinadoresList");
      const at = document.getElementById("atletasList");
      eq.innerHTML = "";
      tr.innerHTML = "";
      at.innerHTML = "";
      data.equipes.forEach((e) => {
        const li = document.createElement("li");
        li.innerText = e.nome;
        eq.appendChild(li);
      });
      data.treinadores.forEach((t) => {
        const li = document.createElement("li");
        li.innerText = t.nome;
        tr.appendChild(li);
      });
      data.atletas.forEach((a) => {
        const li = document.createElement("li");
        li.innerText = a.nome;
        at.appendChild(li);
      });
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const pageButtons = document.querySelectorAll(".analise-nav button");
  const pages = document.querySelectorAll(".analise-page");

  pageButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      pageButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const page = btn.getAttribute("data-page");
      pages.forEach((p) => (p.style.display = "none"));
      document.getElementById("page-" + page).style.display = "block";
    });
  });

  document
    .getElementById("carregarAtleta")
    .addEventListener("click", carregarAtleta);
  document
    .getElementById("carregarTreinador")
    .addEventListener("click", carregarTreinador);
  document
    .getElementById("carregarAdmin")
    .addEventListener("click", carregarAdmin);

  let evolucaoChart = null;
  let comparacaoChart = null;

  function carregarAtleta() {
    const id = document.getElementById("atletaId").value;
    fetch("../php/analise_atleta.php?id_atleta=" + encodeURIComponent(id))
      .then((r) => r.json())
      .then((data) => {
        document.getElementById("presencasCount").innerText =
          data.presencas || 0;
        document.getElementById("proximoTreino").innerText = data.proximo_treino
          ? `${data.proximo_treino.data} - ${data.proximo_treino.modalidade}`
          : "Nenhum agendado";

        const labels = data.evolucao.map((item) => item.data);
        const pesos = data.evolucao.map((item) => item.peso || null);
        const alturas = data.evolucao.map((item) => item.altura || null);

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
              y: {
                beginAtZero: false,
                ticks: { color: "#333" },
                grid: { color: "rgba(34, 28, 105, 0.08)" },
              },
              x: {
                ticks: { color: "#333" },
                grid: { color: "rgba(34, 28, 105, 0.05)" },
              },
            },
            plugins: {
              legend: { labels: { color: "#1b1b3b" } },
              tooltip: {
                backgroundColor: "rgba(34, 28, 105, 0.95)",
                titleColor: "#fff",
                bodyColor: "#fff",
              },
            },
          },
        });

        const detailsList = document.getElementById("evolucaoDetails");
        detailsList.innerHTML = "";
        data.evolucao.forEach((item) => {
          const li = document.createElement("li");
          li.innerHTML = `<strong>${item.data}</strong><br>Peso: ${item.peso || "N/A"} kg · Altura: ${item.altura || "N/A"} m<br>${item.observacao || "Sem observação"}`;
          detailsList.appendChild(li);
        });
      });
  }

  function carregarTreinador() {
    const id = document.getElementById("treinadorId").value;
    const equipe = document.getElementById("equipeFiltro").value;
    const url =
      "../php/analise_treinador.php?id_treinador=" +
      encodeURIComponent(id) +
      (equipe ? "&id_equipe=" + encodeURIComponent(equipe) : "");
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const list = document.getElementById("treinosList");
        list.innerHTML = "";
        data.treinos.forEach((t) => {
          const div = document.createElement("div");
          div.className = "card";
          div.innerHTML = `
                    <strong>${t.data} - ${t.modalidade}</strong>
                    <p>${t.detalhes || "Sem detalhes registrados."}</p>
                `;
          list.appendChild(div);
        });

        document.getElementById("treinosCount").innerText = data.treinos.length;
        document.getElementById("atletasCount").innerText =
          data.comparacao.length;

        const labels = data.comparacao.map((c) => c.nome);
        const valores = data.comparacao.map((c) => c.presencas);
        const ctx = document
          .getElementById("comparacaoAtletasChart")
          .getContext("2d");
        if (comparacaoChart) comparacaoChart.destroy();
        comparacaoChart = new Chart(ctx, {
          type: "bar",
          data: {
            labels,
            datasets: [
              {
                label: "Presenças",
                data: valores,
                backgroundColor: "rgba(34, 28, 105, 0.85)",
                borderColor: "rgba(34, 28, 105, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                ticks: { color: "#333" },
                grid: { color: "rgba(34, 28, 105, 0.08)" },
              },
              x: {
                ticks: { color: "#333" },
                grid: { display: false },
              },
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: "rgba(34, 28, 105, 0.95)",
                titleColor: "#fff",
                bodyColor: "#fff",
              },
            },
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

  carregarAtleta();
});

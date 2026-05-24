document.addEventListener("DOMContentLoaded", async () => {
    const sessionKey = localStorage.getItem("mitraSessionKey") || "";

    const retSessao  = await fetch("../php/valida_sessao.php", {
        cache: "no-store",
        headers: { "X-Session-Key": sessionKey }
    });
    const respSessao = await retSessao.json();

    if (respSessao.status !== "ok") {
        window.location.href = "../login/";
        return;
    }
    if (respSessao.id_nivel != 1) {
        alert("Acesso restrito ao administrador.");
        window.location.href = "../home/home.html";
        return;
    }

    buscarTodos();
});

document.getElementById("logoff").addEventListener("click", async () => {
    await fetch("../php/usuario_logoff.php");
    localStorage.removeItem("mitraSessionKey");
    localStorage.removeItem("mitraUsuario");
    window.location.href = "../login/";
});

async function buscarTodos() {
    const retorno  = await fetch("../php/treino/treino_get.php");
    const resposta = await retorno.json();

    if (resposta.status !== "ok") {
        document.getElementById("conteudo").innerHTML =
            "<p class='text-muted'>Nenhum treino cadastrado no sistema.</p>";
        return;
    }

    renderizarAgrupado(resposta.data);
}

function renderizarAgrupado(treinos) {
    const grupos = {};
    for (const treino of treinos) {
        const chave = treino.id_treinador || "sem_treinador";
        const nome  = treino.nome_treinador || "Sem treinador";
        if (!grupos[chave]) grupos[chave] = { nome, treinos: [] };
        grupos[chave].treinos.push(treino);
    }

    let html = "";
    for (const chave of Object.keys(grupos)) {
        const grupo = grupos[chave];
        html += `<div class="bloco-treinador"><h2>Treinador: ${grupo.nome}</h2>`;
        for (const treino of grupo.treinos) {
            html += `
                <div class="card-treino">
                    <span class="badge-modalidade">${treino.modalidade}</span>
                    <span class="badge-atleta">${treino.nome_atleta || "Atleta não encontrado"}</span>
                    <h3>${formatarData(treino.data)}</h3>
                    <p><strong>Detalhes:</strong> ${treino.detalhes || "-"}</p>
                </div>`;
        }
        html += `</div>`;
    }

    document.getElementById("conteudo").innerHTML = html;
}

function formatarData(data) {
    if (!data) return "-";
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}
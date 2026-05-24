document.addEventListener("DOMContentLoaded", async () => {
    const sessionKey = localStorage.getItem("mitraSessionKey") || "";

    // Valida sessão com o header obrigatório
    const retSessao  = await fetch("../php/valida_sessao.php", {
        cache: "no-store",
        headers: { "X-Session-Key": sessionKey }
    });
    const respSessao = await retSessao.json();

    if (respSessao.status !== "ok") {
        window.location.href = "../login/";
        return;
    }
    if (respSessao.id_nivel != 3) {
        window.location.href = "../home/home.html";
        return;
    }

    const id_usuario = respSessao.id;

    // Busca o registro de atleta pelo id_usuario
    const retAtleta  = await fetch("../php/atleta/atleta_get.php?id_usuario=" + id_usuario);
    const respAtleta = await retAtleta.json();

    if (respAtleta.status !== "ok" || !respAtleta.data[0]) {
        document.getElementById("card_perfil").innerHTML =
            "<p>Nenhum perfil de atleta encontrado para este usuário.</p>";
        return;
    }

    const atleta = respAtleta.data[0];
    document.getElementById("nome_atleta").textContent = atleta.nome;

    document.getElementById("card_perfil").innerHTML = `
        <div class="perfil-item">
            <span class="perfil-label">Data de Nascimento</span>
            <span class="perfil-valor">${formatarData(atleta.datadenasc)}</span>
        </div>
        <div class="perfil-item">
            <span class="perfil-label">Gênero</span>
            <span class="perfil-valor">${atleta.nome_genero || "-"}</span>
        </div>
        <div class="perfil-item">
            <span class="perfil-label">Altura</span>
            <span class="perfil-valor">${atleta.altura ? atleta.altura + " m" : "-"}</span>
        </div>
        <div class="perfil-item">
            <span class="perfil-label">Peso</span>
            <span class="perfil-valor">${atleta.peso ? atleta.peso + " kg" : "-"}</span>
        </div>
        <div class="perfil-item">
            <span class="perfil-label">Status</span>
            <span class="perfil-valor">${atleta.status || "-"}</span>
        </div>
    `;

    buscarTreinos(atleta.id);
});

document.getElementById("logoff").addEventListener("click", async () => {
    await fetch("../php/usuario_logoff.php");
    localStorage.removeItem("mitraSessionKey");
    localStorage.removeItem("mitraUsuario");
    window.location.href = "../login/";
});

async function buscarTreinos(id_atleta) {
    const retorno  = await fetch("../php/treino/treino_get.php?id_atleta=" + id_atleta);
    const resposta = await retorno.json();

    if (resposta.status === "ok") {
        preencherCards(resposta.data);
    } else {
        document.getElementById("cards_treino").innerHTML =
            "<p class='text-muted'>Nenhum treino cadastrado para você ainda.</p>";
    }
}

function preencherCards(tabela) {
    let html = "";
    for (const treino of tabela) {
        html += `
            <div class="card-treino">
                <span class="badge-modalidade">${treino.modalidade}</span>
                <h3>${formatarData(treino.data)}</h3>
                <p><strong>Detalhes:</strong> ${treino.detalhes || "-"}</p>
                <p><strong>Treinador:</strong> ${treino.nome_treinador || "-"}</p>
            </div>`;
    }
    document.getElementById("cards_treino").innerHTML =
        html || "<p class='text-muted'>Nenhum treino cadastrado para você ainda.</p>";
}

function formatarData(data) {
    if (!data) return "-";
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}
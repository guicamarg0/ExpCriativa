document.addEventListener("DOMContentLoaded", async () => {
    const url = new URLSearchParams(window.location.search);
    const id = url.get("id");

    // ===== CASO 1: atleta vindo da URL (treinador/admin) =====
    if (id) {
        buscarAtleta(id);
        buscarTreinos(id);

        document.getElementById("novo").addEventListener("click", () => {
            window.location.href = `treino_novo.html?id_atleta=${id}`;
        });

    } 
    // ===== CASO 2: atleta logado (perfil do atleta) =====
    else {
        const sessionKey = localStorage.getItem("mitraSessionKey") || "";

        const retSessao = await fetch("../php/valida_sessao.php", {
            cache: "no-store",
            headers: { "X-Session-Key": sessionKey }
        });

        const respSessao = await retSessao.json();

        if (respSessao.status !== "ok" || respSessao.id_nivel != 3) {
            window.location.href = "../login/";
            return;
        }

        const id_usuario = respSessao.id;

        const retAtleta = await fetch("../php/atleta/atleta_get.php?id_usuario=" + id_usuario);
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
    }

    document.getElementById("logoff").addEventListener("click", async () => {
        await fetch("../php/usuario_logoff.php");
        localStorage.removeItem("mitraSessionKey");
        localStorage.removeItem("mitraUsuario");
        window.location.href = "../login/";
    });
});

// ===== FUNÇÕES COMPARTILHADAS =====

async function buscarAtleta(id){
    const retorno = await fetch("../php/atleta/atleta_get.php?id=" + id);
    const resposta = await retorno.json();
    if(resposta.status == "ok"){
        document.getElementById("nome_atleta").innerHTML = resposta.data[0].nome;
    }
}

async function buscarTreinos(id){
    const retorno = await fetch("../php/treino/treino_get.php?id_atleta=" + id);
    const resposta = await retorno.json();

    if(resposta.status == "ok"){
        preencherCards(resposta.data);
    } else {
        document.getElementById("cards_treino").innerHTML =
            "<p>Nenhum treino cadastrado.</p>";
    }
}

function preencherCards(tabela) {
    var html = '';
    for (var i = 0; i < tabela.length; i++) {
        html += `
            <div class="card-treino">
                <h3>${formatarData(tabela[i].data)}</h3>
                <p><strong>Modalidade:</strong> ${tabela[i].modalidade}</p>
                <p><strong>Detalhes:</strong> ${tabela[i].detalhes}</p>
                <p><strong>Treinador:</strong> ${tabela[i].nome_treinador}</p>
                <a href="treino_alterar.html?id=${tabela[i].id}">Alterar</a>
                <a href="#" onclick="excluir(${tabela[i].id})">Excluir</a>
            </div>
        `;
    }
    document.getElementById("cards_treino").innerHTML = html;
}

function excluir(id){
    fetch("../php/treino/treino_excluir.php?id=" + id)
        .then(r => r.json())
        .then(res => {
            if(res.status == "ok"){
                location.reload();
            } else {
                alert(res.mensagem);
            }
        });
}

function formatarData(data){
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}
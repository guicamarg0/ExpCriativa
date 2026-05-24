document.addEventListener("DOMContentLoaded", async () => {
    //valida sessão
    let id_usuario = null;
    //Busca sessão no backend
    const retSessao = await fetch("../php/valida_sessao.php");
    const respSessao = await retSessao.json();

    // Se não estiver logado, manda para login
    if (respSessao.status !== "ok") {
        window.location.href = "../login/";
        return;
    }

    // Se não for atleta (id_nivel != 3), manda para home
    if (respSessao.id_nivel != 3) {
        window.location.href = "../home/home.html";
        return;
    }

    // Guarda o id do usuário logado
    id_usuario = respSessao.id;

    //busca dados do atleta
    const retAtleta = await fetch("../php/atleta/atleta_get.php?id_usuario=" + id_usuario);
    const respAtleta = await retAtleta.json();

    // Se não encontrou atleta
    if (respAtleta.status !== "ok" || !respAtleta.data[0]) {
        document.getElementById("card_perfil").innerHTML =
            "<p>Nenhum perfil de atleta encontrado para este usuário.</p>";
        return;
    }

    // Pega o primeiro registro do atleta
    const atleta = respAtleta.data[0];

    // Preenche nome no topo da página
    document.getElementById("nome_atleta").textContent = atleta.nome;


    // preenchimento do perfil
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


    // busca treinos do atleta
    buscarTreinos(atleta.id);
});


//logoff
document.getElementById("logoff").addEventListener("click", async () => {

    const retorno = await fetch("../php/usuario_logoff.php");
    const resposta = await retorno.json();

    if (resposta.status === "ok") {
        localStorage.removeItem("id_usuario");
        localStorage.removeItem("id_treinador");
        window.location.href = "../login/";
    }
});


//busca treinos
async function buscarTreinos(id_atleta) {

    const retorno = await fetch("../php/treino/treino_get.php?id_atleta=" + id_atleta);
    const resposta = await retorno.json();

    if (resposta.status === "ok") {
        preencherCards(resposta.data);
    } else {
        document.getElementById("cards_treino").innerHTML =
            "<p class='text-muted'>Nenhum treino cadastrado para você ainda.</p>";
    }
}


//monta os cards
function preencherCards(tabela) {

    let html = "";

    for (const treino of tabela) {
        html += `
            <div class="card-treino">
                <span class="badge-modalidade">${treino.modalidade}</span>
                <h3>${formatarData(treino.data)}</h3>
                <p><strong>Detalhes:</strong> ${treino.detalhes || "-"}</p>
                <p><strong>Treinador:</strong> ${treino.nome_treinador || "-"}</p>
            </div>
        `;
    }

    document.getElementById("cards_treino").innerHTML =
        html || "<p class='text-muted'>Nenhum treino cadastrado para você ainda.</p>";
}



//data no formato dd/mm/aaaa
function formatarData(data) {
    if (!data) return "-";

    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}
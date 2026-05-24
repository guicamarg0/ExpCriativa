document.addEventListener("DOMContentLoaded", async () => {
    //valida sessão e nível de acesso(admin)
    const retSessao = await fetch("../php/valida_sessao.php");
    const respSessao = await retSessao.json();

    // Se não estiver logado, manda para login
    if (respSessao.status !== "ok") {
        window.location.href = "../login/";
        return;
    }

    // Se não for admin (id_nivel != 1), bloqueia acesso
    if (respSessao.id_nivel != 1) {
        alert("Acesso restrito ao administrador.");
        window.location.href = "../home/home.html";
        return;
    }

    // Se passou nas validações, busca todos os treinos
    buscarTodos();
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


//busca todos os treinos do sistema (admin)
async function buscarTodos() {

    const retorno = await fetch("../php/treino/treino_get.php");
    const resposta = await retorno.json();

    // Se não veio ok, mostra mensagem
    if (resposta.status !== "ok") {
        document.getElementById("conteudo").innerHTML =
            "<p class='text-muted'>Nenhum treino cadastrado no sistema.</p>";
        return;
    }

    // Renderiza agrupado por treinador
    renderizarAgrupado(resposta.data);
}


// agrupa treinos por treinador e monta HTML
function renderizarAgrupado(treinos) {

    // Agrupa treinos por treinador
    const grupos = {};

    for (const treino of treinos) {
        const chave = treino.id_treinador || "sem_treinador";
        const nome  = treino.nome_treinador || "Sem treinador";

        if (!grupos[chave]) {
            grupos[chave] = {
                nome: nome,
                treinos: []
            };
        }

        grupos[chave].treinos.push(treino);
    }

    // Monta HTML final
    let html = "";

    for (const chave of Object.keys(grupos)) {

        const grupo = grupos[chave];

        html += `
            <div class="bloco-treinador">
                <h2>Treinador: ${grupo.nome}</h2>
        `;

        for (const treino of grupo.treinos) {
            html += `
                <div class="card-treino">
                    <span class="badge-modalidade">${treino.modalidade}</span>
                    <span class="badge-atleta">${treino.nome_atleta || "Atleta não encontrado"}</span>
                    <h3>${formatarData(treino.data)}</h3>
                    <p><strong>Detalhes:</strong> ${treino.detalhes || "-"}</p>
                </div>
            `;
        }

        html += `</div>`;
    }

    document.getElementById("conteudo").innerHTML = html;
}

//data no formato dd/mm/aaaa
function formatarData(data) {
    if (!data) return "-";

    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}
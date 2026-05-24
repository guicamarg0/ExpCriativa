document.addEventListener("DOMContentLoaded", async () => {
    //Pega id_treinador da sessão no localStorage
    let id_treinador = localStorage.getItem("id_treinador");

    // Se não existir ou estiver inválido, busca na sessão do PHP
    if (!id_treinador || id_treinador === "null") {

        const retSessao = await fetch("../php/valida_sessao.php");
        const respSessao = await retSessao.json();

        // Se a sessão não for válida, manda para login
        if (respSessao.status !== "ok") {
            window.location.href = "../login/";
            return;
        }

        // Pega o id do treinador retornado pelo PHP
        id_treinador = respSessao.data[0]?.id_treinador || null;

        // Salva no localStorage para próximas páginas
        if (id_treinador) {
            localStorage.setItem("id_treinador", id_treinador);
        }
    }

    // Se ainda não existir treinador, mostra mensagem e para execução
    if (!id_treinador || id_treinador === "null") {
        document.getElementById("lista").innerHTML =
            "<p>Nenhum treinador vinculado a este usuário.</p>";
        return;
    }

    // Busca os atletas do treinador
    buscar(id_treinador);
});


// Botão de logoff
document.getElementById("logoff").addEventListener("click", logoff);


// Função de logout
async function logoff() {
    const retorno = await fetch("../php/usuario_logoff.php");
    const resposta = await retorno.json();

    if (resposta.status === "ok") {
        // Limpa dados salvos no navegador
        localStorage.removeItem("id_usuario");
        localStorage.removeItem("id_treinador");

        // Redireciona para login
        window.location.href = "../login/";
    }
}


// Busca atletas do treinador
async function buscar(id_treinador) {

    const retorno = await fetch("../php/atleta/atleta_get.php?id_treinador=" + id_treinador);
    const resposta = await retorno.json();

    if (resposta.status === "ok") {
        preencherTabela(resposta.data);
    } else {
        document.getElementById("lista").innerHTML =
            "<p>Nenhum atleta vinculado a você ainda.</p>";
    }
}


// Monta tabela na tela
function preencherTabela(tabela) {

    let html = `
        <table>
            <tr>
                <th>Nome do Atleta</th>
                <th>Data de Nasc.</th>
                <th>Gênero</th>
                <th>Planilha</th>
            </tr>`;

    // Percorre todos os atletas
    for (const atleta of tabela) {
        html += `
            <tr>
                <td>${atleta.nome}</td>
                <td>${formatarData(atleta.datadenasc)}</td>
                <td>${atleta.nome_genero || "-"}</td>
                <td>
                    <button class="btn-planilha"
                        onclick="window.location.href='planilha_treino.html?id=${atleta.id}'">
                        Ver / Montar Treinos
                    </button>
                </td>
            </tr>`;
    }

    html += "</table>";

    // Insere HTML na página
    document.getElementById("lista").innerHTML = html;
}


// Formata data de YYYY-MM-DD para DD/MM/YYYY
function formatarData(data) {
    if (!data) return "-";

    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}
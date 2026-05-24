document.addEventListener("DOMContentLoaded", async () => {
    const sessionKey = localStorage.getItem("mitraSessionKey") || "";

    // Se não tem chave, redireciona
    if (!sessionKey) {
        window.location.href = "../login/";
        return;
    }

    // Valida sessão com header obrigatório
    const retSessao  = await fetch("../php/valida_sessao.php", {
        cache: "no-store",
        headers: { "X-Session-Key": sessionKey }
    });
    const respSessao = await retSessao.json();

    if (respSessao.status !== "ok") {
        window.location.href = "../login/";
        return;
    }

    // Pega o id do treinador do perfil retornado pela sessão
    const id_treinador = respSessao.perfil?.id || null;

    if (!id_treinador) {
        document.getElementById("lista").innerHTML =
            "<p>Nenhum treinador vinculado a este usuário.</p>";
        return;
    }

    // Salva para uso nas outras páginas
    localStorage.setItem("id_treinador", id_treinador);

    buscar(id_treinador);
});

document.getElementById("logoff").addEventListener("click", async () => {
    await fetch("../php/usuario_logoff.php");
    localStorage.removeItem("mitraSessionKey");
    localStorage.removeItem("mitraUsuario");
    localStorage.removeItem("id_treinador");
    window.location.href = "../login/";
});

async function buscar(id_treinador) {
    const retorno  = await fetch("../php/atleta/atleta_get.php?id_treinador=" + id_treinador);
    const resposta = await retorno.json();

    if (resposta.status === "ok") {
        preencherTabela(resposta.data);
    } else {
        document.getElementById("lista").innerHTML =
            "<p>Nenhum atleta vinculado a você ainda.</p>";
    }
}

function preencherTabela(tabela) {
    let html = `
        <table>
            <tr>
                <th>Nome do Atleta</th>
                <th>Data de Nasc.</th>
                <th>Gênero</th>
                <th>Planilha</th>
            </tr>`;

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
    document.getElementById("lista").innerHTML = html;
}

function formatarData(data) {
    if (!data) return "-";
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}
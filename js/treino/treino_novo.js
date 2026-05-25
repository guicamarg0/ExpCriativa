document.addEventListener("DOMContentLoaded", async () => {

    const url = new URLSearchParams(window.location.search);
    const id_atleta = url.get("id_atleta");
    document.getElementById("id_atleta").value = id_atleta;
    const retorno = await fetch("../php/atleta/atleta_get.php?id=" + id_atleta);
    const resposta = await retorno.json();

    if (resposta.status == "ok" && resposta.data && resposta.data.length > 0) {
        document.getElementById("atleta").value = resposta.data[0].nome;
    } else {
        console.log("Erro na requisição");
    }

    // sessão do treinador
    let id_treinador = localStorage.getItem("id_treinador");

    if (!id_treinador || id_treinador === "null") {
        const retSessao = await fetch("../php/valida_sessao.php");
        const respSessao = await retSessao.json();
        if (respSessao.status === "ok") {
            id_treinador =
                respSessao.usuario?.id_treinador ||
                respSessao.data?.[0]?.id_treinador ||
                null;
            if (id_treinador) {
                localStorage.setItem("id_treinador", id_treinador);
            }
        } else {
            console.log("Erro na requisição", respSessao);
        }
    }
    if (!id_treinador || id_treinador === "null") {
        alert("Treinador não identificado na sessão. Faça login novamente.");
        window.location.href = "../login/";
        return;
    }

    document.getElementById("id_treinador").value = id_treinador;

    document.getElementById("enviar").addEventListener("click", enviar);
});

document.getElementById("logoff").addEventListener("click", logoff);

// logoff
async function logoff() {
    const retorno = await fetch("../php/usuario_logoff.php");
    const resposta = await retorno.json();
    if (resposta.status == "ok") {
        localStorage.removeItem("id_usuario");
        localStorage.removeItem("id_treinador");
        window.location.href = "../login/";
    }
}

// envio
async function enviar() {
    var id_atleta = document.getElementById("id_atleta").value;
    var id_treinador = document.getElementById("id_treinador").value;
    var modalidade = document.getElementById("modalidade").value;
    var data = document.getElementById("data").value;
    var detalhes = document.getElementById("detalhes").value;
    if (!modalidade || !data) {
        alert("Preencha a modalidade e a data do treino.");
        return;
    }

    const fd = new FormData();
    fd.append("id_atleta", id_atleta);
    fd.append("id_treinador", id_treinador);
    fd.append("modalidade", modalidade);
    fd.append("data", data);
    fd.append("detalhes", detalhes);

    const retorno = await fetch("../php/treino/treino_novo.php", {
        method: "POST",
        body: fd
    });

    const resposta = await retorno.json();

    if (resposta.status == "ok") {
        window.location.href = `../treino/planilha_treino.html?id=${id_atleta}`;
    } else {
        alert("Erro... " + resposta.mensagem);
    }
}
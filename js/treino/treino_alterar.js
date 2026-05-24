document.addEventListener("DOMContentLoaded", () => {
    const url = new URLSearchParams(window.location.search);
    const id = url.get("id");
    if (!id) {
        alert("Treino não identificado. Voltando para a lista.");
        window.location.href = "../treino/atletas_treino.html";
        return;
    }
    buscar(id);
    document.getElementById("enviar").addEventListener("click", () => {
        alterar(id);
    });
    document.getElementById("logoff").addEventListener("click", () => {
        logoff();
    });
});

async function buscar(id){

    const retorno = await fetch("../php/treino/treino_get.php?id=" + id);

    if (!retorno.ok) {
        alert("Erro ao carregar treino.");
        return;
    }

    const resposta = await retorno.json();
    if (resposta.status !== "ok" || !resposta.data?.[0]) {
        alert("Treino não encontrado.");
        window.location.href = "../treino/atletas_treino.html";
        return;
    }

    const registro = resposta.data[0];
    document.getElementById("id").value = id;
    document.getElementById("id_atleta").value = registro.id_atleta;
    document.getElementById("modalidade").value = registro.modalidade;
    document.getElementById("data").value = registro.data;
    document.getElementById("detalhes").value = registro.detalhes;

     if (registro.id_atleta) {
        const retornoAtleta = await fetch("../php/atleta/atleta_get.php?id=" + registro.id_atleta);
        if (retornoAtleta.ok) {
            const respostaAtleta = await retornoAtleta.json();
            if (respostaAtleta.status === "ok" && respostaAtleta.data?.[0]) {
                document.getElementById("atleta").value = respostaAtleta.data[0].nome;
            }
        }
    }
}

//recebe id como parâmetro
async function alterar(id){

    const modalidade = document.getElementById("modalidade").value;
    const data = document.getElementById("data").value;
    const detalhes = document.getElementById("detalhes").value;
    const id_atleta = document.getElementById("id_atleta").value;

    if (!modalidade || !data) {
        alert("Preencha a modalidade e a data do treino.");
        return;
    }
    const fd = new FormData();
    fd.append("modalidade", modalidade);
    fd.append("data", data);
    fd.append("detalhes", detalhes);
       const retorno = await fetch("../php/treino/treino_alterar.php?id=" + id, {
        method: "POST",
        body: fd
    });
    if (!retorno.ok) {
        alert("Erro na requisição.");
        return;
    }
    const resposta = await retorno.json();
    if (resposta.status === "ok") {
        window.location.href = "../treino/planilha_treino.html?id=" + id_atleta;
    } else {
        alert("Erro: " + resposta.mensagem);
    }
}

async function logoff() {
    const retorno = await fetch("../php/usuario_logoff.php");
    if (!retorno.ok) {
        alert("Erro ao fazer logoff.");
        return;
    }
    const resposta = await retorno.json();
    if (resposta.status === "ok") {
        localStorage.removeItem("id_usuario");
        localStorage.removeItem("id_treinador");
        window.location.href = "../login/";
    }
}
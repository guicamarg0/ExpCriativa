    //parte 1
    document.addEventListener("DOMContentLoaded", async () => {
        // pega a URL e armazena em um const
        // busca nessa URL a variável id e armazana no const id.
        const url = new URLSearchParams(window.location.search);
        const id_atleta = url.get("id_atleta");
        document.getElementById("id_atleta").value = id_atleta;

        const retorno = await fetch("../php/atleta/atleta_get.php?id=" + id_atleta);
        const resposta = await retorno.json();
        if(resposta.status == "ok"){
            document.getElementById("atleta").value = resposta.data[0].nome;
        }

        //const id_treinador = localStorage.getItem("id_treinador");
        const id_treinador = 1; // Forçando para testar o banco
        document.getElementById("id_treinador").value = id_treinador;

        document.getElementById("enviar").addEventListener("click", () => {
            enviar();
        });
    });

    document.getElementById("logoff").addEventListener("click", () => {
    logoff();
    });

    async function logoff() {
    const retorno = await fetch("../php/usuario_logoff.php");
    const resposta = await retorno.json();
    if (resposta.status == "ok") {
        window.location.href = "../login/";
    }
    }
    //parte 2

    async function enviar(){
        var id_atleta    = document.getElementById("id_atleta").value;
        var id_treinador    = document.getElementById("id_treinador").value;
        var modalidade    = document.getElementById("modalidade").value;
        var data   = document.getElementById("data").value;
        var detalhes   = document.getElementById("detalhes").value;

        const fd = new FormData();
        fd.append("id_atleta", id_atleta);
        fd.append("id_treinador", id_treinador);
        fd.append("modalidade", modalidade);
        fd.append("data", data);
        fd.append("detalhes", detalhes);

        const retorno = await fetch("../php/treino/treino_novo.php",
            {
            method: 'POST',
            body: fd  
            });

        const resposta = await retorno.json();
        if(resposta.status == "ok"){
            window.location.href = `../treino/planilha_treino.html?id=${id_atleta}`;
        }else{
            alert("Erro... " + resposta.mensagem);
        }

    }
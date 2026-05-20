document.addEventListener("DOMContentLoaded", () => {
    const url = new URLSearchParams(window.location.search);
    const id = url.get("id");
    buscar(id);
});

async function buscar(id){
    const retorno = await fetch("../php/treino/treino_get.php?id="+id);
    const resposta = await retorno.json();
    if(resposta.status == "ok"){
        var registro = resposta.data[0];
        document.getElementById("id").value = id;
        document.getElementById("id_atleta").value = registro.id_atleta;
        document.getElementById("modalidade").value = registro.modalidade;
        document.getElementById("data").value = registro.data;
        document.getElementById("detalhes").value = registro.detalhes;
    }else{
        alert("ERRO:" + resposta.mensagem);
        window.location.href = "../treino/atletas_treino.html";
    }

  const retornoAtleta = await fetch("../php/atleta/atleta_get.php?id=" + registro.id_atleta);
  const respostaAtleta = await retornoAtleta.json();
  if(respostaAtleta.status == "ok"){
      document.getElementById("atleta").value = respostaAtleta.data[0].nome;
}
}

document.getElementById("enviar").addEventListener("click", () => {
    alterar();
});

async function alterar(){
    var id         = document.getElementById("id").value;
    var id_atleta  = document.getElementById("id_atleta").value;
    var modalidade = document.getElementById("modalidade").value;
    var data       = document.getElementById("data").value;
    var detalhes   = document.getElementById("detalhes").value;

    const fd = new FormData();
    fd.append("modalidade", modalidade);
    fd.append("data", data);
    fd.append("detalhes", detalhes);

    const retorno = await fetch("../php/treino/treino_alterar.php?id="+id, {
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
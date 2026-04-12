// Fase 1
// a) PEGA o ID da URL 
// b) Requisita o BACKEND por GET
// c) Preenche o formulário com os dados do BACKEND
// ----------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    // pega a URL e armazena em um const
    // busca nessa URL a variável id e armazana no const id.

    valida_sessao();
    const url = new URLSearchParams(window.location.search);
    const id = url.get("id");
    buscar(id);
});

async function buscar(id){
    const retorno = await fetch("../php/esportes/esportes_get.php?id="+id);
    const resposta = await retorno.json();
    if(resposta.status == "ok"){
        var registro = resposta.data[0];
        document.getElementById("nome").value = registro.nome;
        document.getElementById("status").value = registro.status;
        document.getElementById("id").value = id;
    }else{
        alert("ERRO:" + resposta.mensagem);
        window.location.href = "../esportes/esportes.html";
    }
}

// ----------------------------------------------
// Fase 2
document.getElementById("enviar").addEventListener("click", () => {
    alterar();
});

async function alterar(){
    var nome    = document.getElementById("nome").value;
    var status  = document.getElementById("status").value;
    var id      = document.getElementById("id").value;

    const fd = new FormData();
    fd.append("nome", nome);
    fd.append("status", status);

    const retorno = await fetch("../php/esportes/esportes_alterar.php?id="+id,
        {
          method: 'POST',
          body: fd  
        });
    const resposta = await retorno.json();
    if(resposta.status == "ok"){
        alert("SUCESSO: " + resposta.mensagem);
        window.location.href = '../esportes/esportes.html'
    }else{
        alert("Erro... " + resposta.mensagem);
    }
}
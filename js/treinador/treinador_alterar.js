document.addEventListener("DOMContentLoaded", () => {
    // pega a URL e armazena em um const
    // busca nessa URL a variável id e armazana no const id.
    valida_sessao();
    const url = new URLSearchParams(window.location.search);
    const id = url.get("id");
    buscar(id);
});

async function buscar(id){
    const retorno = await fetch("../php/cliente_get.php?id="+id);
    const resposta = await retorno.json();
    if(resposta.status == "ok"){
        alert("SUCESSO:" + resposta.mensagem);
        var registro = resposta.data[0];
        document.getElementById("nome").value = registro.nome;
        document.getElementById("id_usuario").value = registro.id_usuario;
        document.getElementById("id_equipe").value = registro.id_equipe;
        document.getElementById("data_nascimento").value = registro.data_nascimento;
        document.getElementById("telefone").value = registro.telefone;
        document.getElementById("cref").value = registro.cref;
        document.getElementById("data_inicio").value = registro.data_inicio;
        document.getElementById("ativo").value = registro.ativo;
        document.getElementById("inativo").value = registro.inativo;
        document.getElementById("id").value = id;
    }else{
        alert("ERRO:" + resposta.mensagem);
        window.location.href = "../exemplo/";
    }
}

// ----------------------------------------------
// Fase 2
document.getElementById("enviar").addEventListener("click", () => {
    alterar();
});

async function alterar(){
    var nome = document.getElementById("nome").value;
    var id_usuario = document.getElementById("id_usuario").value;
    var id_equipe = document.getElementById("id_equipe").value;
    var data_nascimento = document.getElementById("data_nascimento").value;
    var telefone = document.getElementById("telefone").value;
    var cref = document.getElementById("cref").value;
    var data_inicio = document.getElementById("data_inicio").value;
    var ativo = document.getElementById("ativo").value;
    var inativo = document.getElementById("inativo").value;

    const fd = new FormData();
    fd.append("nome", nome);
    fd.append("id_usuario", id_usuario);
    fd.append("id_equipe", id_equipe);
    fd.append("data_nascimento", data_nascimento);
    fd.append("data_inicio", data_inicio);
    fd.append("ativo", ativo);
    fd.append("inativo", inativo);

    const retorno = await fetch("../php/cliente_alterar.php?id="+id,
        {
          method: 'POST',
          body: fd  
        });
    const resposta = await retorno.json();
    if(resposta.status == "ok"){
        alert("SUCESSO: " + resposta.mensagem);
        window.location.href = '../exemplo/'
    }else{
        alert("ERRO: " + resposta.mensagem);
    }
}
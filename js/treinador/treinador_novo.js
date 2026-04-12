document.getElementById("enviar").addEventListener("click", () => {
    novo ();
});

async function novo() {
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

    const retorno = await fetch("../php/cliente_novo.php",
        {
          method: 'POST',
          body: fd  
        });
    const resposta = await retorno.json();
    if(resposta.status == "ok"){
        alert("SUCESSO: " + resposta.mensagem);
        window.location.href = "../home/";
    }else{
        alert("ERRO: " + resposta.mensagem);
    }
}
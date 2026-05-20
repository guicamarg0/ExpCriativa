// a) PEGA o ID da URL 
// b) Requisita o BACKEND por GET
document.addEventListener("DOMContentLoaded", () => {
    // pega a URL e armazena em um const
    // busca nessa URL a variável id e armazana no const id.
    const url = new URLSearchParams(window.location.search);
    const id = url.get("id");
    buscarAtleta(id);
    buscarTreinos(id);

    document.getElementById("novo").addEventListener("click", () => {
        window.location.href = `treino_novo.html?id_atleta=${id}`;

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

async function excluir(id){
    const retorno = await fetch("../php/treino/treino_excluir.php?id="+id);
    const resposta = await retorno.json();
    if(resposta.status == "ok"){
        window.location.reload();    
    }else{
        alert(resposta.mensagem);
    }
}

async function buscarAtleta(id){
    const retorno = await fetch("../php/atleta/atleta_get.php?id="+id);
    const resposta = await retorno.json();
    if(resposta.status == "ok"){
        document.getElementById("nome_atleta").innerHTML = resposta.data[0].nome; //preencher nome
    }
}

async function buscarTreinos(id){
    const retorno = await fetch("../php/treino/treino_get.php?id_atleta="+id);
    const resposta = await retorno.json();
    if(resposta.status == "ok"){
        preencherCards(resposta.data);
    }else{
        document.getElementById("cards_treino").innerHTML = "<p>Nenhum treino cadastrado para esse atleta</p>";
    }
}

function preencherCards(tabela) {
  var html = '';
  for (var i = 0; i < tabela.length; i++) {
    html += `
            <div class="card-treino">
                <h3>${formatarData(tabela[i].data)}</h3>
                <p><strong>Modalidade:</strong> ${tabela[i].modalidade}</p>
                <p><strong>Detalhes:</strong> ${tabela[i].detalhes}</p>
                <p><strong>Treino montado pelo treinador: </strong> ${tabela[i].nome_treinador}</p>
                <a href="treino_alterar.html?id=${tabela[i].id}">Alterar</a>
                <a href="#" onclick="excluir(${tabela[i].id})">Excluir</a>
            </div>
        `;
  }
  document.getElementById("cards_treino").innerHTML = html;
  
  function formatarData(data){
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  }
}
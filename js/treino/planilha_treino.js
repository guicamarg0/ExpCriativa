// a) PEGA o ID da URL 
// b) Requisita o BACKEND por GET
document.addEventListener("DOMContentLoaded", () => {
    // pega a URL e armazena em um const
    // busca nessa URL a variável id e armazana no const id.
    const url = new URLSearchParams(window.location.search);
    const id = url.get("id");
    if (!id) {
        window.location.replace("atletas_treino.html");
        return;
    }
    buscarAtleta(id);
    buscarTreinos(id);

    document.getElementById("novo").addEventListener("click", () => {
        window.location.href = `treino_novo.html?id_atleta=${id}`;

    });
});

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
    if(resposta.status == "ok" && (resposta.data || []).length > 0){
        document.getElementById("nome_atleta").innerHTML = resposta.data[0].nome || ""; //preencher nome
    }
}

async function buscarTreinos(id){
    const retorno = await fetch("../php/treino/treino_get.php?id_atleta="+id);
    const resposta = await retorno.json();
    if(resposta.status == "ok" && (resposta.data || []).length > 0){
        preencherCards(resposta.data);
    }else{
        document.getElementById("cards_treino").innerHTML = "<p>Nenhum treino cadastrado para esse atleta</p>";
    }
}

function preencherCards(tabela) {
  var html = '';
  for (var i = 0; i < tabela.length; i++) {
    var treino = tabela[i] || {};
    var dataTreino = treino.data_inicio || treino.data || "";
    var tituloTreino = treino.titulo || treino.modalidade || "";
    var descricaoTreino = treino.descricao || treino.detalhes || "";
    var treinador = treino.nome_treinador || "";

    html += `
            <div class="card-treino">
                <h3>${formatarData(dataTreino)}</h3>
                <p><strong>Treino:</strong> ${tituloTreino}</p>
                <p><strong>Detalhes:</strong> ${descricaoTreino}</p>
                <p><strong>Treino montado pelo treinador: </strong> ${treinador}</p>
                <a href="treino_alterar.html?id=${treino.id}">Alterar</a>
                <a href="#" onclick="excluir(${treino.id})">Excluir</a>
            </div>
        `;
  }
  document.getElementById("cards_treino").innerHTML = html;
  
  function formatarData(data){
    if (!data) {
      return "";
    }
    data = String(data).slice(0, 10);
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  }
}

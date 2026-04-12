document.addEventListener("DOMContentLoaded", () => {
  valida_sessao();
  buscar();
});

document.getElementById("novo").addEventListener("click", () => {
    window.location.href = 'esportes_novo.html';
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

async function buscar(){
    const retorno = await fetch("../php/esportes/esportes_get.php");
    const resposta = await retorno.json();
    if(resposta.status == "ok"){
        preencherTabela(resposta.data);    
    }
}

async function excluir(id){
    const retorno = await fetch("../php/esportes/esportes_excluir.php?id="+id);
    const resposta = await retorno.json();
    if(resposta.status == "ok"){
        alert(resposta.mensagem);
        window.location.reload();    
    }else{
        alert(resposta.mensagem);
    }
}

function preencherTabela(tabela) {
  var html = `
        <table>
            <tr>
                <th> ID da modalidade </th>
                <th> Nome da modalidade </th>
                <th> Status </th>
                <th> Menu </th>
            </tr>`;
  for (var i = 0; i < tabela.length; i++) {
    html += `
            <tr>
                <td>${tabela[i].id}</td>
                <td>${tabela[i].nome}</td>
                <td>${tabela[i].status}</td>
                <td>
                    <a href='esportes_alterar.html?id=${tabela[i].id}'>Alterar</a>
                    <a href='#' onclick='excluir(${tabela[i].id})'>Excluir</a>
                </td>
            </tr>
        `;
  }
  html += "</table>";
  document.getElementById("lista").innerHTML = html;
}

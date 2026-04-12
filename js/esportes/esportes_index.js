document.addEventListener("DOMContentLoaded", () => {
  valida_sessao();
  buscar();
});

document.getElementById("novo").addEventListener("click", () => {
<<<<<<< HEAD:js/esportes/esportes_index.js
    window.location.href = 'esportes_novo.html';
=======
  window.location.href = "usuario_novo.html";
>>>>>>> 98daac1f06bce6814783b8d304e869b2fb3385df:js/index.js
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
<<<<<<< HEAD:js/esportes/esportes_index.js

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
=======
async function buscar() {
  const retorno = await fetch("../php/usuario_get.php");
  const resposta = await retorno.json();
  if (resposta.status == "ok") {
    preencherTabela(resposta.data);
  }
}

async function excluir(id) {
  const retorno = await fetch("../php/usuario_excluir.php?id=" + id);
  const resposta = await retorno.json();
  if (resposta.status == "ok") {
    alert(resposta.mensagem);
    window.location.reload();
  } else {
    alert(resposta.mensagem);
  }
>>>>>>> 98daac1f06bce6814783b8d304e869b2fb3385df:js/index.js
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
<<<<<<< HEAD:js/esportes/esportes_index.js
                    <a href='esportes_alterar.html?id=${tabela[i].id}'>Alterar</a>
=======
                    <a href='usuario_alterar.html?id=${tabela[i].id}'>Alterar</a>
>>>>>>> 98daac1f06bce6814783b8d304e869b2fb3385df:js/index.js
                    <a href='#' onclick='excluir(${tabela[i].id})'>Excluir</a>
                </td>
            </tr>
        `;
<<<<<<< HEAD:js/esportes/esportes_index.js
    }
    html += '</table>';
    document.getElementById("lista").innerHTML = html;
}
=======
  }
  html += "</table>";
  document.getElementById("lista").innerHTML = html;
}
>>>>>>> 98daac1f06bce6814783b8d304e869b2fb3385df:js/index.js

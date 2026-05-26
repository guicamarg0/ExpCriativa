document.addEventListener("DOMContentLoaded", () => {
  buscar();
});

async function buscar(){
    const retorno = await fetch("../php/atleta/atleta_get.php");
    const resposta = await retorno.json();
    if(resposta.status == "ok"){
        preencherTabela(resposta.data);    
    }
}

function preencherTabela(tabela) {
  var html = `
        <table>
            <tr>
                <th> ID do Atleta </th>
                <th> Nome </th>
                <th> Menu </th>
            </tr>`;
  for (var i = 0; i < tabela.length; i++) {
    html += `
            <tr>
                <td>${tabela[i].id}</td>
                <td>${tabela[i].nome}</td>
                <td>
                    <button class="btn-planilha" onclick="window.location.href='planilha_treino.html?id=${tabela[i].id}'">
                    Visualizar Planilha de Treinos
                    </button>
                </td>
            </tr>
        `;
  }
  html += "</table>";
  document.getElementById("lista").innerHTML = html;
}

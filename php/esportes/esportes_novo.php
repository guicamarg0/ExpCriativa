<?php
include_once('../conexao.php');

// Configurando o padrão de retorno inicial
$retorno = [
    'status'    => 'nok', // Default to 'nok' (not ok)
    'mensagem'  => 'Falha ao processar a requisição.', // Default error message
    'data'      => []
];

// Verifica se os dados necessários foram enviados via POST
if (isset($_POST['nome']) && isset($_POST['status'])) {
    $nome    = $_POST['nome'];
    $status  = $_POST['status'];

    // Prepara a declaração SQL para inserção no banco de dados
    // Usando prepared statements para prevenir SQL injection
    $stmt = $conexao->prepare("INSERT INTO modalidades(nome, status) VALUES(?, ?)");
    // Vincula os parâmetros: "ss" indica que ambos são strings
    $stmt->bind_param("ss", $nome, $status);

    // Executa a declaração
    if ($stmt->execute()) {
        // Verifica se alguma linha foi afetada pela inserção
        if ($stmt->affected_rows > 0) {
            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Registro inserido com sucesso.',
                'data'      => []
            ];
        } else {
            // Caso a query execute mas não afete linhas (pode ocorrer em casos específicos)
            $retorno['mensagem'] = 'Nenhum registro foi inserido.';
        }
    } else {
        // Erro durante a execução da query
        $retorno['mensagem'] = 'Erro ao executar a consulta de inserção: ' . $stmt->error;
    }
    // Fecha a declaração preparada
    $stmt->close();
} else {
    // Dados POST ausentes
    $retorno['mensagem'] = 'Dados insuficientes para inserir o registro (nome e status são obrigatórios).';
}

// Fecha a conexão com o banco de dados
$conexao->close();

// Define o cabeçalho para indicar que o conteúdo é JSON
header("Content-type:application/json;charset=utf-8");
// Codifica o array de retorno para JSON e o exibe
echo json_encode($retorno);
?>

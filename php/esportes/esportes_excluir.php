<?php
include_once('../conexao.php');

// Configurando o padrão de retorno inicial
$retorno = [
    'status'    => 'nok', // Default to 'nok' (not ok)
    'mensagem'  => 'Falha ao processar a requisição.', // Default error message
    'data'      => []
];

// Verifica se o ID foi fornecido via GET
if (isset($_GET['id'])) {
    $id = $_GET['id'];

    // Prepara a declaração SQL para exclusão do banco de dados
    // Usando prepared statements para prevenir SQL injection
    $stmt = $conexao->prepare("DELETE FROM modalidades WHERE id = ?");
    // Vincula o parâmetro: "i" indica integer
    $stmt->bind_param("i", $id);

    // Executa a declaração
    if ($stmt->execute()) {
        // Verifica se alguma linha foi afetada pela exclusão
        if ($stmt->affected_rows > 0) {
            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Registro excluído com sucesso.',
                'data'      => []
            ];
        } else {
            // Query executada, mas nenhuma linha foi afetada (ID não encontrado)
            $retorno['mensagem'] = 'Nenhum registro com o ID informado foi encontrado para exclusão.';
        }
    } else {
        // Erro durante a execução da query
        $retorno['mensagem'] = 'Erro ao executar a consulta de exclusão: ' . $stmt->error;
    }
    // Fecha a declaração preparada
    $stmt->close();
} else {
    // ID via GET não fornecido
    $retorno['mensagem'] = 'É necessário informar um ID para exclusão.';
}

// Fecha a conexão com o banco de dados
$conexao->close();

// Define o cabeçalho para indicar que o conteúdo é JSON
header("Content-type:application/json;charset=utf-8");
// Codifica o array de retorno para JSON e o exibe
echo json_encode($retorno);
?>

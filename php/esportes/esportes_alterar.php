<?php
include_once('../conexao.php');

// Configurando o padrão de retorno inicial
$retorno = [
    'status'    => 'nok', // Default to 'nok' (not ok)
    'mensagem'  => 'Falha ao processar a requisição.', // Default error message
    'data'      => []
];

// Verifica se o ID foi fornecido via GET e os dados necessários via POST
if (isset($_GET['id']) && isset($_POST['nome']) && isset($_POST['status'])) {
    $id      = $_GET['id'];
    $nome    = $_POST['nome'];
    $status  = $_POST['status'];

    // Prepara a declaração SQL para atualização no banco de dados
    // Usando prepared statements para prevenir SQL injection
    $stmt = $conexao->prepare("UPDATE modalidades SET nome = ?, status = ? WHERE id = ?");
    // Vincula os parâmetros: "ssi" indica string, string, integer
    $stmt->bind_param("ssi", $nome, $status, $id);

    // Executa a declaração
    if ($stmt->execute()) {
        // Verifica se alguma linha foi afetada pela atualização
        if ($stmt->affected_rows > 0) {
            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Registro alterado com sucesso.',
                'data'      => []
            ];
        } else {
            // Query executada, mas nenhuma linha foi afetada (pode ser ID não encontrado ou dados idênticos)
            $retorno['mensagem'] = 'Nenhum registro foi alterado (verifique o ID e os dados fornecidos).';
        }
    } else {
        // Erro durante a execução da query
        $retorno['mensagem'] = 'Erro ao executar a consulta de atualização: ' . $stmt->error;
    }
    // Fecha a declaração preparada
    $stmt->close();
} else {
    // ID via GET ausente ou dados POST insuficientes
    if (!isset($_GET['id'])) {
        $retorno['mensagem'] = 'Não é possível alterar um registro sem um ID informado.';
    } else {
        $retorno['mensagem'] = 'Dados insuficientes para alterar o registro (nome e status são obrigatórios).';
    }
}

// Fecha a conexão com o banco de dados
$conexao->close();

// Define o cabeçalho para indicar que o conteúdo é JSON
header("Content-type:application/json;charset=utf-8");
// Codifica o array de retorno para JSON e o exibe
echo json_encode($retorno);
?>

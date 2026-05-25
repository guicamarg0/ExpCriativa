<?php
// Retorno em JSON
header("Content-type:application/json;charset:utf-8");
// Conexão com banco
include_once('../conexao.php');
// Estrutura padrão de retorno
$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];

// Se houver erro de conexão
if (!empty($conexao_error)) {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Erro de conexão com o banco.',
        'data' => []
    ];
    echo json_encode($retorno);
    exit;
}

// CONSULTA POR ID OU LISTAGEM
if (isset($_GET['id'])) {
    // Busca por ID
    $stmt = $conexao->prepare("SELECT * FROM modalidades WHERE id = ?");
    $stmt->bind_param("i", $_GET['id']);
} else {
    // Lista todos
    $stmt = $conexao->prepare("SELECT * FROM modalidades");
}

// Segurança: verifica se prepare funcionou
if (!$stmt) {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Erro ao preparar consulta.',
        'data' => []
    ];
    echo json_encode($retorno);
    exit;
}

// Executa query
$stmt->execute();
$resultado = $stmt->get_result();
$tabela = [];

// Monta array de retorno
if ($resultado->num_rows > 0) {
    while ($linha = $resultado->fetch_assoc()) {
        $tabela[] = $linha;
    }
    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Consulta realizada com sucesso.',
        'data' => $tabela
    ];
} else {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Nenhum registro encontrado.',
        'data' => []
    ];
}

// Fecha recursos
$stmt->close();
$conexao->close();
// Retorno final JSON
echo json_encode($retorno);
?>
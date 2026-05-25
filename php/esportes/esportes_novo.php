<?php
// Retorno sempre em JSON
header("Content-type:application/json;charset=utf-8");
// Conexão com banco
include_once('../conexao.php');
// Estrutura padrão de retorno
$retorno = [
    'status'   => 'nok',
    'mensagem' => 'Falha ao processar a requisição.',
    'data'     => []
];

// Verifica conexão
if (!empty($conexao_error)) {
    $retorno = [
        'status'   => 'nok',
        'mensagem' => 'Erro de conexão com o banco.',
        'data'     => []
    ];
    echo json_encode($retorno);
    exit;
}

// Verifica dados obrigatórios
if (!isset($_POST['nome']) || !isset($_POST['status'])) {
    $retorno = [
        'status'   => 'nok',
        'mensagem' => 'Nome e status são obrigatórios.',
        'data'     => []
    ];
    echo json_encode($retorno);
    exit;
}

// Recebe dados
$nome   = $_POST['nome'];
$status = $_POST['status'];
// Prepara insert
$stmt = $conexao->prepare("
    INSERT INTO modalidades (nome, status)
    VALUES (?, ?)
");

if (!$stmt) {
    $retorno = [
        'status'   => 'nok',
        'mensagem' => 'Erro ao preparar query.',
        'data'     => []
    ];
    echo json_encode($retorno);
    exit;
}

// Vincula parâmetros
$stmt->bind_param("ss", $nome, $status);

// Executa
if ($stmt->execute() && $stmt->affected_rows > 0) {
    $retorno = [
        'status'   => 'ok',
        'mensagem' => 'Modalidade cadastrada com sucesso.',
        'data'     => []
    ];
} else {
    $retorno = [
        'status'   => 'nok',
        'mensagem' => 'Falha ao inserir registro.',
        'data'     => []
    ];
}

// Fecha conexão
$stmt->close();
$conexao->close();
// Retorno final
echo json_encode($retorno);
?>
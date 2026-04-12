<?php
include_once('../conexao.php');

$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];

if (!empty($conexao_error)) {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Erro de conexão com o banco.',
        'data' => []
    ];

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
    exit;
}

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
$nome = trim($_POST['nome'] ?? '');
$status = strtolower(trim($_POST['status'] ?? 'ativo'));

if ($id <= 0) {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'É necessário informar um ID válido.',
        'data' => []
    ];

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
    exit;
}

if ($nome === '') {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Informe o nome da modalidade.',
        'data' => []
    ];

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
    exit;
}

if ($status !== 'inativo') {
    $status = 'ativo';
}

$stmt = $conexao->prepare("UPDATE modalidades SET nome = ?, status = ? WHERE id = ?");

if (!$stmt) {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Falha ao preparar alteração.',
        'data' => []
    ];

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
    exit;
}

$stmt->bind_param("ssi", $nome, $status, $id);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Registro alterado com sucesso.',
        'data' => []
    ];
} else {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Não houve alterações no registro.',
        'data' => []
    ];
}

$stmt->close();
$conexao->close();

header("Content-type:application/json;charset:utf-8");
echo json_encode($retorno);

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

$nome = trim($_POST['nome'] ?? '');
$status = strtolower(trim($_POST['status'] ?? 'ativo'));

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

$stmt = $conexao->prepare("INSERT INTO modalidades(nome, status) VALUES(?, ?)");

if (!$stmt) {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Falha ao preparar cadastro.',
        'data' => []
    ];

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
    exit;
}

$stmt->bind_param("ss", $nome, $status);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Registro inserido com sucesso.',
        'data' => []
    ];
} else {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Falha ao inserir o registro.',
        'data' => []
    ];
}

$stmt->close();
$conexao->close();

header("Content-type:application/json;charset:utf-8");
echo json_encode($retorno);

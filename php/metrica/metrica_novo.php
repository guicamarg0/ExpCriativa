<?php
header("Content-type:application/json;charset:utf-8");
include_once('../conexao.php');
include_once('../permissao.php');
exigir_admin();

$retorno = [
    'status' => 'nok',
    'mensagem' => 'Falha ao cadastrar métrica.',
    'data' => []
];

$nome = trim($_POST['nome'] ?? '');
$descricao = $_POST['descricao'] ?? '';
$unidade = $_POST['unidade_medida'] ?? '';
$tipo = $_POST['tipo'] ?? 'numero';
$status = $_POST['status'] ?? 'ativo';

if ($nome === '') {
    $retorno['mensagem'] = 'Nome da métrica é obrigatório.';
    echo json_encode($retorno);
    exit;
}

$tiposPermitidos = ['numero', 'escala_0_10', 'aproveitamento'];

if (!in_array($tipo, $tiposPermitidos)) {
    $tipo = 'numero';
}

$stmt = $conexao->prepare("INSERT INTO metricas (nome, descricao, unidade_medida, tipo, status) VALUES (?, ?, ?, ?, ?)");

if (!$stmt) {
    $retorno['mensagem'] = 'Erro ao preparar cadastro: ' . $conexao->error;
    echo json_encode($retorno);
    exit;
}

$stmt->bind_param("sssss", $nome, $descricao, $unidade, $tipo, $status);

if ($stmt->execute()) {
    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Métrica cadastrada com sucesso.',
        'data' => [
            'id' => $stmt->insert_id
        ]
    ];
} else {
    $retorno['mensagem'] = 'Erro ao cadastrar métrica: ' . $stmt->error;
}

$stmt->close();
$conexao->close();

echo json_encode($retorno);

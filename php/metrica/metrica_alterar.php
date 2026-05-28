<?php
header("Content-type:application/json;charset:utf-8");
include_once('../conexao.php');
include_once('../permissao.php');
exigir_admin();

$retorno = [
    'status' => 'nok',
    'mensagem' => 'Falha ao alterar métrica.',
    'data' => []
];

$id = (int) ($_POST['id'] ?? 0);
$nome = trim($_POST['nome'] ?? '');
$descricao = $_POST['descricao'] ?? '';
$unidade = $_POST['unidade_medida'] ?? '';
$tipo = $_POST['tipo'] ?? 'numero';
$status = $_POST['status'] ?? 'ativo';

if ($id <= 0 || $nome === '') {
    $retorno['mensagem'] = 'ID e nome são obrigatórios.';
    echo json_encode($retorno);
    exit;
}

$tiposPermitidos = ['numero', 'escala_0_10', 'aproveitamento'];

if (!in_array($tipo, $tiposPermitidos)) {
    $tipo = 'numero';
}

$stmt = $conexao->prepare("UPDATE metricas SET nome = ?, descricao = ?, unidade_medida = ?, tipo = ?, status = ? WHERE id = ?");

if (!$stmt) {
    $retorno['mensagem'] = 'Erro ao preparar alteração: ' . $conexao->error;
    echo json_encode($retorno);
    exit;
}

$stmt->bind_param("sssssi", $nome, $descricao, $unidade, $tipo, $status, $id);
$stmt->execute();
$stmt->close();
$conexao->close();

$retorno = [
    'status' => 'ok',
    'mensagem' => 'Métrica alterada com sucesso.',
    'data' => []
];

echo json_encode($retorno);

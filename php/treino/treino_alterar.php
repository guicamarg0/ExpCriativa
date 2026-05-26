<?php
header("Content-type:application/json;charset:utf-8");
include_once('../conexao.php');

$retorno = [
    'status' => 'nok',
    'mensagem' => 'Não posso alterar um registro sem um ID informado.',
    'data' => []
];

if (!isset($_GET['id'])) {
    echo json_encode($retorno);
    exit;
}

$id = (int) $_GET['id'];
$titulo = trim($_POST['modalidade'] ?? '');
$dataInicio = $_POST['data'] ?? '';
$descricao = $_POST['detalhes'] ?? '';

if ($id <= 0 || $titulo === '' || $dataInicio === '') {
    $retorno['mensagem'] = 'Dados obrigatórios não informados.';
    echo json_encode($retorno);
    exit;
}

$dataInicio .= strlen($dataInicio) === 10 ? ' 00:00:00' : '';

$stmt = $conexao->prepare("
    UPDATE treinos
    SET titulo = ?, data_inicio = ?, descricao = ?
    WHERE id = ?
");

if (!$stmt) {
    $retorno['mensagem'] = 'Erro ao preparar alteração: ' . $conexao->error;
    echo json_encode($retorno);
    exit;
}

$stmt->bind_param("sssi", $titulo, $dataInicio, $descricao, $id);
$stmt->execute();
$stmt->close();
$conexao->close();

$retorno = [
    'status' => 'ok',
    'mensagem' => 'Registro alterado com sucesso.',
    'data' => []
];

echo json_encode($retorno);

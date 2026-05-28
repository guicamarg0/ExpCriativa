<?php
header("Content-type:application/json;charset:utf-8");
include_once('../conexao.php');

$retorno = [
    'status' => 'nok',
    'mensagem' => 'Falha ao alterar desempenho.',
    'data' => []
];

$id = (int) ($_POST['id'] ?? 0);
$idMetrica = (int) ($_POST['id_metrica'] ?? 0);
$valor = $_POST['valor'] ?? '';
$observacao = $_POST['observacao'] ?? '';

if ($id <= 0 || $idMetrica <= 0 || $valor === '') {
    $retorno['mensagem'] = 'ID, métrica e valor são obrigatórios.';
    echo json_encode($retorno);
    exit;
}

$stmt = $conexao->prepare("
    UPDATE desempenho_atleta
    SET id_metrica = ?, valor = ?, observacao = ?
    WHERE id = ?
");

if (!$stmt) {
    $retorno['mensagem'] = 'Erro ao preparar alteração: ' . $conexao->error;
    echo json_encode($retorno);
    exit;
}

$stmt->bind_param("issi", $idMetrica, $valor, $observacao, $id);
$stmt->execute();
$stmt->close();
$conexao->close();

$retorno = [
    'status' => 'ok',
    'mensagem' => 'Desempenho alterado com sucesso.',
    'data' => []
];

echo json_encode($retorno);

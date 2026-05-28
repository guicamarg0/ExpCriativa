<?php
header("Content-type:application/json;charset:utf-8");
include_once('../conexao.php');
include_once('../permissao.php');
exigir_admin();

$retorno = [
    'status' => 'nok',
    'mensagem' => 'É necessário informar um ID para exclusão.',
    'data' => []
];

if (isset($_GET['id'])) {
    $id = (int) $_GET['id'];
    $status = 'inativo';
    $stmt = $conexao->prepare("UPDATE metricas SET status = ? WHERE id = ?");
    $stmt->bind_param("si", $status, $id);
    $stmt->execute();
    $stmt->close();

    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Métrica inativada com sucesso.',
        'data' => []
    ];
}

$conexao->close();

echo json_encode($retorno);

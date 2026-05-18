<?php
include_once('../conexao.php');

$id = (int) $_GET['id'];

$stmt = $conexao->prepare("DELETE FROM modalidades WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();

$retorno = [
    'status' => 'ok',
    'mensagem' => 'Registro excluido com sucesso.',
    'data' => []
];

$stmt->close();
$conexao->close();

header("Content-type:application/json;charset=utf-8");
echo json_encode($retorno);

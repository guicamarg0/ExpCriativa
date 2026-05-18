<?php
include_once('../conexao.php');

$id = (int) $_GET['id'];

$stmt = $conexao->prepare("DELETE FROM equipes WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();

$retorno = [
    'status' => 'ok',
    'mensagem' => 'Equipe excluida com sucesso.',
    'data' => []
];

$stmt->close();
$conexao->close();

header("Content-type:application/json;charset:utf-8");
echo json_encode($retorno);

<?php
include_once('../conexao.php');

$id = (int) $_GET['id'];
$nome = $_POST['nome'];
$status = $_POST['status'];

$stmt = $conexao->prepare("UPDATE modalidades SET nome = ?, status = ? WHERE id = ?");
$stmt->bind_param("ssi", $nome, $status, $id);
$stmt->execute();

$retorno = [
    'status' => 'ok',
    'mensagem' => 'Registro alterado com sucesso.',
    'data' => []
];

$stmt->close();
$conexao->close();

header("Content-type:application/json;charset=utf-8");
echo json_encode($retorno);

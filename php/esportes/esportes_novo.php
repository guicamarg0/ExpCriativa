<?php
include_once('../conexao.php');

$nome = $_POST['nome'];
$status = $_POST['status'];

$stmt = $conexao->prepare("INSERT INTO modalidades(nome, status) VALUES(?, ?)");
$stmt->bind_param("ss", $nome, $status);
$stmt->execute();

$retorno = [
    'status' => 'ok',
    'mensagem' => 'Registro inserido com sucesso.',
    'data' => [
        'id' => $stmt->insert_id
    ]
];

$stmt->close();
$conexao->close();

header("Content-type:application/json;charset=utf-8");
echo json_encode($retorno);

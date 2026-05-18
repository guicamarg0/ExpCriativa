<?php
include_once('../conexao.php');

$id = (int) $_POST['id'];
$nome = $_POST['nome'];
$descricao = $_POST['descricao'] ?? '';
$id_modalidade = $_POST['id_modalidade'] ?? '';
$id_genero = $_POST['id_genero'] ?? '';
$categoria = $_POST['categoria'] ?? '';
$status = $_POST['status'] ?? 'ativa';
$id_treinador_responsavel = $_POST['id_treinador_responsavel'] ?? '';

$stmt = $conexao->prepare(
    "UPDATE equipes SET
        nome = ?,
        descricao = ?,
        id_modalidade = NULLIF(?, ''),
        id_genero = NULLIF(?, ''),
        categoria = ?,
        status = ?,
        id_treinador_responsavel = NULLIF(?, '')
    WHERE id = ?"
);

$stmt->bind_param(
    "sssssssi",
    $nome,
    $descricao,
    $id_modalidade,
    $id_genero,
    $categoria,
    $status,
    $id_treinador_responsavel,
    $id
);
$stmt->execute();

$retorno = [
    'status' => 'ok',
    'mensagem' => 'Equipe alterada com sucesso.',
    'data' => []
];

$stmt->close();
$conexao->close();

header("Content-type:application/json;charset:utf-8");
echo json_encode($retorno);

<?php
include_once('../conexao.php');
include_once('../permissao.php');
exigir_admin();

$nome = $_POST['nome'];
$descricao = $_POST['descricao'] ?? '';
$id_modalidade = $_POST['id_modalidade'] ?? '';
$id_genero = $_POST['id_genero'] ?? '';
$categoria = $_POST['categoria'] ?? '';
$status = 'ativa';
$id_treinador_responsavel = $_POST['id_treinador_responsavel'] ?? '';

$stmt = $conexao->prepare(
    "INSERT INTO equipes (
        nome,
        descricao,
        id_modalidade,
        id_genero,
        categoria,
        status,
        id_treinador_responsavel
    ) VALUES(?, ?, NULLIF(?, ''), NULLIF(?, ''), ?, ?, NULLIF(?, ''))"
);

$stmt->bind_param(
    "sssssss",
    $nome,
    $descricao,
    $id_modalidade,
    $id_genero,
    $categoria,
    $status,
    $id_treinador_responsavel
);
$stmt->execute();

$retorno = [
    'status' => 'ok',
    'mensagem' => 'Equipe cadastrada com sucesso',
    'data' => [
        'id' => $stmt->insert_id
    ]
];

$stmt->close();
$conexao->close();

header("Content-type:application/json;charset:utf-8");
echo json_encode($retorno);

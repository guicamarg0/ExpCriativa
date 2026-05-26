<?php
include_once('../conexao.php');

$nome = $_POST['nome'];
$data_nascimento = $_POST['data_nascimento'] ?? '';
$id_genero = $_POST['id_genero'] ?? '';
$altura = $_POST['altura'] ?? '';
$peso = $_POST['peso'] ?? '';
$email = $_POST['email'];
$senha = $_POST['senha'];
$status = $_POST['status'] ?? 'ativo';

$stmtUsuario = $conexao->prepare("INSERT INTO usuarios (email, senha, id_nivel, status) VALUES (?, ?, 3, ?)");
$stmtUsuario->bind_param("sss", $email, $senha, $status);
$stmtUsuario->execute();
$idUsuario = (int) $stmtUsuario->insert_id;

$stmtAtleta = $conexao->prepare(
    "INSERT INTO atletas (
        id_usuario,
        nome,
        data_nascimento,
        id_genero,
        altura,
        peso,
        status
    ) VALUES (
        ?,
        ?,
        NULLIF(?, ''),
        NULLIF(?, ''),
        NULLIF(?, ''),
        NULLIF(?, ''),
        ?
    )"
);

$stmtAtleta->bind_param(
    "issssss",
    $idUsuario,
    $nome,
    $data_nascimento,
    $id_genero,
    $altura,
    $peso,
    $status
);
$stmtAtleta->execute();

$retorno = [
    'status' => 'ok',
    'mensagem' => 'Atleta cadastrado com sucesso.',
    'data' => [
        'id' => $stmtAtleta->insert_id,
        'id_usuario' => $idUsuario
    ]
];

$stmtAtleta->close();
$stmtUsuario->close();
$conexao->close();

header("Content-type:application/json;charset:utf-8");
echo json_encode($retorno);

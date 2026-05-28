<?php
include_once('../conexao.php');
include_once('../permissao.php');
exigir_admin();

$nome = $_POST['nome'];
$data_nascimento = $_POST['data_nascimento'] ?? '';
$telefone = $_POST['telefone'] ?? '';
$cref = $_POST['cref'] ?? '';
$data_inicio = $_POST['data_inicio'] ?? '';
$email = $_POST['email'];
$senha = $_POST['senha'];
$status = $_POST['status'] ?? 'ativo';

$stmtUsuario = $conexao->prepare(
    "INSERT INTO usuarios (email, senha, id_nivel, status) VALUES (?, ?, 2, ?)"
);
$stmtUsuario->bind_param("sss", $email, $senha, $status);
$stmtUsuario->execute();
$idUsuario = (int) $stmtUsuario->insert_id;

$stmtTreinador = $conexao->prepare(
    "INSERT INTO treinadores (
        id_usuario,
        nome,
        cref,
        telefone,
        data_nascimento,
        data_inicio,
        status
    ) VALUES (
        ?,
        ?,
        ?,
        ?,
        NULLIF(?, ''),
        NULLIF(?, ''),
        ?
    )"
);

$stmtTreinador->bind_param(
    "issssss",
    $idUsuario,
    $nome,
    $cref,
    $telefone,
    $data_nascimento,
    $data_inicio,
    $status
);
$stmtTreinador->execute();

$retorno = [
    'status' => 'ok',
    'mensagem' => 'Treinador cadastrado com sucesso.',
    'data' => [
        'id' => $stmtTreinador->insert_id,
        'id_usuario' => $idUsuario
    ]
];

$stmtTreinador->close();
$stmtUsuario->close();
$conexao->close();

header("Content-type:application/json;charset:utf-8");
echo json_encode($retorno);

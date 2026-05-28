<?php
include_once('../conexao.php');
include_once('../permissao.php');
exigir_admin();

$id = (int) $_POST['id'];
$nome = $_POST['nome'];
$data_nascimento = $_POST['data_nascimento'] ?? '';
$id_genero = $_POST['id_genero'] ?? '';
$altura = $_POST['altura'] ?? '';
$peso = $_POST['peso'] ?? '';
$status = $_POST['status'] ?? 'ativo';

$stmtBusca = $conexao->prepare("SELECT id_usuario FROM atletas WHERE id = ?");
$stmtBusca->bind_param("i", $id);
$stmtBusca->execute();
$atletaAtual = $stmtBusca->get_result()->fetch_assoc();
$idUsuario = (int) $atletaAtual['id_usuario'];
$stmtBusca->close();

$stmt = $conexao->prepare(
    "UPDATE atletas SET
        nome = ?,
        data_nascimento = NULLIF(?, ''),
        id_genero = NULLIF(?, ''),
        altura = NULLIF(?, ''),
        peso = NULLIF(?, ''),
        status = ?
     WHERE id = ?"
);
$stmt->bind_param("ssssssi", $nome, $data_nascimento, $id_genero, $altura, $peso, $status, $id);
$stmt->execute();
$stmt->close();

$stmtUsuario = $conexao->prepare("UPDATE usuarios SET status = ? WHERE id = ?");
$stmtUsuario->bind_param("si", $status, $idUsuario);
$stmtUsuario->execute();
$stmtUsuario->close();

$retorno = [
    'status' => 'ok',
    'mensagem' => 'Cadastro do atleta alterado com sucesso.',
    'data' => []
];

$conexao->close();

header("Content-type:application/json;charset:utf-8");
echo json_encode($retorno);

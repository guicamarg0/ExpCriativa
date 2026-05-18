<?php
include_once('../conexao.php');

$id = (int) $_GET['id'];

$stmtBusca = $conexao->prepare("SELECT id_usuario FROM atletas WHERE id = ?");
$stmtBusca->bind_param("i", $id);
$stmtBusca->execute();
$atletaAtual = $stmtBusca->get_result()->fetch_assoc();
$idUsuario = (int) $atletaAtual['id_usuario'];
$stmtBusca->close();

$stmtExcluiAtleta = $conexao->prepare("DELETE FROM atletas WHERE id = ?");
$stmtExcluiAtleta->bind_param("i", $id);
$stmtExcluiAtleta->execute();
$stmtExcluiAtleta->close();

$stmtExcluiUsuario = $conexao->prepare("DELETE FROM usuarios WHERE id = ?");
$stmtExcluiUsuario->bind_param("i", $idUsuario);
$stmtExcluiUsuario->execute();
$stmtExcluiUsuario->close();

$retorno = [
    'status' => 'ok',
    'mensagem' => 'Atleta excluido com sucesso.',
    'data' => []
];

$conexao->close();

header("Content-type:application/json;charset:utf-8");
echo json_encode($retorno);

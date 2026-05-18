<?php
include_once('../conexao.php');

$id = (int) $_GET['id'];

$stmtBusca = $conexao->prepare("SELECT id_usuario FROM treinadores WHERE id = ?");
$stmtBusca->bind_param("i", $id);
$stmtBusca->execute();
$treinadorAtual = $stmtBusca->get_result()->fetch_assoc();
$idUsuario = (int) $treinadorAtual['id_usuario'];
$stmtBusca->close();

$stmtTreinador = $conexao->prepare("DELETE FROM treinadores WHERE id = ?");
$stmtTreinador->bind_param("i", $id);
$stmtTreinador->execute();
$stmtTreinador->close();

$stmtUsuario = $conexao->prepare("DELETE FROM usuarios WHERE id = ?");
$stmtUsuario->bind_param("i", $idUsuario);
$stmtUsuario->execute();
$stmtUsuario->close();

$retorno = [
    'status' => 'ok',
    'mensagem' => 'Treinador excluido com sucesso.',
    'data' => []
];

$conexao->close();

header("Content-type:application/json;charset:utf-8");
echo json_encode($retorno);

<?php
include_once('../conexao.php');

$idEquipe = (int) $_POST['id_equipe'];
$idsTexto = $_POST['atletas_ids'] ?? '';

$ids = [];
if ($idsTexto !== '') {
    $partes = explode(',', $idsTexto);
    foreach ($partes as $parte) {
        $valor = (int) $parte;
        if ($valor > 0) {
            $ids[] = $valor;
        }
    }
}

$ids = array_values(array_unique($ids));

$stmtLimpar = $conexao->prepare("UPDATE atletas SET id_equipe = NULL WHERE id_equipe = ?");
$stmtLimpar->bind_param("i", $idEquipe);
$stmtLimpar->execute();
$stmtLimpar->close();

if (count($ids) > 0) {
    $idsSql = implode(',', $ids);
    $stmtVincular = $conexao->prepare("UPDATE atletas SET id_equipe = ? WHERE id IN ($idsSql)");
    $stmtVincular->bind_param("i", $idEquipe);
    $stmtVincular->execute();
    $stmtVincular->close();
}

$conexao->close();

$retorno = [
    'status' => 'ok',
    'mensagem' => 'Atletas vinculados com sucesso.',
    'data' => []
];

header("Content-type:application/json;charset:utf-8");
echo json_encode($retorno);

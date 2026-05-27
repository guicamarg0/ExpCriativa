<?php
include_once('../conexao.php');

$retorno = ['status'=>'nok','mensagem'=>'','data'=>[]];

$idAtleta = isset($_GET['id_atleta']) ? (int) $_GET['id_atleta'] : 0;

try {
    if ($idAtleta <= 0) {
        throw new Exception('id_atleta obrigatório');
    }

    $stmt = $conexao->prepare("SELECT data_registro, velocidade, resistencia, observacao FROM desempenho WHERE id_atleta = ? ORDER BY data_registro ASC LIMIT 20");
    $stmt->bind_param('i', $idAtleta);
    $stmt->execute();
    $res = $stmt->get_result();
    $rows = [];
    while ($r = $res->fetch_assoc()) {
        $rows[] = $r;
    }
    $stmt->close();

    $retorno['status'] = 'ok';
    $retorno['data'] = $rows;
} catch (Exception $e) {
    $retorno['status'] = 'nok';
    $retorno['mensagem'] = $e->getMessage();
}

header('Content-type: application/json; charset=utf-8');
echo json_encode($retorno);

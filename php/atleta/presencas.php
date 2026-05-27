<?php
include_once('../conexao.php');

$retorno = ['status'=>'nok','mensagem'=>'','data'=>[]];

$idAtleta = isset($_GET['id_atleta']) ? (int) $_GET['id_atleta'] : 0;

try {
    if ($idAtleta <= 0) {
        throw new Exception('id_atleta obrigatório');
    }

    // presenças por mês (últimos 6 meses)
    $stmt = $conexao->prepare(
        "SELECT YEAR(criado_em) AS ano, MONTH(criado_em) AS mes, SUM(presente) AS presentes, COUNT(*) AS total
         FROM presencas
         WHERE id_atleta = ? AND criado_em >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
         GROUP BY YEAR(criado_em), MONTH(criado_em)
         ORDER BY YEAR(criado_em), MONTH(criado_em)"
    );
    $stmt->bind_param('i', $idAtleta);
    $stmt->execute();
    $res = $stmt->get_result();
    $rows = [];
    while ($r = $res->fetch_assoc()) {
        $rows[] = $r;
    }
    $stmt->close();

    // últimas presenças recentes
    $stmt2 = $conexao->prepare("SELECT p.id, p.id_treino, p.presente, p.criado_em, t.tipo, t.data_inicio FROM presencas p LEFT JOIN treinos t ON t.id = p.id_treino WHERE p.id_atleta = ? ORDER BY p.criado_em DESC LIMIT 12");
    $stmt2->bind_param('i', $idAtleta);
    $stmt2->execute();
    $res2 = $stmt2->get_result();
    $recent = [];
    while ($r = $res2->fetch_assoc()) {
        $recent[] = $r;
    }
    $stmt2->close();

    $retorno['status'] = 'ok';
    $retorno['data'] = ['por_mes' => $rows, 'recentes' => $recent];
} catch (Exception $e) {
    $retorno['status'] = 'nok';
    $retorno['mensagem'] = $e->getMessage();
}

header('Content-type: application/json; charset=utf-8');
echo json_encode($retorno);

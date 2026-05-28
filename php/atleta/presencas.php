<?php
include_once('../conexao.php');
include_once('../permissao.php');
exigir_usuario_logado();

$retorno = ['status' => 'nok', 'mensagem' => '', 'data' => []];

$idAtleta = isset($_GET['id_atleta']) ? (int) $_GET['id_atleta'] : 0;

try {
    if ($idAtleta <= 0) {
        throw new Exception('id_atleta obrigatorio');
    }

    if (!atleta_permitido($conexao, $idAtleta)) {
        responder_sem_permissao();
    }

    $stmt = $conexao->prepare(
        "SELECT YEAR(data_registro) AS ano, MONTH(data_registro) AS mes, SUM(presente) AS presentes, COUNT(*) AS total
         FROM presencas
         WHERE id_atleta = ? AND data_registro >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
         GROUP BY YEAR(data_registro), MONTH(data_registro)
         ORDER BY YEAR(data_registro), MONTH(data_registro)"
    );
    $stmt->bind_param('i', $idAtleta);
    $stmt->execute();
    $res = $stmt->get_result();
    $rows = [];
    while ($r = $res->fetch_assoc()) {
        $rows[] = $r;
    }
    $stmt->close();

    $stmt2 = $conexao->prepare("
        SELECT
            p.id,
            p.id_treino,
            p.presente,
            p.data_registro,
            t.titulo,
            t.data_inicio
        FROM presencas p
        LEFT JOIN treinos t ON t.id = p.id_treino
        WHERE p.id_atleta = ?
        ORDER BY p.data_registro DESC
        LIMIT 12
    ");
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

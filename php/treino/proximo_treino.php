<?php
include_once('../conexao.php');

$retorno = ['status' => 'nok', 'mensagem' => '', 'data' => null];

$idAtleta = isset($_GET['id_atleta']) ? (int) $_GET['id_atleta'] : 0;

try {
    if ($idAtleta > 0) {
        $stmt = $conexao->prepare("
            SELECT
                t.id,
                t.data_inicio,
                t.data_fim,
                t.titulo,
                t.descricao,
                m.nome AS modalidade,
                tr.nome AS treinador
            FROM treino_atletas ta
            INNER JOIN treinos t ON t.id = ta.id_treino
            LEFT JOIN modalidades m ON m.id = t.id_modalidade
            LEFT JOIN treinadores tr ON tr.id = t.id_treinador
            WHERE ta.id_atleta = ?
              AND t.data_inicio >= NOW()
            ORDER BY t.data_inicio ASC
            LIMIT 1
        ");
        $stmt->bind_param('i', $idAtleta);
    } else {
        $stmt = $conexao->prepare("
            SELECT
                t.id,
                t.data_inicio,
                t.data_fim,
                t.titulo,
                t.descricao,
                m.nome AS modalidade,
                tr.nome AS treinador
            FROM treinos t
            LEFT JOIN modalidades m ON m.id = t.id_modalidade
            LEFT JOIN treinadores tr ON tr.id = t.id_treinador
            WHERE t.data_inicio >= NOW()
            ORDER BY t.data_inicio ASC
            LIMIT 1
        ");
    }

    if (!$stmt) {
        throw new Exception('Erro preparar consulta.');
    }

    $stmt->execute();
    $res = $stmt->get_result();
    $treino = $res->fetch_assoc();
    $stmt->close();

    if ($treino) {
        $retorno['status'] = 'ok';
        $retorno['data'] = $treino;
    } else {
        $retorno['mensagem'] = 'Nenhum treino agendado.';
    }
} catch (Exception $e) {
    $retorno['status'] = 'nok';
    $retorno['mensagem'] = $e->getMessage();
}

header('Content-type: application/json; charset=utf-8');
echo json_encode($retorno);

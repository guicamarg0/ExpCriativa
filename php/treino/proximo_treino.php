<?php
include_once('../conexao.php');

$retorno = ['status'=>'nok','mensagem'=>'','data'=>null];

// aceita id_atleta por GET (opcional)
$idAtleta = isset($_GET['id_atleta']) ? (int) $_GET['id_atleta'] : 0;

try {
    if ($idAtleta > 0) {
        // descobrir equipe do atleta
        $stmt = $conexao->prepare("SELECT id_equipe FROM atletas WHERE id = ? LIMIT 1");
        $stmt->bind_param('i', $idAtleta);
        $stmt->execute();
        $res = $stmt->get_result();
        $row = $res->fetch_assoc();
        $stmt->close();
        $idEquipe = (int) ($row['id_equipe'] ?? 0);
    } else {
        $idEquipe = 0;
    }

    if ($idEquipe > 0) {
        $stmt = $conexao->prepare(
            "SELECT id, id_equipe, data_inicio, tipo, treinador, descricao
             FROM treinos
             WHERE id_equipe = ? AND data_inicio >= NOW()
             ORDER BY data_inicio ASC
             LIMIT 1"
        );
        $stmt->bind_param('i', $idEquipe);
    } else {
        $stmt = $conexao->prepare(
            "SELECT id, id_equipe, data_inicio, tipo, treinador, descricao
             FROM treinos
             WHERE data_inicio >= NOW()
             ORDER BY data_inicio ASC
             LIMIT 1"
        );
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
        $retorno['status'] = 'nok';
        $retorno['mensagem'] = 'Nenhum treino agendado.';
    }
} catch (Exception $e) {
    $retorno['status'] = 'nok';
    $retorno['mensagem'] = $e->getMessage();
}

header('Content-type: application/json; charset=utf-8');
echo json_encode($retorno);

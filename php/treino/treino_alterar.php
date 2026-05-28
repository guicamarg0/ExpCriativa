<?php
header("Content-type:application/json;charset:utf-8");
include_once('../conexao.php');

$retorno = [
    'status' => 'nok',
    'mensagem' => 'Nao posso alterar um registro sem um ID informado.',
    'data' => []
];

if (!isset($_GET['id'])) {
    echo json_encode($retorno);
    exit;
}

$id = (int) $_GET['id'];
$titulo = trim($_POST['modalidade'] ?? '');
$idModalidade = (int) ($_POST['modalidade_id'] ?? 0);
$dataInicio = $_POST['data'] ?? '';
$descricao = $_POST['detalhes'] ?? '';
$exerciciosJson = $_POST['exercicios'] ?? '[]';
$metricasExercicioJson = $_POST['metricas_exercicio'] ?? '[]';

if ($id <= 0 || $titulo === '' || $idModalidade <= 0 || $dataInicio === '') {
    $retorno['mensagem'] = 'Dados obrigatorios nao informados.';
    echo json_encode($retorno);
    exit;
}

$exercicios = json_decode($exerciciosJson, true);
$metricasExercicio = json_decode($metricasExercicioJson, true);

if (!is_array($exercicios) || count($exercicios) === 0) {
    $retorno['mensagem'] = 'Selecione pelo menos um exercicio.';
    echo json_encode($retorno);
    exit;
}

if (!is_array($metricasExercicio) || count($metricasExercicio) === 0) {
    $retorno['mensagem'] = 'Selecione uma metrica para cada exercicio.';
    echo json_encode($retorno);
    exit;
}

$dataInicio .= strlen($dataInicio) === 10 ? ' 00:00:00' : '';
$exerciciosIds = array_map('intval', $exercicios);

$conexao->begin_transaction();

try {
    $stmt = $conexao->prepare("
        UPDATE treinos
        SET id_modalidade = ?, titulo = ?, data_inicio = ?, descricao = ?
        WHERE id = ?
    ");

    if (!$stmt) {
        throw new Exception('Erro ao preparar alteracao: ' . $conexao->error);
    }

    $stmt->bind_param("isssi", $idModalidade, $titulo, $dataInicio, $descricao, $id);
    $stmt->execute();
    $stmt->close();

    $deleteMetricas = $conexao->prepare("DELETE FROM treino_exercicio_metricas WHERE id_treino = ?");
    if (!$deleteMetricas) {
        throw new Exception('Erro ao preparar exclusao das metricas: ' . $conexao->error);
    }
    $deleteMetricas->bind_param("i", $id);
    $deleteMetricas->execute();
    $deleteMetricas->close();

    $deleteExercicios = $conexao->prepare("DELETE FROM treino_exercicios WHERE id_treino = ?");
    if (!$deleteExercicios) {
        throw new Exception('Erro ao preparar exclusao dos exercicios: ' . $conexao->error);
    }
    $deleteExercicios->bind_param("i", $id);
    $deleteExercicios->execute();
    $deleteExercicios->close();

    foreach ($exerciciosIds as $idExercicio) {
        if ($idExercicio <= 0) {
            continue;
        }

        $stmtExercicio = $conexao->prepare("
            INSERT IGNORE INTO treino_exercicios (id_treino, id_exercicio)
            VALUES (?, ?)
        ");
        if (!$stmtExercicio) {
            throw new Exception('Erro ao preparar vinculo do exercicio: ' . $conexao->error);
        }
        $stmtExercicio->bind_param("ii", $id, $idExercicio);
        $stmtExercicio->execute();
        $stmtExercicio->close();
    }

    foreach ($metricasExercicio as $par) {
        $partes = explode(':', (string) $par);
        if (count($partes) !== 2) {
            continue;
        }

        $idExercicio = (int) $partes[0];
        $idMetrica = (int) $partes[1];

        if ($idExercicio <= 0 || $idMetrica <= 0 || !in_array($idExercicio, $exerciciosIds)) {
            continue;
        }

        $stmtMetrica = $conexao->prepare("
            INSERT IGNORE INTO treino_exercicio_metricas (id_treino, id_exercicio, id_metrica)
            VALUES (?, ?, ?)
        ");
        if (!$stmtMetrica) {
            throw new Exception('Erro ao preparar vinculo da metrica: ' . $conexao->error);
        }
        $stmtMetrica->bind_param("iii", $id, $idExercicio, $idMetrica);
        $stmtMetrica->execute();
        $stmtMetrica->close();
    }

    $conexao->commit();

    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Registro alterado com sucesso.',
        'data' => []
    ];
} catch (Exception $e) {
    $conexao->rollback();
    $retorno['mensagem'] = $e->getMessage();
}

$conexao->close();

echo json_encode($retorno);

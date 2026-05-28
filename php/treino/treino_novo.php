<?php
header("Content-type:application/json;charset:utf-8");
include_once('../conexao.php');

$retorno = [
    'status' => 'nok',
    'mensagem' => 'Falha ao inserir o registro.',
    'data' => []
];

$titulo = trim($_POST['modalidade'] ?? '');
$idModalidade = (int) ($_POST['modalidade_id'] ?? 0);
$dataInicio = $_POST['data'] ?? '';
$descricao = $_POST['detalhes'] ?? '';
$idAtleta = (int) ($_POST['id_atleta'] ?? 0);
$idTreinador = (int) ($_POST['id_treinador'] ?? 0);
$exerciciosJson = $_POST['exercicios'] ?? '[]';
$metricasExercicioJson = $_POST['metricas_exercicio'] ?? '[]';

if ($titulo === '' || $idModalidade <= 0 || $dataInicio === '' || $idAtleta <= 0 || $idTreinador <= 0) {
    $retorno['mensagem'] = 'Dados obrigatorios nao informados.';
    echo json_encode($retorno);
    exit;
}

$dataInicio .= strlen($dataInicio) === 10 ? ' 00:00:00' : '';

$stmt = $conexao->prepare("
    INSERT INTO treinos (id_treinador, id_modalidade, titulo, data_inicio, descricao, status)
    VALUES (?, ?, ?, ?, ?, 'ativo')
");

if (!$stmt) {
    $retorno['mensagem'] = 'Erro ao preparar cadastro do treino: ' . $conexao->error;
    echo json_encode($retorno);
    exit;
}

$stmt->bind_param("iisss", $idTreinador, $idModalidade, $titulo, $dataInicio, $descricao);
$stmt->execute();
$idTreino = (int) $stmt->insert_id;
$stmt->close();

if ($idTreino <= 0) {
    $retorno['mensagem'] = 'Treino nao foi inserido.';
    $conexao->close();
    echo json_encode($retorno);
    exit;
}

$stmtVinculo = $conexao->prepare("
    INSERT INTO treino_atletas (id_treino, id_atleta)
    VALUES (?, ?)
");

if (!$stmtVinculo) {
    $retorno['mensagem'] = 'Treino criado, mas falhou ao vincular atleta: ' . $conexao->error;
    $conexao->close();
    echo json_encode($retorno);
    exit;
}

$stmtVinculo->bind_param("ii", $idTreino, $idAtleta);
$stmtVinculo->execute();
$stmtVinculo->close();

$exercicios = json_decode($exerciciosJson, true);
if (is_array($exercicios)) {
    foreach ($exercicios as $idExercicio) {
        $idExercicio = (int) $idExercicio;
        if ($idExercicio <= 0) {
            continue;
        }

        $stmtExercicio = $conexao->prepare("
            INSERT IGNORE INTO treino_exercicios (id_treino, id_exercicio)
            VALUES (?, ?)
        ");
        $stmtExercicio->bind_param("ii", $idTreino, $idExercicio);
        $stmtExercicio->execute();
        $stmtExercicio->close();
    }
}

$metricasExercicio = json_decode($metricasExercicioJson, true);
if (is_array($metricasExercicio)) {
    foreach ($metricasExercicio as $par) {
        $partes = explode(':', (string) $par);
        if (count($partes) !== 2) {
            continue;
        }

        $idExercicio = (int) $partes[0];
        $idMetrica = (int) $partes[1];

        if ($idExercicio <= 0 || $idMetrica <= 0 || !in_array($idExercicio, array_map('intval', $exercicios))) {
            continue;
        }

        $stmtMetrica = $conexao->prepare("
            INSERT IGNORE INTO treino_exercicio_metricas (id_treino, id_exercicio, id_metrica)
            VALUES (?, ?, ?)
        ");
        $stmtMetrica->bind_param("iii", $idTreino, $idExercicio, $idMetrica);
        $stmtMetrica->execute();
        $stmtMetrica->close();
    }
}
$conexao->close();

$retorno = [
    'status' => 'ok',
    'mensagem' => 'Registro inserido com sucesso.',
    'data' => [
        'id' => $idTreino
    ]
];

echo json_encode($retorno);

<?php
header("Content-type:application/json;charset:utf-8");
include_once('../conexao.php');

$retorno = [
    'status' => 'nok',
    'mensagem' => 'Falha ao cadastrar desempenho.',
    'data' => []
];

$idTreinoAtleta = (int) ($_POST['id_treino_atleta'] ?? 0);
$idExercicio = (int) ($_POST['id_exercicio'] ?? 0);
$idMetrica = (int) ($_POST['id_metrica'] ?? 0);
$valor = $_POST['valor'] ?? '';
$observacao = $_POST['observacao'] ?? '';

if ($idTreinoAtleta <= 0 || $idExercicio <= 0 || $idMetrica <= 0 || $valor === '') {
    $retorno['mensagem'] = 'Dados obrigatórios não informados.';
    echo json_encode($retorno);
    exit;
}

$stmt = $conexao->prepare("
    INSERT INTO desempenho_atleta (id_treino_atleta, id_exercicio, id_metrica, valor, observacao)
    VALUES (?, ?, ?, ?, ?)
");

if (!$stmt) {
    $retorno['mensagem'] = 'Erro ao preparar cadastro: ' . $conexao->error;
    echo json_encode($retorno);
    exit;
}

$stmt->bind_param("iiiss", $idTreinoAtleta, $idExercicio, $idMetrica, $valor, $observacao);

if ($stmt->execute()) {
    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Desempenho cadastrado com sucesso.',
        'data' => [
            'id' => $stmt->insert_id
        ]
    ];
} else {
    $retorno['mensagem'] = 'Erro ao cadastrar desempenho: ' . $stmt->error;
}

$stmt->close();
$conexao->close();

echo json_encode($retorno);

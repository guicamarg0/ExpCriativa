<?php
header("Content-type:application/json;charset:utf-8");
include_once('../conexao.php');

$retorno = [
    'status' => 'nok',
    'mensagem' => 'Falha ao inserir o registro.',
    'data' => []
];

$titulo = trim($_POST['modalidade'] ?? '');
$dataInicio = $_POST['data'] ?? '';
$descricao = $_POST['detalhes'] ?? '';
$idAtleta = (int) ($_POST['id_atleta'] ?? 0);
$idTreinador = (int) ($_POST['id_treinador'] ?? 0);

if ($titulo === '' || $dataInicio === '' || $idAtleta <= 0 || $idTreinador <= 0) {
    $retorno['mensagem'] = 'Dados obrigatórios não informados.';
    echo json_encode($retorno);
    exit;
}

$dataInicio .= strlen($dataInicio) === 10 ? ' 00:00:00' : '';

$stmt = $conexao->prepare("
    INSERT INTO treinos (id_treinador, titulo, data_inicio, descricao, status)
    VALUES (?, ?, ?, ?, 'ativo')
");

if (!$stmt) {
    $retorno['mensagem'] = 'Erro ao preparar cadastro do treino: ' . $conexao->error;
    echo json_encode($retorno);
    exit;
}

$stmt->bind_param("isss", $idTreinador, $titulo, $dataInicio, $descricao);
$stmt->execute();
$idTreino = (int) $stmt->insert_id;
$stmt->close();

if ($idTreino <= 0) {
    $retorno['mensagem'] = 'Treino não foi inserido.';
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
$conexao->close();

$retorno = [
    'status' => 'ok',
    'mensagem' => 'Registro inserido com sucesso.',
    'data' => [
        'id' => $idTreino
    ]
];

echo json_encode($retorno);

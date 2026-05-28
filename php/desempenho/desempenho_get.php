<?php
header("Content-type:application/json;charset:utf-8");
include_once('../conexao.php');

$retorno = [
    'status' => 'nok',
    'mensagem' => 'Não há registros no bd.',
    'data' => []
];

if (isset($_GET['id'])) {
    $id = (int) $_GET['id'];
    $stmt = $conexao->prepare("
        SELECT desempenho_atleta.*, metricas.nome AS nome_metrica, metricas.unidade_medida, exercicios.nome AS nome_exercicio
        FROM desempenho_atleta
        INNER JOIN metricas ON metricas.id = desempenho_atleta.id_metrica
        INNER JOIN exercicios ON exercicios.id = desempenho_atleta.id_exercicio
        WHERE desempenho_atleta.id = ?
    ");
    $stmt->bind_param("i", $id);
} elseif (isset($_GET['id_treino_atleta'])) {
    $idTreinoAtleta = (int) $_GET['id_treino_atleta'];
    $stmt = $conexao->prepare("
        SELECT desempenho_atleta.*, metricas.nome AS nome_metrica, metricas.unidade_medida, exercicios.nome AS nome_exercicio
        FROM desempenho_atleta
        INNER JOIN metricas ON metricas.id = desempenho_atleta.id_metrica
        INNER JOIN exercicios ON exercicios.id = desempenho_atleta.id_exercicio
        WHERE desempenho_atleta.id_treino_atleta = ?
        ORDER BY desempenho_atleta.data_registro DESC
    ");
    $stmt->bind_param("i", $idTreinoAtleta);
} else {
    $stmt = $conexao->prepare("
        SELECT desempenho_atleta.*, metricas.nome AS nome_metrica, metricas.unidade_medida, exercicios.nome AS nome_exercicio
        FROM desempenho_atleta
        INNER JOIN metricas ON metricas.id = desempenho_atleta.id_metrica
        INNER JOIN exercicios ON exercicios.id = desempenho_atleta.id_exercicio
        ORDER BY desempenho_atleta.data_registro DESC
    ");
}

if (!$stmt) {
    $retorno['mensagem'] = 'Erro ao preparar consulta: ' . $conexao->error;
    echo json_encode($retorno);
    exit;
}

$stmt->execute();
$resultado = $stmt->get_result();
$tabela = [];

while ($linha = $resultado->fetch_assoc()) {
    $tabela[] = $linha;
}

if (count($tabela) > 0) {
    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Sucesso, consulta efetuada.',
        'data' => $tabela
    ];
}

$stmt->close();
$conexao->close();

echo json_encode($retorno);

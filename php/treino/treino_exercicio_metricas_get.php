<?php
header("Content-type:application/json;charset:utf-8");
include_once('../conexao.php');

$retorno = [
    'status' => 'nok',
    'mensagem' => 'Nao ha metricas vinculadas aos exercicios do treino.',
    'data' => []
];

if (!isset($_GET['id_treino'])) {
    $retorno['mensagem'] = 'Informe o treino.';
    echo json_encode($retorno);
    exit;
}

$idTreino = (int) $_GET['id_treino'];

$stmt = $conexao->prepare("
    SELECT
        exercicios.id AS id_exercicio,
        exercicios.nome AS nome_exercicio,
        metricas.id AS id_metrica,
        metricas.nome AS nome_metrica,
        metricas.descricao,
        metricas.unidade_medida,
        metricas.tipo
    FROM treino_exercicio_metricas
    INNER JOIN exercicios ON exercicios.id = treino_exercicio_metricas.id_exercicio
    INNER JOIN metricas ON metricas.id = treino_exercicio_metricas.id_metrica
    WHERE treino_exercicio_metricas.id_treino = ?
      AND (metricas.status = 'ativo' OR metricas.status IS NULL)
    ORDER BY exercicios.nome,
      CASE WHEN metricas.nome = 'Percepcao de esforco' THEN 0 ELSE 1 END,
      metricas.nome
");

if (!$stmt) {
    $retorno['mensagem'] = 'Erro ao preparar consulta: ' . $conexao->error;
    echo json_encode($retorno);
    exit;
}

$stmt->bind_param("i", $idTreino);
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

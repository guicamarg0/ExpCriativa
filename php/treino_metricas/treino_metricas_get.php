<?php
header("Content-type:application/json;charset:utf-8");
include_once('../conexao.php');
include_once('../permissao.php');
exigir_usuario_logado();

$retorno = [
    'status' => 'nok',
    'mensagem' => 'Não há métricas vinculadas.',
    'data' => []
];

if (!isset($_GET['id_treino'])) {
    $retorno['mensagem'] = 'Informe o treino.';
    echo json_encode($retorno);
    exit;
}

$idTreino = (int) $_GET['id_treino'];

if (!treino_permitido($conexao, $idTreino)) {
    responder_sem_permissao();
}

$stmt = $conexao->prepare("
    SELECT metricas.*
    FROM treino_metricas
    INNER JOIN metricas ON metricas.id = treino_metricas.id_metrica
    WHERE treino_metricas.id_treino = ?
    ORDER BY CASE WHEN metricas.nome = 'Percepcao de esforco' THEN 0 ELSE 1 END, metricas.nome
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

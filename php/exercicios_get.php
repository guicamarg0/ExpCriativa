<?php
header("Content-type:application/json;charset:utf-8");
include_once('conexao.php');

$retorno = [
    'status' => 'nok',
    'mensagem' => 'Nenhum exercicio encontrado.',
    'data' => []
];

$stmt = $conexao->prepare("
    SELECT id, nome
    FROM exercicios
    WHERE status = 'ativo' OR status IS NULL
    ORDER BY nome
");

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

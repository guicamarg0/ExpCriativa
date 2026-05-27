<?php
header("Content-type:application/json;charset:utf-8");
include_once('../conexao.php');

$retorno = [
    'status' => 'nok',
    'mensagem' => 'Não há registros no bd.',
    'data' => []
];

$nomeFixo = 'Percepcao de esforco';
$stmtFixo = $conexao->prepare("SELECT id FROM metricas WHERE nome = ? LIMIT 1");
$stmtFixo->bind_param("s", $nomeFixo);
$stmtFixo->execute();
$resultadoFixo = $stmtFixo->get_result();

if ($resultadoFixo->num_rows === 0) {
    $descricaoFixa = 'Escala de esforco percebido pelo atleta';
    $unidadeFixa = '0-10';
    $tipoFixo = 'escala_0_10';
    $statusFixo = 'ativo';
    $stmtNovoFixo = $conexao->prepare("INSERT INTO metricas (nome, descricao, unidade_medida, tipo, status) VALUES (?, ?, ?, ?, ?)");
    $stmtNovoFixo->bind_param("sssss", $nomeFixo, $descricaoFixa, $unidadeFixa, $tipoFixo, $statusFixo);
    $stmtNovoFixo->execute();
    $stmtNovoFixo->close();
}
$stmtFixo->close();

if (isset($_GET['id'])) {
    $id = (int) $_GET['id'];
    $stmt = $conexao->prepare("SELECT * FROM metricas WHERE id = ?");
    $stmt->bind_param("i", $id);
} else {
    $stmt = $conexao->prepare("
        SELECT *
        FROM metricas
        WHERE status = 'ativo'
        ORDER BY CASE WHEN nome = 'Percepcao de esforco' THEN 0 ELSE 1 END, nome
    ");
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

<?php
header("Content-type:application/json;charset:utf-8");
include_once('../conexao.php');

$retorno = [
    'status' => 'nok',
    'mensagem' => 'É necessário informar um ID para exclusão.',
    'data' => []
];

if (isset($_GET['id'])) {
    $id = (int) $_GET['id'];
    $stmt = $conexao->prepare("DELETE FROM desempenho_atleta WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $stmt->close();

    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Desempenho excluído com sucesso.',
        'data' => []
    ];
}

$conexao->close();

echo json_encode($retorno);

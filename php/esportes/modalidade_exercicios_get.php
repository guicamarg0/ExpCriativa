<?php
header("Content-type:application/json;charset:utf-8");
include_once('../conexao.php');
$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];

if(!isset($_GET['id']) || !is_numeric($_GET['id'])){
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'id da modalidade ausente ou inválido',
        'data' => []
    ];
    echo json_encode($retorno);
    exit;
}

$modalidade_id = intval($_GET['id']);

$stmt = $conexao->prepare("SELECT e.id, e.nome FROM exercicios e
    INNER JOIN modalidade_exercicio me ON me.id_exercicio = e.id
    WHERE me.id_modalidade = ? ORDER BY e.nome");
$stmt->bind_param("i", $modalidade_id);
$stmt->execute();
$resultado = $stmt->get_result();
$tabela = [];

while($linha = $resultado->fetch_assoc()){
    $tabela[] = $linha;
}

if(count($tabela) > 0){
    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Exercícios encontrados.',
        'data' => $tabela
    ];
}else{
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Nenhum exercício vinculado a esta modalidade.',
        'data' => []
    ];
}

$stmt->close();
$conexao->close();
echo json_encode($retorno);

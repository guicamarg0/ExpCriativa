<?php
include_once('conexao.php');

$stmt = $conexao->prepare("SELECT id, nome FROM genero ORDER BY nome ASC");
$stmt->execute();
$resultado = $stmt->get_result();

$tabela = [];
while ($linha = $resultado->fetch_assoc()) {
    $tabela[] = $linha;
}

$retorno = [
    'status' => 'ok',
    'mensagem' => 'Sucesso, consulta efetuada.',
    'data' => $tabela
];

$stmt->close();
$conexao->close();

header("Content-type:application/json;charset:utf-8");
echo json_encode($retorno);

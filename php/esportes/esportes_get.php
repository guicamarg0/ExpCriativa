<?php
include_once('../conexao.php');
// Configurando o padrão de retorno
$retorno = [
    'status' => '', // ok - nok
    'mensagem' => '', // mensagem que envio para o front
    'data' => []
];

if (isset($_GET['id'])) { // se veio um id pela url
    // Segunda situação - RECEBENDO O ID por GET
    $stmt = $conexao->prepare("SELECT * FROM modalidades WHERE id = ?");
    $stmt->bind_param("i", $_GET['id']);
}
else {
    // Primeira situação - SEM RECEBER O ID por GET
    $stmt = $conexao->prepare("SELECT * FROM modalidades");
}

// Executando a query
$stmt->execute();
$resultado = $stmt->get_result();
// Criando um array vazio para receber o resultado do bd
$tabela = [];

if ($resultado->num_rows > 0) {
    while ($linha = $resultado->fetch_assoc()) {
        $tabela[] = $linha;
    }

    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Sucesso, consulta efetuada no bd.', // mensagem que envio para o front
        'data' => $tabela
    ];
}
else {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Não há registros no bd', // mensagem que envio para o front
        'data' => []
    ];
}
// Fechamento do estado e conexão.
$stmt->close();
$conexao->close();

// Estou enviando para o fronted o array RETORNO
// mas no formato JSON
header("Content-type:application/json;charset:utf-8");
echo json_encode($retorno);
<?php
// Inclui a conexão com o banco de dados
include_once('conexao.php');
// Estrutura padrão de retorno da API
$retorno = [
    'status'    => '',
    'mensagem'  => '',
    'data'      => []
];

// Verifica se existe erro de conexão (depende do seu conexao.php definir isso)
if(!empty($conexao_error)){
    // Retorno em caso de erro de conexão
    $retorno = [
        'status'    => 'nok',
        'mensagem'  => 'Erro de conexao com o banco.',
        'data'      => []
    ];
    // Retorna JSON imediatamente e encerra execução
    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
    exit;
}

// Recebe filtro de status via GET
// Se não vier nada, assume "ativo"
$statusFiltro = isset($_GET['status']) ? strtolower($_GET['status']) : 'ativo';

// Define se vai filtrar ou não no SQL
$filtrarStatus = true;

// Status padrão usado na query
$statusBanco = 'ativo';

// Se o usuário pediu "todos", desativa filtro
if($statusFiltro === 'todos'){
    $filtrarStatus = false;
// Se pediu "inativo", ajusta filtro
}elseif($statusFiltro === '
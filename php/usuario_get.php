<?php
// Inclui a conexão com o banco de dados
include_once('conexao.php');
// Estrutura padrão de retorno da API
$retorno = [
    'status'    => '',
    'mensagem'  => '',
    'data'      => []
];

// Verifica se foi passado um ID via GET
if (isset($_GET['id']) && $_GET['id'] !== '') {
    // Converte o ID para inteiro (evita SQL injection básico)
    $id = (int) $_GET['id'];
    // Prepara consulta filtrando por ID
    $stmt = $conexao->prepare("SELECT * FROM usuario WHERE id = ?");
    // Se der erro no prepare, encerra execução
    if (!$stmt) {
        die("Erro no prepare da consulta por ID");
    }
    // Associa o parâmetro ID à query
    $stmt->bind_param("i", $id);
} else {
    // Caso não tenha ID, busca todos os usuários
    $stmt = $conexao->prepare("SELECT * FROM usuario");
    // Verifica erro no prepare
    if (!$stmt) {
        die("Erro no prepare da consulta geral");
    }
}

// Executa a query preparada
$stmt->execute();
// Pega o resultado da consulta
$resultado = $stmt->get_result();
// Array que vai armazenar os registros do banco
$tabela = [];

// Verifica se encontrou registros
if ($resultado->num_rows > 0) {
    // Percorre todas as linhas retornadas
    while ($linha = $resultado->fetch_assoc()) {

        // Adiciona cada linha no array
        $tabela[] = $linha;
    }
    // Define retorno de sucesso
    $retorno = [
        'status'    => 'ok',
        'mensagem'  => 'Sucesso, consulta efetuada.',
        'data'      => $tabela
    ];

} else {
    // Caso não encontre registros
    $retorno = [
        'status'    => 'nok',
        'mensagem'  => 'Não há registros',
        'data'      => []
    ];
}

// Fecha o statement (consulta)
$stmt->close();
// Fecha conexão com banco
$conexao->close();
// Define header como JSON
header("Content-type:application/json;charset:utf-8");
// Retorna resposta em formato JSON para o frontend
echo json_encode($retorno);
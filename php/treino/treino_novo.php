<?php
// Define retorno como JSON
header("Content-Type: application/json; charset=utf-8");
// Inclui conexão com o banco de dados
include_once('../conexao.php');
// Estrutura padrão de resposta da API
$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];

// Recebe dados enviados via POST (com proteção contra campos vazios)
$modalidade    = $_POST['modalidade'] ?? '';   // tipo de modalidade do treino
$data          = $_POST['data'] ?? '';         // data do treino
$detalhes      = $_POST['detalhes'] ?? '';     // descrição do treino
$id_atleta     = (int) ($_POST['id_atleta'] ?? 0);       // ID do atleta
$id_treinador  = (int) ($_POST['id_treinador'] ?? 0);    // ID do treinador

// Validação básica dos campos obrigatórios
if ($modalidade === '' || $data === '' || $id_atleta === 0 || $id_treinador === 0) {
    echo json_encode([
        'status' => 'nok',
        'mensagem' => 'Campos obrigatórios não preenchidos',
        'data' => []
    ]);
    exit;
}

// Prepara o INSERT no banco de dados
// Observação: "data" precisa de crase por ser palavra reservada no MySQL
$stmt = $conexao->prepare("
    INSERT INTO treinos
    (modalidade, `data`, detalhes, id_atleta, id_treinador)
    VALUES (?,?,?,?,?)
");

// Associa os parâmetros ao SQL (evita SQL Injection)
$stmt->bind_param(
    "sssii",          // tipos: string, string, string, int, int
    $modalidade,
    $data,
    $detalhes,
    $id_atleta,
    $id_treinador
);

// Executa a query de inserção
$stmt->execute();

// Verifica se algum registro foi inserido
if ($stmt->affected_rows > 0) {
    // Retorno de sucesso
    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Registro inserido com sucesso',
        'data' => []
    ];
} else {
    // Retorno de falha
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Falha ao inserir o registro',
        'data' => []
    ];
}

// Fecha o statement (query)
$stmt->close();
// Fecha conexão com o banco
$conexao->close();
// Retorna resposta em JSON para o frontend
echo json_encode($retorno);
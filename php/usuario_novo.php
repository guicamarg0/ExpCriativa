<?php
// Inclui conexão com o banco de dados
include_once('../conexao.php');
// Estrutura padrão de retorno da API
$retorno = [
    'status'    => '',
    'mensagem'  => '',
    'data'      => []
];

// Recebe os dados enviados pelo formulário (POST)
// O ?? '' evita erro caso o campo não exista
$nome       = $_POST['nome'] ?? '';
$email      = $_POST['email'] ?? '';
$usuario    = $_POST['usuario'] ?? '';
$senha      = $_POST['senha'] ?? '';
$instagram  = $_POST['instagram'] ?? '';
$ativo      = $_POST['status'] ?? 1;

// Validação básica dos campos obrigatórios
if ($nome === '' || $email === '' || $senha === '') {
    echo json_encode([
        'status' => 'nok',
        'mensagem' => 'Campos obrigatórios não preenchidos',
        'data' => []
    ]);
    exit;
}

// Prepara o INSERT no banco de dados
$stmt = $conexao->prepare("
    INSERT INTO usuarios
    (nome, email, usuario, senha, instagram, ativo)
    VALUES (?,?,?,?,?,?)
");

// Verifica se o prepare deu certo
if (!$stmt) {
    echo json_encode([
        'status' => 'nok',
        'mensagem' => 'Erro ao preparar SQL',
        'data' => []
    ]);

    exit;
}

// Vincula as variáveis ao SQL
// s = string, i = integer
$stmt->bind_param(
    "sssssi",
    $nome,
    $email,
    $usuario,
    $senha,
    $instagram,
    $ativo
);

// Executa a query
$stmt->execute();

// Verifica se realmente inseriu algo no banco
if ($stmt->affected_rows > 0) {
    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Registro inserido com sucesso',
        'data' => []
    ];
} else {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Falha ao inserir o registro',
        'data' => []
    ];
}

// Fecha statement e conexão
$stmt->close();
$conexao->close();

// Retorna resposta em JSON
header("Content-Type: application/json; charset=utf-8");
echo json_encode($retorno);
?>
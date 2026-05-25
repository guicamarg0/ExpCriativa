<?php
// Inclui a conexão com o banco de dados
include_once('../conexao.php');
// Estrutura padrão de retorno da API
$retorno = [
    'status'    => '',
    'mensagem'  => '',
    'data'      => []
];

// Verifica se foi passado um ID via GET
if (isset($_GET['id'])) {
    // Recebe e prepara os dados enviados pelo formulário (POST)
    $nome    = $_POST['nome'] ?? '';
    $email   = $_POST['email'] ?? '';
    $usuario = $_POST['usuario'] ?? '';
    $senha   = $_POST['senha'] ?? '';
    $ativo   = $_POST['status'] ?? 1;
    // Converte ID para inteiro (boa prática de segurança)
    $id = (int) $_GET['id'];
    // Prepara o comando UPDATE no banco de dados
    $stmt = $conexao->prepare("
        UPDATE usuario
        SET nome = ?, email = ?, usuario = ?, senha = ?, ativo = ?
        WHERE id = ?
    ");
    // Verifica se o prepare funcionou corretamente
    if (!$stmt) {
        echo json_encode([
            'status' => 'nok',
            'mensagem' => 'Erro ao preparar SQL',
            'data' => []
        ]);
        exit;
    }
    // Liga os parâmetros ao SQL (evita SQL Injection)
    $stmt->bind_param(
        "ssssii",
        $nome,
        $email,
        $usuario,
        $senha,
        $ativo,
        $id
    );
    // Executa o UPDATE no banco
    $stmt->execute();
    // Verifica se alguma linha foi afetada
    // (>= 0 evita falso erro quando dados são iguais)
    if ($stmt->affected_rows >= 0) {
        $retorno = [
            'status'    => 'ok',
            'mensagem'  => 'Registro alterado com sucesso.',
            'data'      => []
        ];
    } else {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Não consegui alterar o registro.',
            'data'      => []
        ];
    }
    // Fecha o statement
    $stmt->close();
} else {
    // Caso não tenha ID informado
    $retorno = [
        'status'    => 'nok',
        'mensagem'  => 'Não posso alterar um registro sem um ID informado.',
        'data'      => []
    ];
}
// Fecha conexão com o banco
$conexao->close();
// Define retorno como JSON
header("Content-Type: application/json; charset=utf-8");
// Envia resposta para o frontend
echo json_encode($retorno);
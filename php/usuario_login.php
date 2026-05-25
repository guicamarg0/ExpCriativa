<?php
// Define retorno como JSON logo no início
header("Content-Type: application/json; charset=utf-8");
// Inclui conexão com banco
include_once(__DIR__ . '/conexao.php');
// Inicia sessão
session_start();
// Função padrão de retorno
function resposta_json($status, $mensagem, $data = [], $extra = []) {

    echo json_encode([
        'status' => $status,
        'mensagem' => $mensagem,
        'data' => $data,
        'extra' => $extra
    ]);

    exit;
}

// Verifica conexão com banco
if (!$conexao) {
    resposta_json('nok', 'Erro de conexão com o banco.');
}

// Recebe dados do formulário
$email = $_POST['email'] ?? '';
$senha = $_POST['senha'] ?? '';

// Validação básica
if ($email === '' || $senha === '') {
    resposta_json('nok', 'Informe e-mail e senha.');
}

// Prepara consulta
$stmt = $conexao->prepare("
    SELECT
        id,
        email,
        id_nivel,
        status
    FROM usuarios
    WHERE email = ? AND senha = ?
    LIMIT 1
");


// Verifica prepare
if (!$stmt) {
    resposta_json('nok', 'Falha ao preparar autenticação.');
}

// Executa consulta
$stmt->bind_param("ss", $email, $senha);
$stmt->execute();

$resultado = $stmt->get_result();

// Usuário não encontrado
if ($resultado->num_rows === 0) {
    $stmt->close();
    $conexao->close();
    resposta_json('nok', 'Credenciais inválidas.');
}

// Dados do usuário
$usuario = $resultado->fetch_assoc();


// Verifica status
$statusUsuario = strtolower($usuario['status'] ?? '');

if ($statusUsuario !== 'ativo' && $statusUsuario !== 'ativa') {
    $stmt->close();
    $conexao->close();

    resposta_json('nok', 'Usuário inativo.');
}

// Sessão
session_regenerate_id(true);
$sessionKey = hash('sha256', uniqid((string) mt_rand(), true));
$_SESSION['usuario_id'] = (int) $usuario['id'];
$_SESSION['id_nivel'] = (int) $usuario['id_nivel'];
$_SESSION['session_key'] = $sessionKey;


// Fecha recursos
$stmt->close();
$conexao->close();

// Retorno sucesso
resposta_json(
    'ok',
    'Login efetuado com sucesso.',
    [
        'id' => (int) $usuario['id'],
        'email' => $usuario['email'],
        'id_nivel' => (int) $usuario['id_nivel']
    ],
    [
        'session_key' => $sessionKey
    ]
);
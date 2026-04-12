<?php
include_once(__DIR__ . '/conexao.php');
session_start();

$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];

if (!empty($conexao_error)) {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Erro de conexão com o banco.',
        'data' => []
    ];

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
    exit;
}

$email = trim($_POST['email'] ?? '');
$senha = trim($_POST['senha'] ?? '');

if ($email === '' || $senha === '') {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Informe e-mail e senha.',
        'data' => []
    ];

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
    exit;
}

$stmt = $conexao->prepare(
    "SELECT id, email, id_nivel, status
     FROM usuarios
     WHERE email = ? AND senha = ?
     LIMIT 1"
);

if (!$stmt) {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Falha ao preparar autenticação.',
        'data' => []
    ];

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
    exit;
}

$stmt->bind_param("ss", $email, $senha);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows === 0) {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Credenciais inválidas.',
        'data' => []
    ];
    $stmt->close();
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
    exit;
}

$usuario = $resultado->fetch_assoc();
$statusUsuario = strtolower(trim($usuario['status'] ?? ''));

if ($statusUsuario !== 'ativo' && $statusUsuario !== 'ativa') {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Usuário inativo.',
        'data' => []
    ];
    $stmt->close();
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
    exit;
}

session_regenerate_id(true);

$sessionKey = hash('sha256', uniqid((string) mt_rand(), true));
$_SESSION['usuario_id'] = (int) $usuario['id'];
$_SESSION['id_nivel'] = (int) $usuario['id_nivel'];
$_SESSION['session_key'] = $sessionKey;

unset($_SESSION['email']);

$retorno = [
    'status' => 'ok',
    'mensagem' => 'Login efetuado com sucesso.',
    'usuario' => [
        'id' => (int) $usuario['id'],
        'email' => $usuario['email'],
        'id_nivel' => (int) $usuario['id_nivel']
    ],
    'session_key' => $sessionKey,
    'data' => [
        [
            'id' => (int) $usuario['id'],
            'email' => $usuario['email'],
            'id_nivel' => (int) $usuario['id_nivel']
        ]
    ]
];

$stmt->close();
$conexao->close();

header("Content-type:application/json;charset:utf-8");
echo json_encode($retorno);

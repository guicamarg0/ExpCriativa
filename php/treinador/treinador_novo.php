<?php
// Retorno em JSON para o frontend
header("Content-Type: application/json; charset=utf-8");
// Conexão com o banco de dados
include_once('../conexao.php');
// Estrutura padrão de resposta da API
$retorno = [
    'status'    => '',
    'mensagem'  => '',
    'data'      => []
];

// Verifica erro de conexão
if (!empty($conexao_error)) {
    $retorno = [
        'status'    => 'nok',
        'mensagem'  => 'Erro de conexao com o banco.',
        'data'      => []
    ];
    echo json_encode($retorno);
    exit;
}

// Recebe dados do formulário (POST)
$nome            = $_POST['nome'] ?? '';
$data_nascimento = $_POST['data_nascimento'] ?? '';
$telefone        = $_POST['telefone'] ?? '';
$cref            = $_POST['cref'] ?? '';
$data_inicio     = $_POST['data_inicio'] ?? '';
$email           = $_POST['email'] ?? '';
$senha           = $_POST['senha'] ?? '';
$status          = 'ativo';

// Validação mínima obrigatória
if ($nome === '' || $cref === '' || $email === '' || $senha === '') {
    $retorno = [
        'status'    => 'nok',
        'mensagem'  => 'Nome, CREF, e-mail e senha são obrigatórios.',
        'data'      => []
    ];
    echo json_encode($retorno);
    exit;
}

//primeira inserção do usuário
$stmtUsuario = $conexao->prepare(
    "INSERT INTO usuarios (email, senha, id_nivel, status)
     VALUES (?, ?, 2, ?)"
);
if (!$stmtUsuario) {
    echo json_encode([
        'status' => 'nok',
        'mensagem' => 'Erro ao preparar cadastro de usuário.',
        'data' => []
    ]);
    exit;
}

//prepara inserção do treinador
$stmtTreinador = $conexao->prepare(
    "INSERT INTO treinadores (
        id_usuario,
        nome,
        cref,
        telefone,
        data_nascimento,
        data_inicio,
        status
    ) VALUES (
        ?, ?, ?, ?, NULLIF(?, ''), NULLIF(?, ''), ?
    )"
);

if (!$stmtTreinador) {
    $stmtUsuario->close();
    echo json_encode([
        'status' => 'nok',
        'mensagem' => 'Erro ao preparar cadastro de treinador.',
        'data' => []
    ]);
    exit;
}

// Inicia transação (garante consistência entre tabelas)
$conexao->begin_transaction();
$erro = '';
$idUsuario = 0;

// Insere usuário
$stmtUsuario->bind_param("sss", $email, $senha, $status);
if (!$stmtUsuario->execute()) {
    $erro = ($conexao->errno === 1062)
        ? 'E-mail já cadastrado.'
        : 'Falha ao cadastrar usuário.';
} else {
    // Pega ID do usuário criado
    $idUsuario = $conexao->insert_id;

//insere treinador
    $stmtTreinador->bind_param(
        "issssss",
        $idUsuario,
        $nome,
        $cref,
        $telefone,
        $data_nascimento,
        $data_inicio,
        $status
    );
    if (!$stmtTreinador->execute()) {
        $erro = ($conexao->errno === 1062)
            ? 'CREF já cadastrado.'
            : 'Falha ao cadastrar treinador.';
    }
}

//finaliza transação
if ($erro !== '') {
    // Cancela tudo se deu erro
    $conexao->rollback();
    $retorno = [
        'status' => 'nok',
        'mensagem' => $erro,
        'data' => []
    ];
} else {
    // Confirma inserções
    $conexao->commit();
    // Pega ID correto do treinador
    $idTreinador = $conexao->insert_id;
    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Treinador cadastrado com sucesso.',
        'data' => [
            'id_usuario'  => $idUsuario,
            'id_treinador' => $idTreinador
        ]
    ];
}

// Fecha statements e conexão
$stmtTreinador->close();
$stmtUsuario->close();
$conexao->close();
// Retorno final em JSON
echo json_encode($retorno);
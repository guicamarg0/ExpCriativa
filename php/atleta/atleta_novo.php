<?php
header("Content-Type: application/json; charset=utf-8");
include_once('../conexao.php');

$retorno = ['status' => '', 'mensagem' => '', 'data' => []];

// conexão
if (!empty($conexao_error)) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Erro de conexao com o banco.', 'data' => []]);
    exit;
}

// dados
$nome       = isset($_POST['nome']) ? trim($_POST['nome']) : '';
$data_nasc  = isset($_POST['data_nascimento']) ? trim($_POST['data_nascimento']) : null;
$id_genero  = isset($_POST['id_genero']) && $_POST['id_genero'] !== '' ? (int)$_POST['id_genero'] : null;
$id_equipe  = isset($_POST['id_equipe']) && $_POST['id_equipe'] !== '' ? (int)$_POST['id_equipe'] : null;
$altura     = isset($_POST['altura']) && $_POST['altura'] !== '' ? (float)$_POST['altura'] : null;
$peso       = isset($_POST['peso']) && $_POST['peso'] !== '' ? (float)$_POST['peso'] : null;
$email      = isset($_POST['email']) ? trim($_POST['email']) : '';
$senha      = isset($_POST['senha']) ? trim($_POST['senha']) : '';
$status     = 'ativo';

// validações
if ($nome === '') {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Nome obrigatorio.', 'data' => []]);
    exit;
}

if ($email === '' || $senha === '') {
    echo json_encode(['status' => 'nok', 'mensagem' => 'E-mail e senha obrigatorios.', 'data' => []]);
    exit;
}

// USUARIO
$stmtUsuario = $conexao->prepare(
    "INSERT INTO usuarios (email, senha, id_nivel, status) VALUES (?, ?, 3, ?)"
);

// ATLETA (CORRIGIDO COM id_equipe)
$stmtAtleta = $conexao->prepare(
    "INSERT INTO atletas (
        id_usuario,
        id_equipe,
        id_genero,
        nome,
        data_nascimento,
        peso,
        altura,
        status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
);

$conexao->begin_transaction();

$erro = '';
$idUsuario = 0;

// cria usuário
$stmtUsuario->bind_param("sss", $email, $senha, $status);

if (!$stmtUsuario->execute()) {
    $erro = $conexao->errno === 1062 ? 'E-mail já cadastrado.' : 'Erro ao criar usuario.';
} else {

    $idUsuario = $stmtUsuario->insert_id;

    // cria atleta
    $stmtAtleta->bind_param(
        "iiissdds",
        $idUsuario,
        $id_equipe,
        $id_genero,
        $nome,
        $data_nasc,
        $peso,
        $altura,
        $status
    );

    if (!$stmtAtleta->execute()) {
        $erro = 'Erro ao criar atleta.';
    }
}

if ($erro !== '') {
    $conexao->rollback();
    echo json_encode(['status' => 'nok', 'mensagem' => $erro, 'data' => []]);
} else {
    $conexao->commit();
    echo json_encode([
        'status' => 'ok',
        'mensagem' => 'Atleta cadastrado com sucesso.',
        'data' => ['id' => $stmtAtleta->insert_id]
    ]);
}

$stmtAtleta->close();
$stmtUsuario->close();
$conexao->close();
?>
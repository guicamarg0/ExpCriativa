<?php
include_once('../conexao.php');
header("Content-type:application/json;charset:utf-8");
// Resposta padrão
$retorno = [
    'status' => 'nok',
    'mensagem' => 'Erro ao processar requisição.',
    'data' => []
];

// Verifica se houve erro na conexão
if (!empty($conexao_error)) {
    echo json_encode([
        'status' => 'nok',
        'mensagem' => 'Erro de conexão com o banco.',
        'data' => []
    ]);
    exit;
}

// Recebe os dados do formulário
$id = isset($_POST['id']) ? (int) $_POST['id'] : 0;
$nome = $_POST['nome'] ?? '';
$descricao = $_POST['descricao'] ?? '';
$categoria = $_POST['categoria'] ?? '';
$status = $_POST['status'] ?? 'ativa';

/* IDs opcionais (corrigidos para NULL real) */
$id_modalidade = ($_POST['id_modalidade'] ?? '') !== '' ? (int) $_POST['id_modalidade'] : null;
$id_genero = ($_POST['id_genero'] ?? '') !== '' ? (int) $_POST['id_genero'] : null;
$id_treinador_responsavel = ($_POST['id_treinador_responsavel'] ?? '') !== '' ? (int) $_POST['id_treinador_responsavel'] : null;

// Validações básicas
if ($id <= 0) {
    echo json_encode([
        'status' => 'nok',
        'mensagem' => 'ID obrigatório.',
        'data' => []
    ]);
    exit;
}

if ($nome === '') {
    echo json_encode([
        'status' => 'nok',
        'mensagem' => 'Nome obrigatório.',
        'data' => []
    ]);
    exit;
}

// Verifica se a equipe existe
$stmtCheck = $conexao->prepare("SELECT id FROM equipes WHERE id = ?");
$stmtCheck->bind_param("i", $id);
$stmtCheck->execute();
$result = $stmtCheck->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        'status' => 'nok',
        'mensagem' => 'Equipe não encontrada.',
        'data' => []
    ]);
    exit;
}
$stmtCheck->close();

// Atualiza a equipe
$stmt = $conexao->prepare("
    UPDATE equipes SET
        nome = ?,
        descricao = ?,
        id_modalidade = ?,
        id_genero = ?,
        categoria = ?,
        status = ?,
        id_treinador_responsavel = ?
    WHERE id = ?
");

if (!$stmt) {
    echo json_encode([
        'status' => 'nok',
        'mensagem' => 'Erro ao preparar SQL.',
        'data' => []
    ]);
    exit;
}

// Bind dos parâmetros (usando NULL para valores opcionais)
$stmt->bind_param(
    "ssisssii",
    $nome,
    $descricao,
    $id_modalidade,
    $id_genero,
    $categoria,
    $status,
    $id_treinador_responsavel,
    $id
);

$stmt->execute();

// Verifica se a execução foi bem-sucedida
if ($stmt->errno === 0) {
    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Equipe atualizada com sucesso.',
        'data' => []
    ];
} else {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Erro ao atualizar equipe.',
        'data' => []
    ];
}

$stmt->close();
$conexao->close();
echo json_encode($retorno);
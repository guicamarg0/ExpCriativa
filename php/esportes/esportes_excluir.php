<?php
// Retorno JSON
header("Content-type:application/json;charset=utf-8");
// Conexão
include_once('../conexao.php');
// Estrutura padrão
$retorno = [
    'status' => 'nok',
    'mensagem' => 'Erro ao processar requisição.',
    'data' => []
];

// Verifica ID
if (!isset($_GET['id']) || (int)$_GET['id'] <= 0) {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'ID é obrigatório para exclusão.',
        'data' => []
    ];
    echo json_encode($retorno);
    exit;
}

// ID seguro
$id = (int) $_GET['id'];
// Prepara DELETE
$stmt = $conexao->prepare("
    DELETE FROM modalidades
    WHERE id = ?
");

if (!$stmt) {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Erro ao preparar exclusão.',
        'data' => []
    ];
    echo json_encode($retorno);
    exit;
}

// Bind
$stmt->bind_param("i", $id);
// Executa
$stmt->execute();

// Resultado
if ($stmt->affected_rows > 0) {
    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Registro excluído com sucesso.',
        'data' => []
    ];
} else {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Nenhum registro encontrado para excluir.',
        'data' => []
    ];
}
// Fecha
$stmt->close();
$conexao->close();
// Retorno
echo json_encode($retorno);
?>
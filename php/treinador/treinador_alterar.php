<?php
include_once('../conexao.php');
include_once('../permissao.php');
exigir_admin();

$id = (int) $_POST['id'];
$nome = $_POST['nome'];
$data_nascimento = $_POST['data_nascimento'] ?? '';
$telefone = $_POST['telefone'] ?? '';
$cref = $_POST['cref'] ?? '';
$data_inicio = $_POST['data_inicio'] ?? '';
$email = $_POST['email'];
$senha = trim($_POST['senha'] ?? '');
$status = $_POST['status'] ?? 'ativo';

$stmtBusca = $conexao->prepare("SELECT id_usuario FROM treinadores WHERE id = ?");
$stmtBusca->bind_param("i", $id);
$stmtBusca->execute();
$treinadorAtual = $stmtBusca->get_result()->fetch_assoc();
$idUsuario = (int) $treinadorAtual['id_usuario'];
$stmtBusca->close();

$sqlUsuario = $senha === ''
    ? "UPDATE usuarios SET email = ?, status = ? WHERE id = ?"
    : "UPDATE usuarios SET email = ?, senha = ?, status = ? WHERE id = ?";

$stmtUsuario = $conexao->prepare($sqlUsuario);
if ($senha === '') {
    $stmtUsuario->bind_param("ssi", $email, $status, $idUsuario);
} else {
    $stmtUsuario->bind_param("sssi", $email, $senha, $status, $idUsuario);
}
$stmtUsuario->execute();
$stmtUsuario->close();

$stmtTreinador = $conexao->prepare(
    "UPDATE treinadores SET
        nome = ?,
        cref = ?,
        telefone = ?,
        data_nascimento = NULLIF(?, ''),
        data_inicio = NULLIF(?, ''),
        status = ?
    WHERE id = ?"
);

$stmtTreinador->bind_param(
    "ssssssi",
    $nome,
    $cref,
    $telefone,
    $data_nascimento,
    $data_inicio,
    $status,
    $id
);
$stmtTreinador->execute();

$retorno = [
    'status' => 'ok',
    'mensagem' => 'Treinador alterado com sucesso.',
    'data' => []
];

$stmtTreinador->close();
$conexao->close();

header("Content-type:application/json;charset:utf-8");
echo json_encode($retorno);

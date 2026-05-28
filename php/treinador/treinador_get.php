<?php
session_start();
include_once('../conexao.php');

$idNivel = (int) ($_SESSION['id_nivel'] ?? 0);
$idUsuario = (int) ($_SESSION['usuario_id'] ?? 0);
$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

function responder_treinadores($stmt, $conexao) {
    $stmt->execute();
    $resultado = $stmt->get_result();

    $tabela = [];
    while ($linha = $resultado->fetch_assoc()) {
        $tabela[] = $linha;
    }

    $stmt->close();
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode([
        'status' => 'ok',
        'mensagem' => 'Sucesso, consulta efetuada.',
        'data' => $tabela
    ]);
    exit;
}

if ($idNivel === 2) {
    $sql = "SELECT * FROM treinadores WHERE id_usuario = ?";
    if ($id > 0) {
        $sql .= " AND id = ?";
        $stmt = $conexao->prepare($sql);
        $stmt->bind_param("ii", $idUsuario, $id);
    } else {
        $stmt = $conexao->prepare($sql);
        $stmt->bind_param("i", $idUsuario);
    }
    responder_treinadores($stmt, $conexao);
}

if ($idNivel === 3) {
    $stmt = $conexao->prepare("SELECT * FROM treinadores WHERE 1 = 0");
    responder_treinadores($stmt, $conexao);
}

if ($id > 0) {
    $stmt = $conexao->prepare("SELECT * FROM treinadores WHERE id = ?");
    $stmt->bind_param("i", $id);
} else {
    $stmt = $conexao->prepare("SELECT * FROM treinadores");
}

responder_treinadores($stmt, $conexao);

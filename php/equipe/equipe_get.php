<?php
session_start();
include_once('../conexao.php');

$idNivel = (int) ($_SESSION['id_nivel'] ?? 0);
$idUsuario = (int) ($_SESSION['usuario_id'] ?? 0);
$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

function responder_equipes($stmt, $conexao) {
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
    $sql = "
        SELECT equipes.*
        FROM equipes
        INNER JOIN treinadores ON treinadores.id = equipes.id_treinador_responsavel
        WHERE treinadores.id_usuario = ?
    ";
    if ($id > 0) {
        $sql .= " AND equipes.id = ?";
        $stmt = $conexao->prepare($sql);
        $stmt->bind_param("ii", $idUsuario, $id);
    } else {
        $stmt = $conexao->prepare($sql);
        $stmt->bind_param("i", $idUsuario);
    }
    responder_equipes($stmt, $conexao);
}

if ($idNivel === 3) {
    $sql = "
        SELECT equipes.*
        FROM equipes
        INNER JOIN atletas ON atletas.id_equipe = equipes.id
        WHERE atletas.id_usuario = ?
    ";
    if ($id > 0) {
        $sql .= " AND equipes.id = ?";
        $stmt = $conexao->prepare($sql);
        $stmt->bind_param("ii", $idUsuario, $id);
    } else {
        $stmt = $conexao->prepare($sql);
        $stmt->bind_param("i", $idUsuario);
    }
    responder_equipes($stmt, $conexao);
}

if ($id > 0) {
    $stmt = $conexao->prepare("SELECT * FROM equipes WHERE id = ?");
    $stmt->bind_param("i", $id);
} else {
    $stmt = $conexao->prepare("SELECT * FROM equipes");
}

responder_equipes($stmt, $conexao);

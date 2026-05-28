<?php
header('Content-Type: application/json');
session_start();
require_once 'conexao.php';

$id_treinador = isset($_GET['id_treinador']) ? intval($_GET['id_treinador']) : 0;
$id_equipe = isset($_GET['id_equipe']) ? intval($_GET['id_equipe']) : 0;
if(!$id_treinador){ echo json_encode(['treinos'=>[], 'comparacao'=>[]]); exit; }

$idNivel = (int) ($_SESSION['id_nivel'] ?? 0);
$idUsuario = (int) ($_SESSION['usuario_id'] ?? 0);

if ($idNivel === 2) {
    $stmtPermissao = $conexao->prepare("SELECT id FROM treinadores WHERE id = ? AND id_usuario = ?");
    $stmtPermissao->bind_param('ii', $id_treinador, $idUsuario);
    $stmtPermissao->execute();
    if ($stmtPermissao->get_result()->num_rows === 0) {
        echo json_encode(['treinos'=>[], 'comparacao'=>[]]);
        exit;
    }
    $stmtPermissao->close();

    if ($id_equipe > 0) {
        $stmtEquipe = $conexao->prepare("SELECT id FROM equipes WHERE id = ? AND id_treinador_responsavel = ?");
        $stmtEquipe->bind_param('ii', $id_equipe, $id_treinador);
        $stmtEquipe->execute();
        if ($stmtEquipe->get_result()->num_rows === 0) {
            echo json_encode(['treinos'=>[], 'comparacao'=>[]]);
            exit;
        }
        $stmtEquipe->close();
    }
} elseif ($idNivel === 3) {
    echo json_encode(['treinos'=>[], 'comparacao'=>[]]);
    exit;
}

$resp = ['treinos'=>[], 'comparacao'=>[]];

// treinos agendados pelo treinador
$stmt = $conexao->prepare("
    SELECT
        t.id,
        DATE(t.data_inicio) AS data,
        COALESCE(m.nome, t.titulo) AS modalidade,
        t.descricao AS detalhes
    FROM treinos t
    LEFT JOIN modalidades m ON m.id = t.id_modalidade
    WHERE t.id_treinador = ?
    ORDER BY t.data_inicio DESC
");
$stmt->bind_param('i', $id_treinador);
$stmt->execute();
$result = $stmt->get_result();
while($row = $result->fetch_assoc()){
    $resp['treinos'][] = $row;
}

// comparação de atletas filtrado por equipe (presenças)
$query = '
    SELECT a.id, a.nome, COUNT(p.id) as presencas
    FROM atletas a
    LEFT JOIN presencas p ON a.id = p.id_atleta AND p.presente = 1
';
if($id_equipe) {
    $query .= ' WHERE a.id_equipe = '.intval($id_equipe);
} elseif ($idNivel === 2) {
    $query .= ' WHERE a.id_equipe IN (SELECT id FROM equipes WHERE id_treinador_responsavel = '.intval($id_treinador).')';
}
$query .= ' GROUP BY a.id, a.nome ORDER BY presencas DESC';
$res = $conexao->query($query);
while($r = $res->fetch_assoc()){
    $resp['comparacao'][] = ['id'=>$r['id'], 'nome'=>$r['nome'], 'presencas'=>intval($r['presencas'])];
}

echo json_encode($resp);

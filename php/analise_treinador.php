<?php
header('Content-Type: application/json');
require_once 'conexao.php';

$id_treinador = isset($_GET['id_treinador']) ? intval($_GET['id_treinador']) : 0;
$id_equipe = isset($_GET['id_equipe']) ? intval($_GET['id_equipe']) : 0;
if(!$id_treinador){ echo json_encode(['treinos'=>[], 'comparacao'=>[]]); exit; }

$resp = ['treinos'=>[], 'comparacao'=>[]];

// treinos agendados pelo treinador
$stmt = $conexao->prepare('SELECT id, id_atleta, data, modalidade, detalhes FROM treinos WHERE id_treinador = ? ORDER BY data DESC');
$stmt->bind_param('i', $id_treinador);
$stmt->execute();
$result = $stmt->get_result();
while($row = $result->fetch_assoc()){
    $resp['treinos'][] = $row;
}

// comparação de atletas filtrado por equipe (presenças)
$query = 'SELECT a.id, a.nome, COUNT(p.id) as presencas FROM atletas a LEFT JOIN presencas p ON a.id=p.id_atleta AND p.presente=1';
if($id_equipe) $query .= ' WHERE a.id_equipe = '.intval($id_equipe);
$query .= ' GROUP BY a.id, a.nome ORDER BY presencas DESC';
$res = $conexao->query($query);
while($r = $res->fetch_assoc()){
    $resp['comparacao'][] = ['id'=>$r['id'], 'nome'=>$r['nome'], 'presencas'=>intval($r['presencas'])];
}

echo json_encode($resp);

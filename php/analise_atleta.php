<?php
header('Content-Type: application/json');
require_once 'conexao.php';

$id_atleta = isset($_GET['id_atleta']) ? intval($_GET['id_atleta']) : 0;
if(!$id_atleta){ echo json_encode([]); exit; }

$resp = ['presencas'=>0, 'evolucao'=>[], 'proximo_treino'=>null];

// presenças
$stmt = $conexao->prepare('SELECT COUNT(*) as c FROM presencas WHERE id_atleta = ? AND presente=1');
$stmt->bind_param('i', $id_atleta);
$stmt->execute();
$res = $stmt->get_result()->fetch_assoc();
$resp['presencas'] = intval($res['c']);

// evolução (peso, altura e observações)
$stmt = $conexao->prepare('SELECT data, peso, altura, observacao FROM progresso WHERE id_atleta = ? ORDER BY data');
$stmt->bind_param('i', $id_atleta);
$stmt->execute();
$result = $stmt->get_result();
while($row = $result->fetch_assoc()){
    $resp['evolucao'][] = [
        'data'=> $row['data'],
        'peso'=> floatval($row['peso']),
        'altura'=> floatval($row['altura']),
        'observacao'=> $row['observacao']
    ];
}

// próximo treino
$stmt = $conexao->prepare("
    SELECT
        t.id,
        DATE(t.data_inicio) AS data,
        COALESCE(m.nome, t.titulo) AS modalidade,
        t.descricao AS detalhes
    FROM treino_atletas ta
    INNER JOIN treinos t ON t.id = ta.id_treino
    LEFT JOIN modalidades m ON m.id = t.id_modalidade
    WHERE ta.id_atleta = ?
      AND t.data_inicio >= NOW()
    ORDER BY t.data_inicio
    LIMIT 1
");
$stmt->bind_param('i', $id_atleta);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
if($row) $resp['proximo_treino'] = $row;

echo json_encode($resp);

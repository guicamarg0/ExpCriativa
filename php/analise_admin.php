<?php
header('Content-Type: application/json');
require_once 'conexao.php';

$resp = ['equipes'=>[], 'treinadores'=>[], 'atletas'=>[]];

$res = $conexao->query('SELECT id, nome FROM equipes');
while($r = $res->fetch_assoc()) $resp['equipes'][] = $r;

$res = $conexao->query('SELECT id, nome FROM treinadores');
while($r = $res->fetch_assoc()) $resp['treinadores'][] = $r;

$res = $conexao->query('SELECT id, nome FROM atletas');
while($r = $res->fetch_assoc()) $resp['atletas'][] = $r;

echo json_encode($resp);

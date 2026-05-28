<?php
header("Content-type:application/json;charset:utf-8");
include_once('../conexao.php');

$retorno = [
    'status' => 'nok',
    'mensagem' => 'Nao ha registros no bd',
    'data' => []
];

if (isset($_GET['id'])) {
    $stmt = $conexao->prepare("
        SELECT
            treinos.*,
            treino_atletas.id AS id_treino_atleta,
            treino_atletas.id_atleta,
            treinadores.nome AS nome_treinador,
            GROUP_CONCAT(treino_exercicios.id_exercicio) AS exercicio_ids
        FROM treinos
        LEFT JOIN treino_atletas ON treino_atletas.id_treino = treinos.id
        LEFT JOIN treinadores ON treinadores.id = treinos.id_treinador
        LEFT JOIN treino_exercicios ON treino_exercicios.id_treino = treinos.id
        WHERE treinos.id = ?
        GROUP BY treinos.id, treino_atletas.id, treino_atletas.id_atleta, treinadores.nome
    ");
    $id = (int) $_GET['id'];
    $stmt->bind_param("i", $id);
} elseif (isset($_GET['id_atleta'])) {
    $stmt = $conexao->prepare("
        SELECT
            treinos.*,
            treino_atletas.id AS id_treino_atleta,
            treino_atletas.id_atleta,
            treinadores.nome AS nome_treinador,
            GROUP_CONCAT(treino_exercicios.id_exercicio) AS exercicio_ids
        FROM treino_atletas
        INNER JOIN treinos ON treinos.id = treino_atletas.id_treino
        LEFT JOIN treinadores ON treinadores.id = treinos.id_treinador
        LEFT JOIN treino_exercicios ON treino_exercicios.id_treino = treinos.id
        WHERE treino_atletas.id_atleta = ?
        GROUP BY treinos.id, treino_atletas.id, treino_atletas.id_atleta, treinadores.nome
        ORDER BY treinos.data_inicio DESC
    ");
    $idAtleta = (int) $_GET['id_atleta'];
    $stmt->bind_param("i", $idAtleta);
} else {
    $stmt = $conexao->prepare("
        SELECT
            treinos.*,
            treino_atletas.id AS id_treino_atleta,
            treino_atletas.id_atleta,
            treinadores.nome AS nome_treinador,
            GROUP_CONCAT(treino_exercicios.id_exercicio) AS exercicio_ids
        FROM treinos
        LEFT JOIN treino_atletas ON treino_atletas.id_treino = treinos.id
        LEFT JOIN treinadores ON treinadores.id = treinos.id_treinador
        LEFT JOIN treino_exercicios ON treino_exercicios.id_treino = treinos.id
        GROUP BY treinos.id, treino_atletas.id, treino_atletas.id_atleta, treinadores.nome
        ORDER BY treinos.data_inicio DESC
    ");
}

if (!$stmt) {
    $retorno['mensagem'] = 'Erro ao preparar consulta: ' . $conexao->error;
    echo json_encode($retorno);
    exit;
}

$stmt->execute();
$resultado = $stmt->get_result();
$tabela = [];

while ($linha = $resultado->fetch_assoc()) {
    $linha['modalidade'] = $linha['titulo'] ?? '';
    $linha['data'] = isset($linha['data_inicio']) ? substr($linha['data_inicio'], 0, 10) : '';
    $linha['detalhes'] = $linha['descricao'] ?? '';
    $tabela[] = $linha;
}

if (count($tabela) > 0) {
    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Sucesso, consulta efetuada no bd.',
        'data' => $tabela
    ];
}

$stmt->close();
$conexao->close();

echo json_encode($retorno);

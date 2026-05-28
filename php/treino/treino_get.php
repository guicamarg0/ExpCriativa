<?php
header("Content-type:application/json;charset:utf-8");
session_start();
include_once('../conexao.php');

$retorno = [
    'status' => 'nok',
    'mensagem' => 'Nao ha registros no bd',
    'data' => []
];

$idNivel = (int) ($_SESSION['id_nivel'] ?? 0);
$idUsuario = (int) ($_SESSION['usuario_id'] ?? 0);

function atleta_permitido($conexao, $idAtleta, $idNivel, $idUsuario) {
    if ($idNivel === 1) {
        return true;
    }

    if ($idNivel === 3) {
        $stmt = $conexao->prepare("SELECT id FROM atletas WHERE id = ? AND id_usuario = ?");
        $stmt->bind_param("ii", $idAtleta, $idUsuario);
        $stmt->execute();
        $permitido = $stmt->get_result()->num_rows > 0;
        $stmt->close();
        return $permitido;
    }

    if ($idNivel === 2) {
        $stmt = $conexao->prepare("
            SELECT atletas.id
            FROM atletas
            INNER JOIN equipes ON equipes.id = atletas.id_equipe
            INNER JOIN treinadores ON treinadores.id = equipes.id_treinador_responsavel
            WHERE atletas.id = ? AND treinadores.id_usuario = ?
        ");
        $stmt->bind_param("ii", $idAtleta, $idUsuario);
        $stmt->execute();
        $permitido = $stmt->get_result()->num_rows > 0;
        $stmt->close();
        return $permitido;
    }

    return false;
}

if (isset($_GET['id'])) {
    $sqlId = "
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
    ";
    if ($idNivel === 2) {
        $sqlId .= " AND EXISTS (
            SELECT 1 FROM treinadores tperm
            WHERE tperm.id = treinos.id_treinador AND tperm.id_usuario = ?
        )";
    } elseif ($idNivel === 3) {
        $sqlId .= " AND EXISTS (
            SELECT 1 FROM treino_atletas taperm
            INNER JOIN atletas aperm ON aperm.id = taperm.id_atleta
            WHERE taperm.id_treino = treinos.id AND aperm.id_usuario = ?
        )";
    }
    $sqlId .= " GROUP BY treinos.id, treino_atletas.id, treino_atletas.id_atleta, treinadores.nome";
    $stmt = $conexao->prepare($sqlId);
    $id = (int) $_GET['id'];
    if ($idNivel === 2 || $idNivel === 3) {
        $stmt->bind_param("ii", $id, $idUsuario);
    } else {
        $stmt->bind_param("i", $id);
    }
} elseif (isset($_GET['id_atleta'])) {
    $idAtleta = (int) $_GET['id_atleta'];
    if (!atleta_permitido($conexao, $idAtleta, $idNivel, $idUsuario)) {
        $retorno['mensagem'] = 'Acesso negado para este atleta.';
        echo json_encode($retorno);
        exit;
    }

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

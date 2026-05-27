<?php
    header("Content-type:application/json;charset:utf-8");
    include_once('../conexao.php');
    // Configurando o padrão de retorno
    $retorno = [
        'status' => '', // ok - nok
        'mensagem' => '', // mensagem que envio para o front
        'data' => []
    ];

    if (isset($_GET['id'])) {
    $stmt = $conexao->prepare("
        SELECT treinos.*, treinadores.nome AS nome_treinador,
            GROUP_CONCAT(treino_exercicios.exercicio_id) AS exercicio_ids
        FROM treinos
        LEFT JOIN treinadores ON treinadores.id = treinos.id_treinador
        LEFT JOIN treino_exercicios ON treino_exercicios.treino_id = treinos.id
        WHERE treinos.id = ?
        GROUP BY treinos.id
    ");
    $stmt->bind_param("i", $_GET['id']);
    }

    elseif (isset($_GET['id_atleta'])) { // se veio um id pela url
        //RECEBENDO O ID por GET
        $stmt = $conexao->prepare("
        SELECT treinos.*, treinadores.nome AS nome_treinador 
        FROM treinos
        LEFT JOIN treinadores ON treinadores.id = treinos.id_treinador
        WHERE treinos.id_atleta = ?
    ");
    $stmt->bind_param("i", $_GET['id_atleta']);
    }
    else{
    $stmt = $conexao->prepare("
        SELECT treinos.*, treinadores.nome AS nome_treinador
        FROM treinos
        LEFT JOIN treinadores ON treinadores.id = treinos.id_treinador
    ");
    }

    // Executando a query
    $stmt->execute();
    $resultado = $stmt->get_result();
    // Criando um array vazio para receber o resultado do bd
    $tabela = [];

    if ($resultado->num_rows > 0) {
        while ($linha = $resultado->fetch_assoc()) {
            $tabela[] = $linha;
        }

        $retorno = [
            'status' => 'ok',
            'mensagem' => 'Sucesso, consulta efetuada no bd.', // mensagem que envio para o front
            'data' => $tabela
        ];
    }
    else {
        $retorno = [
            'status' => 'nok',
            'mensagem' => 'Não há registros no bd', // mensagem que envio para o front
            'data' => []
        ];
    }
    // Fechamento do estado e conexão.
    $stmt->close();
    $conexao->close();

    // Estou enviando para o fronted o array RETORNO
    // mas no formato JSON
    echo json_encode($retorno);<?php
header("Content-type:application/json;charset:utf-8");
include_once('../conexao.php');

$retorno = [
    'status' => 'nok',
    'mensagem' => 'Não há registros no bd',
    'data' => []
];

if (isset($_GET['id'])) {
    $stmt = $conexao->prepare("
        SELECT
            treinos.*,
            treino_atletas.id_atleta,
            treinadores.nome AS nome_treinador
        FROM treinos
        LEFT JOIN treino_atletas ON treino_atletas.id_treino = treinos.id
        LEFT JOIN treinadores ON treinadores.id = treinos.id_treinador
        WHERE treinos.id = ?
    ");
    $id = (int) $_GET['id'];
    $stmt->bind_param("i", $id);
} elseif (isset($_GET['id_atleta'])) {
    $stmt = $conexao->prepare("
        SELECT
            treinos.*,
            treino_atletas.id_atleta,
            treinadores.nome AS nome_treinador
        FROM treino_atletas
        INNER JOIN treinos ON treinos.id = treino_atletas.id_treino
        LEFT JOIN treinadores ON treinadores.id = treinos.id_treinador
        WHERE treino_atletas.id_atleta = ?
        ORDER BY treinos.data_inicio DESC
    ");
    $idAtleta = (int) $_GET['id_atleta'];
    $stmt->bind_param("i", $idAtleta);
} else {
    $stmt = $conexao->prepare("
        SELECT
            treinos.*,
            treino_atletas.id_atleta,
            treinadores.nome AS nome_treinador
        FROM treinos
        LEFT JOIN treino_atletas ON treino_atletas.id_treino = treinos.id
        LEFT JOIN treinadores ON treinadores.id = treinos.id_treinador
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

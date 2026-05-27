<?php
    header("Content-type:application/json;charset:utf-8");
    include_once('../conexao.php');
    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    $modalidade = $_POST['modalidade']; 
    $modalidade_id = isset($_POST['modalidade_id']) ? intval($_POST['modalidade_id']) : 0;
    $data       = $_POST['data'];
    $detalhes   = $_POST['detalhes'];
    $id_atleta  = $_POST['id_atleta'];
    $id_treinador = $_POST['id_treinador'];
    $exercicios_json = isset($_POST['exercicios']) ? $_POST['exercicios'] : '[]';

    // Preparando para inserção no banco de dados
    $stmt = $conexao->prepare("
    INSERT INTO treinos(modalidade, data, detalhes, id_atleta, id_treinador) VALUES(?,?,?,?,?)");
    $stmt->bind_param("sssii", $modalidade, $data, $detalhes, $id_atleta, $id_treinador);
    $stmt->execute();

    if($stmt->affected_rows > 0){
        $treino_id = $stmt->insert_id;
        $ex_ids = json_decode($exercicios_json, true);
        if(is_array($ex_ids) && count($ex_ids) > 0){
            foreach($ex_ids as $ex_id){
                $link = $conexao->prepare("INSERT IGNORE INTO treino_exercicios(treino_id, exercicio_id) VALUES(?,?)");
                $link->bind_param("ii", $treino_id, $ex_id);
                $link->execute();
                $link->close();
            }
        }

        $retorno = [
            'status' => 'ok',
            'mensagem' => 'registro inserido com sucesso',
            'data' => []
        ];
    }else{
        $retorno = [
            'status' => 'nok',
            'mensagem' => 'falha ao inserir o registro',
            'data' => []
        ];
    }

    $stmt->close();
    $conexao->close();

    echo json_encode($retorno);<?php
header("Content-type:application/json;charset:utf-8");
include_once('../conexao.php');

$retorno = [
    'status' => 'nok',
    'mensagem' => 'Falha ao inserir o registro.',
    'data' => []
];

$titulo = trim($_POST['modalidade'] ?? '');
$dataInicio = $_POST['data'] ?? '';
$descricao = $_POST['detalhes'] ?? '';
$idAtleta = (int) ($_POST['id_atleta'] ?? 0);
$idTreinador = (int) ($_POST['id_treinador'] ?? 0);

if ($titulo === '' || $dataInicio === '' || $idAtleta <= 0 || $idTreinador <= 0) {
    $retorno['mensagem'] = 'Dados obrigatórios não informados.';
    echo json_encode($retorno);
    exit;
}

$dataInicio .= strlen($dataInicio) === 10 ? ' 00:00:00' : '';

$stmt = $conexao->prepare("
    INSERT INTO treinos (id_treinador, titulo, data_inicio, descricao, status)
    VALUES (?, ?, ?, ?, 'ativo')
");

if (!$stmt) {
    $retorno['mensagem'] = 'Erro ao preparar cadastro do treino: ' . $conexao->error;
    echo json_encode($retorno);
    exit;
}

$stmt->bind_param("isss", $idTreinador, $titulo, $dataInicio, $descricao);
$stmt->execute();
$idTreino = (int) $stmt->insert_id;
$stmt->close();

if ($idTreino <= 0) {
    $retorno['mensagem'] = 'Treino não foi inserido.';
    $conexao->close();
    echo json_encode($retorno);
    exit;
}

$stmtVinculo = $conexao->prepare("
    INSERT INTO treino_atletas (id_treino, id_atleta)
    VALUES (?, ?)
");

if (!$stmtVinculo) {
    $retorno['mensagem'] = 'Treino criado, mas falhou ao vincular atleta: ' . $conexao->error;
    $conexao->close();
    echo json_encode($retorno);
    exit;
}

$stmtVinculo->bind_param("ii", $idTreino, $idAtleta);
$stmtVinculo->execute();
$stmtVinculo->close();
$conexao->close();

$retorno = [
    'status' => 'ok',
    'mensagem' => 'Registro inserido com sucesso.',
    'data' => [
        'id' => $idTreino
    ]
];

echo json_encode($retorno);

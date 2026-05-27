<?php
    header("Content-type:application/json;charset:utf-8");
    include_once('../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    if(isset($_GET['id'])){
        $treino_id = intval($_GET['id']);
        $modalidade = $_POST['modalidade']; 
        $modalidade_id = isset($_POST['modalidade_id']) ? intval($_POST['modalidade_id']) : 0;
        $data       = $_POST['data'];
        $detalhes   = $_POST['detalhes'];
        $exercicios_json = isset($_POST['exercicios']) ? $_POST['exercicios'] : '[]';
    
        // Preparando para atualização do treino
        $stmt = $conexao->prepare("UPDATE treinos SET modalidade = ?, data = ?, detalhes = ? WHERE id = ?");
        $stmt->bind_param("sssi", $modalidade, $data, $detalhes, $treino_id);
        $stmt->execute();

        if($stmt->affected_rows >= 0){
            $stmt->close();

            $delete = $conexao->prepare("DELETE FROM treino_exercicios WHERE treino_id = ?");
            $delete->bind_param("i", $treino_id);
            $delete->execute();
            $delete->close();

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
                'status'    => 'ok',
                'mensagem'  => 'Registro alterado com sucesso.',
                'data'      => []
            ];
        }else{
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Não consegui alterar o registro.'.json_encode($_GET),
                'data'      => []
            ];
            $stmt->close();
        }
    }else{
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Não posso alterar um registro sem um ID informado.',
            'data'      => []
        ];
    }
       
    $conexao->close();

    echo json_encode($retorno);<?php
header("Content-type:application/json;charset:utf-8");
include_once('../conexao.php');

$retorno = [
    'status' => 'nok',
    'mensagem' => 'Não posso alterar um registro sem um ID informado.',
    'data' => []
];

if (!isset($_GET['id'])) {
    echo json_encode($retorno);
    exit;
}

$id = (int) $_GET['id'];
$titulo = trim($_POST['modalidade'] ?? '');
$dataInicio = $_POST['data'] ?? '';
$descricao = $_POST['detalhes'] ?? '';

if ($id <= 0 || $titulo === '' || $dataInicio === '') {
    $retorno['mensagem'] = 'Dados obrigatórios não informados.';
    echo json_encode($retorno);
    exit;
}

$dataInicio .= strlen($dataInicio) === 10 ? ' 00:00:00' : '';

$stmt = $conexao->prepare("
    UPDATE treinos
    SET titulo = ?, data_inicio = ?, descricao = ?
    WHERE id = ?
");

if (!$stmt) {
    $retorno['mensagem'] = 'Erro ao preparar alteração: ' . $conexao->error;
    echo json_encode($retorno);
    exit;
}

$stmt->bind_param("sssi", $titulo, $dataInicio, $descricao, $id);
$stmt->execute();
$stmt->close();
$conexao->close();

$retorno = [
    'status' => 'ok',
    'mensagem' => 'Registro alterado com sucesso.',
    'data' => []
];

echo json_encode($retorno);

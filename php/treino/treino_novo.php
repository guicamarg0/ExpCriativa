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

    echo json_encode($retorno);
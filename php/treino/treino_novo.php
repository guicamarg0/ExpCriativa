<?php
    header("Content-type:application/json;charset:utf-8");
    include_once('../conexao.php');
    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    $modalidade = $_POST['modalidade']; 
    $data       = $_POST['data'];
    $detalhes   = $_POST['detalhes'];
    $id_atleta  = $_POST['id_atleta'];
    $id_treinador = $_POST['id_treinador'];



    // Preparando para inserção no banco de dados
    $stmt = $conexao->prepare("
    INSERT INTO treinos(modalidade, data, detalhes, id_atleta, id_treinador) VALUES(?,?,?,?,?)");
    $stmt->bind_param("sssii", $modalidade, $data, $detalhes, $id_atleta, $id_treinador);
    $stmt->execute();

    if($stmt->affected_rows > 0){
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
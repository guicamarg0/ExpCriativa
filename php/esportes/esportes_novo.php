<?php
    include_once('../conexao.php');
    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    $nome       = $_POST['nome']; // $_POST['nome'];
    $status      = $_POST['status'];

    // Preparando para inserção no banco de dados
    $stmt = $conexao->prepare("
    INSERT INTO modalidades(nome, status) VALUES(?,?)");
    $stmt->bind_param("ss",$nome, $status);
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

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
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
<<<<<<<< HEAD:php/esportes/esportes_novo.php
    INSERT INTO modalidades(nome, status) VALUES(?,?)");
    $stmt->bind_param("ss",$nome, $status);
========
    INSERT INTO usuario(nome, email, usuario, senha, instagram, ativo) VALUES(?,?,?,?,?,?)");
    $stmt->bind_param("sssssi",$nome, $email, $usuario, $senha, $instagram, $ativo);
>>>>>>>> 98daac1f06bce6814783b8d304e869b2fb3385df:php/usuario_novo.php
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
<?php
    include_once('conexao.php');
    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];
    // Simulando as informações que vem do front
    $nome       = $_POST['nome']; // $_POST['nome'];
    $id_usuario      = $_POST['id_usuario'];
    $id_equipe   = $_POST['id_equipe'];
    $data_nascimento      = $_POST['data_nascimento'];
    $telefone   = $_POST['telefone'];
    $cref   = $_POST['cref'];
    $data_inicio   = $_POST['data_inicio'];
    $ativo      = (int) $_POST['ativo'];
    $inativo      = (int) $_POST['inativo'];

    // Preparando para inserção no banco de dados
    $stmt = $conexao->prepare("
    INSERT INTO cliente(nome, id_usuario, id_equipe, data_nascimento, telefone, cref, data_inicio, ativo, inativo) VALUES(?,?,?,?,?,?)");
    $stmt->bind_param("sssssi",$nome, $id_usuario, $id_equipe, $data_nascimento, $telefone, $cref, $data_inicio, $ativo, $inativo);
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
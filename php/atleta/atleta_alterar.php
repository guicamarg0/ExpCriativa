<?php
    include_once('../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    if(!empty($conexao_error)){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Erro de conexao com o banco.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    $id = isset($_POST['id']) ? (int) $_POST['id'] : 0;
    $nome = isset($_POST['nome']) ? trim($_POST['nome']) : '';
    $datadenasc = isset($_POST['datadenasc']) ? trim($_POST['datadenasc']) : '';
    $id_genero = isset($_POST['id_genero']) && $_POST['id_genero'] !== '' ? (int) $_POST['id_genero'] : null;
    $altura = isset($_POST['altura']) && $_POST['altura'] !== '' ? (int) $_POST['altura'] : null;
    $peso = isset($_POST['peso']) && $_POST['peso'] !== '' ? (int) $_POST['peso'] : null;

    if($id <= 0){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'ID obrigatorio.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    if($nome === ''){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Nome obrigatorio.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    $stmt = $conexao->prepare(
        "UPDATE atletas SET nome = ?, datadenasc = ?, id_genero = ?, altura = ?, peso = ? WHERE id = ?"
    );

    if(!$stmt){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Erro ao preparar alteracao.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    $stmt->bind_param("ssiissi", $nome, $datadenasc, $id_genero, $altura, $peso, $id);
    $stmt->execute();

    if($stmt->affected_rows > 0){
        $retorno = [
            'status'    => 'ok',
            'mensagem'  => 'Cadastro do atleta alterado com sucesso.',
            'data'      => []
        ];
    }else{
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Nao foi possivel alterar o cadastro do atleta.',
            'data'      => []
        ];
    }

    $stmt->close();
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);

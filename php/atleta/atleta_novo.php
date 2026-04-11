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

    $nome = isset($_POST['nome']) ? trim($_POST['nome']) : '';
    $descricao = isset($_POST['descricao']) ? trim($_POST['descricao']) : '';
    $datadenasc = isset($_POST['datadenasc']) && $_POST['datadenasc'] !== '' ? (int) $_POST['datadenasc'] : null;
    $genero = isset($_POST['genero']) && $_POST['genero'] !== '' ? (int) $_POST['genero'] : null;
    $esporte = isset($_POST['esporte']) ? trim($_POST['esporte']) : '';
    $status = isset($_POST['status']) && $_POST['status'] !== '' ? trim($_POST['status']) : 'ativa';

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
        "INSERT INTO atletas (nome, descricao, datadenasc, genero, esporte, status) VALUES(?,?,?,?,?,?)"
    );

    if(!$stmt){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Erro ao preparar insercao.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    $stmt->bind_param("ssiiss", $nome, $descricao, $datadenasc, $genero, $esporte, $status);
    $stmt->execute();

    if($stmt->affected_rows > 0){
        $retorno = [
            'status' => 'ok',
            'mensagem' => 'Atleta cadastrado com sucesso',
            'data' => [
                'id' => $stmt->insert_id
            ]
        ];
    }else{
        $retorno = [
            'status' => 'nok',
            'mensagem' => 'Falha ao inserir atleta',
            'data' => []
        ];
    }

    $stmt->close();
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);

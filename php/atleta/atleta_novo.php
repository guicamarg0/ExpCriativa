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
    $descricao = isset($_POST['datadenasc']) ? trim($_POST['datadenasc']) : '';
    $datadenasc = isset($_POST['id_genero']) && $_POST['id_genero'] !== '' ? (int) $_POST['id_genero'] : null;
    $genero = isset($_POST['altura']) && $_POST['altura'] !== '' ? (int) $_POST['altura'] : null;
    $esporte = isset($_POST['peso']) ? trim($_POST['peso']) : '';

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
        "INSERT INTO atletas (nome, datadenasc, id_genero, altura, peso) VALUES(?,?,?,?,?)"
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

    $stmt->bind_param("ssiiss", $nome, $datadenasc, $id_genero, $altura, $peso);
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

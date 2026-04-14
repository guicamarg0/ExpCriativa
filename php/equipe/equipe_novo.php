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

    $nome = isset($_POST['nome']) ? $_POST['nome'] : '';
    $descricao = isset($_POST['descricao']) ? $_POST['descricao'] : '';
    $id_modalidade = isset($_POST['id_modalidade']) ? $_POST['id_modalidade'] : '';
    $id_genero = isset($_POST['id_genero']) ? $_POST['id_genero'] : '';
    $categoria = isset($_POST['categoria']) ? $_POST['categoria'] : '';
    $status = 'ativa';
    $id_treinador_responsavel = isset($_POST['id_treinador_responsavel']) ? $_POST['id_treinador_responsavel'] : '';

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

    if($id_treinador_responsavel !== '' && !ctype_digit($id_treinador_responsavel)){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Treinador responsavel invalido.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    if($id_modalidade !== '' && !ctype_digit($id_modalidade)){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Modalidade invalida.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    if($id_genero !== '' && !ctype_digit($id_genero)){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Genero invalido.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    $stmt = $conexao->prepare(
        "INSERT INTO equipes (
            nome,
            descricao,
            id_modalidade,
            id_genero,
            categoria,
            status,
            id_treinador_responsavel
        ) VALUES(?, ?, NULLIF(?, ''), NULLIF(?, ''), ?, ?, NULLIF(?, ''))"
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

    $stmt->bind_param(
        "sssssss",
        $nome,
        $descricao,
        $id_modalidade,
        $id_genero,
        $categoria,
        $status,
        $id_treinador_responsavel
    );
    $stmt->execute();

    if($stmt->affected_rows > 0){
        $retorno = [
            'status' => 'ok',
            'mensagem' => 'Equipe cadastrada com sucesso',
            'data' => [
                'id' => $stmt->insert_id
            ]
        ];
    }else{
        $retorno = [
            'status' => 'nok',
            'mensagem' => 'Falha ao inserir equipe',
            'data' => []
        ];
    }

    $stmt->close();
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);

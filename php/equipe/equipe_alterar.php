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
    $nome = isset($_POST['nome']) ? $_POST['nome'] : '';
    $descricao = isset($_POST['descricao']) ? $_POST['descricao'] : '';
    $id_modalidade = isset($_POST['id_modalidade']) ? $_POST['id_modalidade'] : '';
    $id_genero = isset($_POST['id_genero']) ? $_POST['id_genero'] : '';
    $categoria = isset($_POST['categoria']) ? $_POST['categoria'] : '';
    $status = isset($_POST['status']) && $_POST['status'] !== '' ? $_POST['status'] : 'ativa';
    $id_treinador_responsavel = isset($_POST['id_treinador_responsavel']) ? $_POST['id_treinador_responsavel'] : '';

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

    $stmtValidaEquipe = $conexao->prepare(
        "SELECT id FROM equipes WHERE id = ? LIMIT 1"
    );

    if(!$stmtValidaEquipe){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Erro ao preparar validacao de equipe.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    $stmtValidaEquipe->bind_param("i", $id);
    $stmtValidaEquipe->execute();
    $resultadoEquipe = $stmtValidaEquipe->get_result();
    $stmtValidaEquipe->close();

    if($resultadoEquipe->num_rows === 0){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Equipe nao encontrada.',
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
        "UPDATE equipes SET
            nome = ?,
            descricao = ?,
            id_modalidade = NULLIF(?, ''),
            id_genero = NULLIF(?, ''),
            categoria = ?,
            status = ?,
            id_treinador_responsavel = NULLIF(?, '')
        WHERE id = ?"
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

    $stmt->bind_param(
        "sssssssi",
        $nome,
        $descricao,
        $id_modalidade,
        $id_genero,
        $categoria,
        $status,
        $id_treinador_responsavel,
        $id
    );
    $stmt->execute();

    if($stmt->errno === 0){
        $retorno = [
            'status'    => 'ok',
            'mensagem'  => 'Equipe alterada com sucesso.',
            'data'      => []
        ];
    }else{
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Nao foi possivel alterar a equipe.',
            'data'      => []
        ];
    }

    $stmt->close();
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);

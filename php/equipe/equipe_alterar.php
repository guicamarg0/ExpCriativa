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
    $descricao = isset($_POST['descricao']) ? trim($_POST['descricao']) : '';
    $id_modalidade = isset($_POST['id_modalidade']) && $_POST['id_modalidade'] !== '' ? (int) $_POST['id_modalidade'] : null;
    $id_genero = isset($_POST['id_genero']) && $_POST['id_genero'] !== '' ? (int) $_POST['id_genero'] : null;
    $categoria = isset($_POST['categoria']) ? trim($_POST['categoria']) : '';
    $status = isset($_POST['status']) && $_POST['status'] !== '' ? trim($_POST['status']) : 'ativa';
    $id_treinador_responsavel = isset($_POST['id_treinador_responsavel']) ? trim($_POST['id_treinador_responsavel']) : '';

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

    if($id_treinador_responsavel !== ''){
        $idTreinador = (int) $id_treinador_responsavel;
        $stmtValidaTreinador = $conexao->prepare(
            "SELECT id FROM treinadores WHERE id = ? AND status = 'ativo' LIMIT 1"
        );

        if(!$stmtValidaTreinador){
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Erro ao preparar validacao de treinador.',
                'data'      => []
            ];

            header("Content-type:application/json;charset:utf-8");
            echo json_encode($retorno);
            exit;
        }

        $stmtValidaTreinador->bind_param("i", $idTreinador);
        $stmtValidaTreinador->execute();
        $resultadoTreinador = $stmtValidaTreinador->get_result();
        $stmtValidaTreinador->close();

        if($resultadoTreinador->num_rows === 0){
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Selecione um treinador ativo valido.',
                'data'      => []
            ];

            header("Content-type:application/json;charset:utf-8");
            echo json_encode($retorno);
            exit;
        }
    }

    $stmt = $conexao->prepare(
        "UPDATE equipes SET
            nome = ?,
            descricao = ?,
            id_modalidade = ?,
            id_genero = ?,
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
        "ssiisssi",
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

    if($stmt->affected_rows > 0){
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

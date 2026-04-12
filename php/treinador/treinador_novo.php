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
    $data_nascimento = isset($_POST['data_nascimento']) ? trim($_POST['data_nascimento']) : '';
    $telefone = isset($_POST['telefone']) ? trim($_POST['telefone']) : '';
    $cref = isset($_POST['cref']) ? trim($_POST['cref']) : '';
    $data_inicio = isset($_POST['data_inicio']) ? trim($_POST['data_inicio']) : '';
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $senha = isset($_POST['senha']) ? trim($_POST['senha']) : '';
    $status = isset($_POST['status']) ? strtolower(trim($_POST['status'])) : 'ativo';

    if($status !== 'ativo' && $status !== 'inativo'){
        $status = 'ativo';
    }

    if($nome === '' || $cref === '' || $email === '' || $senha === ''){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Nome, CREF, e-mail e senha são obrigatórios.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    $stmtUsuario = $conexao->prepare(
        "INSERT INTO usuarios (email, senha, id_nivel, status) VALUES (?, ?, 2, ?)"
    );

    if(!$stmtUsuario){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Erro ao preparar cadastro de usuário.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    $stmtTreinador = $conexao->prepare(
        "INSERT INTO treinadores (
            id_usuario,
            nome,
            cref,
            telefone,
            data_nascimento,
            data_inicio,
            status
        ) VALUES (
            ?,
            ?,
            ?,
            ?,
            NULLIF(?, ''),
            NULLIF(?, ''),
            ?
        )"
    );

    if(!$stmtTreinador){
        $stmtUsuario->close();

        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Erro ao preparar cadastro de treinador.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    $conexao->begin_transaction();
    $mensagemErro = '';
    $idUsuario = 0;

    $stmtUsuario->bind_param("sss", $email, $senha, $status);
    if(!$stmtUsuario->execute()){
        if($conexao->errno === 1062){
            $mensagemErro = 'E-mail já cadastrado.';
        }else{
            $mensagemErro = 'Falha ao cadastrar credenciais do usuário.';
        }
    }else{
        $idUsuario = (int) $stmtUsuario->insert_id;

        $stmtTreinador->bind_param(
            "issssss",
            $idUsuario,
            $nome,
            $cref,
            $telefone,
            $data_nascimento,
            $data_inicio,
            $status
        );

        if(!$stmtTreinador->execute()){
            if($conexao->errno === 1062){
                $mensagemErro = 'CREF já cadastrado.';
            }else{
                $mensagemErro = 'Falha ao cadastrar treinador.';
            }
        }
    }

    if($mensagemErro !== ''){
        $conexao->rollback();
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => $mensagemErro,
            'data'      => []
        ];
    }else{
        $conexao->commit();
        $retorno = [
            'status'    => 'ok',
            'mensagem'  => 'Treinador cadastrado com sucesso.',
            'data'      => [
                'id' => $stmtTreinador->insert_id,
                'id_usuario' => $idUsuario
            ]
        ];
    }

    $stmtTreinador->close();
    $stmtUsuario->close();
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);

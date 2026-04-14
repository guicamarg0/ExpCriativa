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
    $data_nascimento = isset($_POST['data_nascimento']) ? $_POST['data_nascimento'] : '';
    $id_genero = isset($_POST['id_genero']) ? $_POST['id_genero'] : '';
    $altura = isset($_POST['altura']) ? $_POST['altura'] : '';
    $peso = isset($_POST['peso']) ? $_POST['peso'] : '';
    $email = isset($_POST['email']) ? $_POST['email'] : '';
    $senha = isset($_POST['senha']) ? $_POST['senha'] : '';
    $status = 'ativo';

    if($nome === '' || $email === '' || $senha === ''){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Nome, e-mail e senha são obrigatórios.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    if($id_genero !== '' && !ctype_digit($id_genero)){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Gênero inválido.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    if($altura !== '' && !is_numeric($altura)){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Altura inválida.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    if($peso !== '' && !is_numeric($peso)){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Peso inválido.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    if($id_genero !== ''){
        $idGeneroValidacao = (int) $id_genero;
        $stmtGenero = $conexao->prepare(
            "SELECT id
             FROM genero
             WHERE id = ?
               AND status = 'ativo'
               AND LOWER(nome) IN ('feminino', 'masculino')
             LIMIT 1"
        );

        if(!$stmtGenero){
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Erro ao validar gênero.',
                'data'      => []
            ];

            header("Content-type:application/json;charset:utf-8");
            echo json_encode($retorno);
            exit;
        }

        $stmtGenero->bind_param("i", $idGeneroValidacao);
        $stmtGenero->execute();
        $resultadoGenero = $stmtGenero->get_result();
        $stmtGenero->close();

        if($resultadoGenero->num_rows === 0){
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Selecione Feminino ou Masculino válidos.',
                'data'      => []
            ];

            header("Content-type:application/json;charset:utf-8");
            echo json_encode($retorno);
            exit;
        }
    }

    $stmtUsuario = $conexao->prepare(
        "INSERT INTO usuarios (email, senha, id_nivel, status) VALUES (?, ?, 3, ?)"
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

    $stmtAtleta = $conexao->prepare(
        "INSERT INTO atletas (
            id_usuario,
            nome,
            data_nascimento,
            id_genero,
            altura,
            peso,
            status
        ) VALUES (
            ?,
            ?,
            NULLIF(?, ''),
            NULLIF(?, ''),
            NULLIF(?, ''),
            NULLIF(?, ''),
            ?
        )"
    );

    if(!$stmtAtleta){
        $stmtUsuario->close();

        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Erro ao preparar cadastro de atleta.',
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

        $stmtAtleta->bind_param(
            "issssss",
            $idUsuario,
            $nome,
            $data_nascimento,
            $id_genero,
            $altura,
            $peso,
            $status
        );

        if(!$stmtAtleta->execute()){
            $mensagemErro = 'Falha ao cadastrar atleta.';
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
            'mensagem'  => 'Atleta cadastrado com sucesso.',
            'data'      => [
                'id' => $stmtAtleta->insert_id,
                'id_usuario' => $idUsuario
            ]
        ];
    }

    $stmtAtleta->close();
    $stmtUsuario->close();
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);

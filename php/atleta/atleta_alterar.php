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
    $data_nascimento = isset($_POST['data_nascimento']) ? $_POST['data_nascimento'] : '';
    $id_genero = isset($_POST['id_genero']) ? $_POST['id_genero'] : '';
    $altura = isset($_POST['altura']) ? $_POST['altura'] : '';
    $peso = isset($_POST['peso']) ? $_POST['peso'] : '';
    $status = isset($_POST['status']) ? strtolower($_POST['status']) : 'ativo';

    if($status !== 'ativo' && $status !== 'inativo'){
        $status = 'ativo';
    }

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

    $stmtBusca = $conexao->prepare("SELECT id_usuario FROM atletas WHERE id = ?");
    if(!$stmtBusca){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Erro ao preparar busca do atleta.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    $stmtBusca->bind_param("i", $id);
    $stmtBusca->execute();
    $resultadoBusca = $stmtBusca->get_result();

    if($resultadoBusca->num_rows === 0){
        $stmtBusca->close();
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Atleta não encontrado.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    $atletaAtual = $resultadoBusca->fetch_assoc();
    $idUsuario = (int) $atletaAtual['id_usuario'];
    $stmtBusca->close();

    $stmt = $conexao->prepare(
        "UPDATE atletas SET
            nome = ?,
            data_nascimento = NULLIF(?, ''),
            id_genero = NULLIF(?, ''),
            altura = NULLIF(?, ''),
            peso = NULLIF(?, ''),
            status = ?
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

    $stmtUsuario = null;
    if($idUsuario > 0){
        $stmtUsuario = $conexao->prepare("UPDATE usuarios SET status = ? WHERE id = ?");
        if(!$stmtUsuario){
            $stmt->close();
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Erro ao preparar alteracao do usuario vinculado.',
                'data'      => []
            ];

            header("Content-type:application/json;charset:utf-8");
            echo json_encode($retorno);
            exit;
        }
    }

    $conexao->begin_transaction();
    $mensagemErro = '';

    $stmt->bind_param("ssssssi", $nome, $data_nascimento, $id_genero, $altura, $peso, $status, $id);
    if(!$stmt->execute()){
        $mensagemErro = 'Nao foi possivel alterar o cadastro do atleta.';
    }elseif($stmtUsuario){
        $stmtUsuario->bind_param("si", $status, $idUsuario);
        if(!$stmtUsuario->execute()){
            $mensagemErro = 'Falha ao atualizar status do usuario vinculado.';
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
            'mensagem'  => $stmt->affected_rows > 0 ? 'Cadastro do atleta alterado com sucesso.' : 'Nenhuma alteracao realizada.',
            'data'      => []
        ];
    }

    $stmt->close();
    if($stmtUsuario){
        $stmtUsuario->close();
    }
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);

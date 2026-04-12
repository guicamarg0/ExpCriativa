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

    if(!isset($_GET['id'])){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'E necessario informar um ID para exclusao.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    $id = (int) $_GET['id'];
    if($id <= 0){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'ID invalido.',
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
            'mensagem'  => 'Atleta nao encontrado.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    $atletaAtual = $resultadoBusca->fetch_assoc();
    $idUsuario = (int) $atletaAtual['id_usuario'];
    $stmtBusca->close();

    $stmtExcluiAtleta = $conexao->prepare("DELETE FROM atletas WHERE id = ?");
    if(!$stmtExcluiAtleta){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Erro ao preparar exclusao do atleta.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    $stmtExcluiUsuario = null;
    if($idUsuario > 0){
        $stmtExcluiUsuario = $conexao->prepare("DELETE FROM usuarios WHERE id = ?");
        if(!$stmtExcluiUsuario){
            $stmtExcluiAtleta->close();
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Erro ao preparar exclusao do usuario vinculado.',
                'data'      => []
            ];

            header("Content-type:application/json;charset:utf-8");
            echo json_encode($retorno);
            exit;
        }
    }

    $conexao->begin_transaction();
    $mensagemErro = '';

    $stmtExcluiAtleta->bind_param("i", $id);
    if(!$stmtExcluiAtleta->execute() || $stmtExcluiAtleta->affected_rows <= 0){
        $mensagemErro = 'Atleta nao excluido.';
    }elseif($stmtExcluiUsuario){
        $stmtExcluiUsuario->bind_param("i", $idUsuario);
        if(!$stmtExcluiUsuario->execute()){
            $mensagemErro = 'Falha ao excluir usuario vinculado.';
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
            'mensagem'  => 'Atleta excluido com sucesso.',
            'data'      => []
        ];
    }

    $stmtExcluiAtleta->close();
    if($stmtExcluiUsuario){
        $stmtExcluiUsuario->close();
    }
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);

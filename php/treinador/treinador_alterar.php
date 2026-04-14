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
    $telefone = isset($_POST['telefone']) ? $_POST['telefone'] : '';
    $cref = isset($_POST['cref']) ? $_POST['cref'] : '';
    $data_inicio = isset($_POST['data_inicio']) ? $_POST['data_inicio'] : '';
    $email = isset($_POST['email']) ? $_POST['email'] : '';
    $senha = isset($_POST['senha']) ? $_POST['senha'] : '';
    $status = isset($_POST['status']) ? strtolower($_POST['status']) : 'ativo';

    if($id <= 0){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'ID obrigatório.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    if($status !== 'ativo' && $status !== 'inativo'){
        $status = 'ativo';
    }

    if($nome === '' || $cref === '' || $email === ''){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Nome, CREF e e-mail são obrigatórios.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    $stmtBusca = $conexao->prepare("SELECT id_usuario FROM treinadores WHERE id = ?");
    if(!$stmtBusca){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Erro ao preparar busca do treinador.',
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
            'mensagem'  => 'Treinador não encontrado.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    $treinadorAtual = $resultadoBusca->fetch_assoc();
    $idUsuario = (int) $treinadorAtual['id_usuario'];
    $stmtBusca->close();

    if($idUsuario <= 0){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Treinador sem usuário vinculado.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    if($senha !== ''){
        $stmtUsuario = $conexao->prepare(
            "UPDATE usuarios SET email = ?, senha = ?, status = ? WHERE id = ?"
        );
    }else{
        $stmtUsuario = $conexao->prepare(
            "UPDATE usuarios SET email = ?, status = ? WHERE id = ?"
        );
    }

    if(!$stmtUsuario){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Erro ao preparar atualização do usuário.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    $stmtTreinador = $conexao->prepare(
        "UPDATE treinadores SET
            nome = ?,
            cref = ?,
            telefone = ?,
            data_nascimento = NULLIF(?, ''),
            data_inicio = NULLIF(?, ''),
            status = ?
        WHERE id = ?"
    );

    if(!$stmtTreinador){
        $stmtUsuario->close();
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Erro ao preparar atualização do treinador.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    $conexao->begin_transaction();
    $mensagemErro = '';

    if($senha !== ''){
        $stmtUsuario->bind_param("sssi", $email, $senha, $status, $idUsuario);
    }else{
        $stmtUsuario->bind_param("ssi", $email, $status, $idUsuario);
    }

    if(!$stmtUsuario->execute()){
        if($conexao->errno === 1062){
            $mensagemErro = 'E-mail já cadastrado.';
        }else{
            $mensagemErro = 'Falha ao atualizar usuário.';
        }
    }else{
        $stmtTreinador->bind_param(
            "ssssssi",
            $nome,
            $cref,
            $telefone,
            $data_nascimento,
            $data_inicio,
            $status,
            $id
        );

        if(!$stmtTreinador->execute()){
            if($conexao->errno === 1062){
                $mensagemErro = 'CREF já cadastrado.';
            }else{
                $mensagemErro = 'Falha ao atualizar treinador.';
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
            'mensagem'  => 'Treinador alterado com sucesso.',
            'data'      => []
        ];
    }

    $stmtTreinador->close();
    $stmtUsuario->close();
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);

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

    // Validação do ID
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

    // Normaliza status
    if($status !== 'ativo' && $status !== 'inativo'){
        $status = 'ativo';
    }

    // Validação básica obrigatória
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

    // Busca treinador e usuário vinculado
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

    // Atualiza usuário
    if($senha !== ''){
        // ✔ senha informada
        $stmtUsuario = $conexao->prepare(
            "UPDATE usuarios SET email = ?, senha = ?, status = ? WHERE id = ?"
        );
        if(!$stmtUsuario){
            exit;
        }
        // TIPAGEM CORRETA (4 parâmetros)
        $stmtUsuario->bind_param("sssi", $email, $senha, $status, $idUsuario);
    }else{
        // ✔ sem alterar senha
        $stmtUsuario = $conexao->prepare(
            "UPDATE usuarios SET email = ?, status = ? WHERE id = ?"
        );
        if(!$stmtUsuario){
            exit;
        }
        // TIPAGEM CORRETA (3 parâmetros)
        $stmtUsuario->bind_param("ssi", $email, $status, $idUsuario);
    }

    // Atualiza treinador
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
        exit;
    }

    $conexao->begin_transaction();
    $mensagemErro = '';

    // EXECUTA USUÁRIO
    if(!$stmtUsuario->execute()){
        $mensagemErro = 'Falha ao atualizar usuário.';
    }else{
        // EXECUTA TREINADOR
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
            $mensagemErro = 'Falha ao atualizar treinador.';
        }
    }

    // COMMIT OU ROLLBACK
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
?>
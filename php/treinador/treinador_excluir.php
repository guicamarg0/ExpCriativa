<?php
    include_once('../conexao.php');
    // Estrutura padrão de retorno da API
    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    // Verifica conexão com o banco
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

    // Recebe ID do treinador via POST ou GET (mantendo flexível)
    $id = isset($_POST['id']) ? (int) $_POST['id'] : (isset($_GET['id']) ? (int) $_GET['id'] : 0);

    // Validação do ID
    if($id <= 0){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'ID do treinador obrigatório.',
            'data'      => []
        ];
        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    // Primeiro: busca o id_usuario vinculado (para evitar exclusão inconsistente)
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
    $resultado = $stmtBusca->get_result();

    if($resultado->num_rows === 0){
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

    $dados = $resultado->fetch_assoc();
    $stmtBusca->close();
    // Inicia transação (remove usuário e treinador juntos)
    $conexao->begin_transaction();
    $erro = '';
    // 1 - Exclui treinador
    $stmtTreinador = $conexao->prepare("DELETE FROM treinadores WHERE id = ?");
    if(!$stmtTreinador){
        $erro = 'Erro ao preparar exclusão do treinador.';
    } else {
        $stmtTreinador->bind_param("i", $id);

        if(!$stmtTreinador->execute()){
            $erro = 'Falha ao excluir treinador.';
        }
    }

    // 2 - Exclui usuário vinculado (IMPORTANTE)
    if($erro === ''){
        $idUsuario = (int) $dados['id_usuario'];
        if($idUsuario > 0){
            $stmtUsuario = $conexao->prepare("DELETE FROM usuarios WHERE id = ?");
            if(!$stmtUsuario){
                $erro = 'Erro ao preparar exclusão do usuário.';
            } else {
                $stmtUsuario->bind_param("i", $idUsuario);

                if(!$stmtUsuario->execute()){
                    $erro = 'Falha ao excluir usuário vinculado.';
                }
                $stmtUsuario->close();
            }
        }
    }

    // Commit ou rollback
    if($erro !== ''){
        $conexao->rollback();

        $retorno = [
            'status'    => 'nok',
            'mensagem'  => $erro,
            'data'      => []
        ];
    } else {
        $conexao->commit();
        $retorno = [
            'status'    => 'ok',
            'mensagem'  => 'Treinador excluído com sucesso.',
            'data'      => []
        ];
    }

    // Fecha recursos
    if(isset($stmtTreinador)){
        $stmtTreinador->close();
    }
    $conexao->close();

    // Retorno JSON padrão
    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
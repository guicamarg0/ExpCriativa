<?php
    header("Content-type:application/json;charset:utf-8");
    include_once('../conexao.php');
    include_once('../permissao.php');
    exigir_admin_ou_treinador();
    // Configurando o padrão de retorno em todas
    // as situações
    $retorno = [
        'status'    => '', // ok - nok
        'mensagem'  => '', // mensagem que envio para o front
        'data'      => []
    ];

    if(isset($_GET['id'])){
        if (!treino_permitido($conexao, (int) $_GET['id'])) {
            responder_sem_permissao();
        }
        // Segunda situação - RECEBENDO O ID por GET
        $stmt = $conexao->prepare("DELETE FROM treinos WHERE id = ?");
        $stmt->bind_param("i",$_GET['id']);
        $stmt->execute();

        if($stmt->affected_rows > 0){
            $retorno = [
                'status'    => 'ok', // ok - nok
                'mensagem'  => 'Registro excluido', // mensagem que envio para o front
                'data'      => []
            ];
        }else{
            $retorno = [
                'status'    => 'nok', // ok - nok
                'mensagem'  => 'Registro não foi excluido', // mensagem que envio para o front
                'data'      => []
            ];
        }
        $stmt->close();
    }else{
        // Configurando o padrão de retorno em todas
        // as situações
        $retorno = [
            'status'    => 'nok', // ok - nok
            'mensagem'  => 'É necessário informar um id para exclusão', // mensagem que envio para o front
            'data'      => []
        ];
    }
    $conexao->close();

    echo json_encode($retorno);

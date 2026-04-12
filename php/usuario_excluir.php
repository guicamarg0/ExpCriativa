<?php
    include_once('../conexao.php');
    // Configurando o padrão de retorno em todas
    // as situações
    $retorno = [
        'status'    => '', // ok - nok
        'mensagem'  => '', // mensagem que envio para o front
        'data'      => []
    ];

    if(isset($_GET['id'])){
        // Segunda situação - RECEBENDO O ID por GET
<<<<<<<< HEAD:php/esportes/esportes_excluir.php
        $stmt = $conexao->prepare("DELETE FROM modalidades WHERE id = ?");
========
        $stmt = $conexao->prepare("DELETE FROM usuario WHERE id = ?");
>>>>>>>> 98daac1f06bce6814783b8d304e869b2fb3385df:php/usuario_excluir.php
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

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
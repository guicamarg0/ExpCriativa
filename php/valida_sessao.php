<?php
    session_start();
    
    // Verifica se a sessão 'email' existe
    if(isset($_SESSION['email'])){
        
        // Pega os dados do usuário que foram salvos no login
        $dados_usuario_tabela = $_SESSION['email']; 
        
        // Pega o id do usuário (assumindo que está no primeiro registro)
        $id_do_usuario = $dados_usuario_tabela[0]['id'];
        
        $retorno = [
            'status'    => 'ok',
            'mensagem'  => 'Sessão válida.',
            'id'       => $id_do_usuario // <-- ENVIA O ID DE VOLTA
        ];

    }else{
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Sessão inválida.'
        ];
    }
    
    // Corrija o header (remova o ';' extra no final)
    header("Content-type: application/json; charset=utf-8");
    echo json_encode($retorno);
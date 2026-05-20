<?php
    header("Content-type:application/json;charset:utf-8");
    include_once('../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    if(isset($_GET['id'])){
        // Simulando as informações que vem do front
        $modalidade = $_POST['modalidade']; 
        $data       = $_POST['data'];
        $detalhes   = $_POST['detalhes'];
    
        // Preparando para inserção no banco de dados
        $stmt = $conexao->prepare("UPDATE treinos SET modalidade = ?,  data = ?, detalhes = ? WHERE id = ?");
        $stmt->bind_param("sssi",$modalidade, $data, $detalhes, $_GET['id']);
        $stmt->execute();

        if($stmt->affected_rows >= 0){
            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Registro alterado com sucesso.',
                'data'      => []
            ];
        }else{
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Não consegui alterar o registro.'.json_encode($_GET),
                'data'      => []
            ];
        }
        $stmt->close();
    }else{
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Não posso alterar um registro sem um ID informado.',
            'data'      => []
        ];
    }
       
    $conexao->close();

    echo json_encode($retorno);
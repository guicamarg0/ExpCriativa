<?php
    include_once('../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    if(isset($_GET['id'])){
        // Simulando as informações que vem do front
        $nome        = $_POST['nome']; 
        $status      = $_POST['status'];
    
        // Preparando para inserção no banco de dados
<<<<<<<< HEAD:php/esportes/esportes_alterar.php
        $stmt = $conexao->prepare("UPDATE modalidades SET nome = ?,  status = ? WHERE id = ?");
        $stmt->bind_param("ssi",$nome, $status, $_GET['id']);
========
        $stmt = $conexao->prepare("UPDATE usuario SET nome = ?, email = ?, usuario = ?, senha = ?, ativo = ? WHERE id = ?");
        $stmt->bind_param("ssssii",$nome, $email, $usuario, $senha, $ativo, $_GET['id']);
>>>>>>>> 98daac1f06bce6814783b8d304e869b2fb3385df:php/usuario_alterar.php
        $stmt->execute();

        if($stmt->affected_rows > 0){
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

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
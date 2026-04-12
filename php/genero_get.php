<?php
    include_once('conexao.php');

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

    $statusFiltro = isset($_GET['status']) ? strtolower(trim($_GET['status'])) : 'ativo';
    $filtrarStatus = true;
    $statusBanco = 'ativo';

    if($statusFiltro === 'todos'){
        $filtrarStatus = false;
    }elseif($statusFiltro === 'inativo'){
        $statusBanco = 'inativo';
    }

    if($filtrarStatus){
        $stmt = $conexao->prepare(
            "SELECT id, nome, status
             FROM genero
             WHERE status = ?
             ORDER BY nome ASC"
        );
        $stmt->bind_param("s", $statusBanco);
    }else{
        $stmt = $conexao->prepare(
            "SELECT id, nome, status
             FROM genero
             ORDER BY nome ASC"
        );
    }

    if(!$stmt){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Erro ao preparar consulta.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    $stmt->execute();
    $resultado = $stmt->get_result();
    $tabela = [];

    if($resultado->num_rows > 0){
        while($linha = $resultado->fetch_assoc()){
            $tabela[] = $linha;
        }

        $retorno = [
            'status'    => 'ok',
            'mensagem'  => 'Sucesso, consulta efetuada.',
            'data'      => $tabela
        ];
    }else{
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Não há registros',
            'data'      => []
        ];
    }

    $stmt->close();
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);

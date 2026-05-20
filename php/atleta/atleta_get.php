<?php
    header("Content-Type: application/json; charset=utf-8");
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

    if(isset($_GET['id'])){
        $stmt = $conexao->prepare(
            "SELECT
                atletas.id,
                atletas.nome,
                atletas.data_nascimento,
                atletas.id_genero,
                atletas.altura,
                atletas.peso,
                genero.nome AS nome_genero
            FROM atletas
            LEFT JOIN genero ON genero.id = atletas.id_genero
            WHERE atletas.id = ?"
        );
        $stmt->bind_param("i",$_GET['id']);
    }else{
        $stmt = $conexao->prepare(
            "SELECT
                atletas.id,
                atletas.nome,
                atletas.data_nascimento,
                atletas.id_genero,
                atletas.altura,
                atletas.peso,
                genero.nome AS nome_genero
            FROM atletas
            LEFT JOIN genero ON genero.id = atletas.id_genero"
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
            'status'    => 'ok', // ok - nok
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

    echo json_encode($retorno);
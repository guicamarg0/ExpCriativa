<?php
    include_once('../conexao.php');
    // Configurando o padrão de retorno em todas
    // as situações
    $retorno = [
        'status'    => '', // ok - nok
        'mensagem'  => '', // mensagem que envio para o front
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
        // Segunda situação - RECEBENDO O ID por GET
        $stmt = $conexao->prepare(
            "SELECT
                equipes.id,
                equipes.nome,
                equipes.descricao,
                equipes.id_modalidade,
                equipes.id_genero,
                equipes.status,
                equipes.categoria,
                genero.nome AS genero,
                modalidades.nome AS modalidade,
                (SELECT COUNT(*) FROM atletas WHERE atletas.id_equipe = equipes.id) AS integrantes
            FROM equipes
            LEFT JOIN modalidades ON modalidades.id = equipes.id_modalidade
            LEFT JOIN genero ON genero.id = equipes.id_genero
            WHERE equipes.id = ?"
        );
        $stmt->bind_param("i",$_GET['id']);
    }else{
        // Primeira situação - SEM RECEBER O ID por GET
        $stmt = $conexao->prepare(
            "SELECT
                equipes.id,
                equipes.nome,
                equipes.descricao,
                equipes.id_modalidade,
                equipes.id_genero,
                equipes.status,
                equipes.categoria,
                genero.nome AS genero,
                modalidades.nome AS modalidade,
                (SELECT COUNT(*) FROM atletas WHERE atletas.id_equipe = equipes.id) AS integrantes
            FROM equipes
            LEFT JOIN modalidades ON modalidades.id = equipes.id_modalidade
            LEFT JOIN genero ON genero.id = equipes.id_genero"
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
    
    // Recuperando informações do banco de dados
    // Vou executar a query
    $stmt->execute();
    $resultado = $stmt->get_result();
    // Criando um array vazio para receber o resultado
    // do banco de Dados
    $tabela = [];
    if($resultado->num_rows > 0){
        while($linha = $resultado->fetch_assoc()){
            $tabela[] = $linha;
        }

        $retorno = [
            'status'    => 'ok', // ok - nok
            'mensagem'  => 'Sucesso, consulta efetuada.', // mensagem que envio para o front
            'data'      => $tabela
        ];
    }else{
        $retorno = [
            'status'    => 'nok', // ok - nok
            'mensagem'  => 'Não há registros', // mensagem que envio para o front
            'data'      => []
        ];
    }
    // Fechamento do estado e conexão.
    $stmt->close();
    $conexao->close();

    // Estou enviando para o FRONT o array RETORNO
    // mas no formato JSON
    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
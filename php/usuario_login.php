<?php
    include_once('../php/conexao.php');
    // Configurando o padrão de retorno em todas
    // as situações
    $retorno = [
        'status'    => '', // ok - nok
        'mensagem'  => '', // mensagem que envio para o front
        'data'      => []
    ];

    $stmt = $conexao->prepare("
    SELECT usuarios.*, treinadores.id AS id_treinador 
    FROM usuarios 
    LEFT JOIN treinadores ON treinadores.id_usuario = usuarios.id
    WHERE usuarios.email = ? AND usuarios.senha = ?
    ");
    $stmt->bind_param("ss",$_POST['email'],$_POST['senha']);
    
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

        // Se for atleta (id_nivel = 3), busca o id da tabela atletas
        // e adiciona nos dados da sessão
        if((int)$tabela[0]['id_nivel'] === 3){
            $stmt2 = $conexao->prepare("SELECT id FROM atletas WHERE id_usuario = ?");
            $stmt2->bind_param("i", $tabela[0]['id']);
            $stmt2->execute();
            $resultado2 = $stmt2->get_result();
            if($resultado2->num_rows > 0){
                $atleta = $resultado2->fetch_assoc();
                $tabela[0]['id_atleta'] = $atleta['id']; // adiciona id_atleta nos dados
            }
            $stmt2->close();
        }

        session_start();
        $_SESSION['email'] = $tabela; // mantém o padrão do projeto

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
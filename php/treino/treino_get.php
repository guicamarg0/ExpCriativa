<?php
    header("Content-type:application/json;charset:utf-8");
    include_once('../conexao.php');
    session_start();
    // Configurando o padrão de retorno
    $retorno = [
        'status'   => '', // ok - nok
        'mensagem' => '', // mensagem que envio para o front
        'data'     => []
    ];

    // Recuperando os dados do usuário logado da sessão
    $dados_sessao = isset($_SESSION['email']) ? $_SESSION['email'] : null;
    $id_nivel     = isset($dados_sessao[0]['id_nivel'])  ? (int)$dados_sessao[0]['id_nivel']  : 0;
    $id_atleta_sessao = isset($dados_sessao[0]['id_atleta']) ? (int)$dados_sessao[0]['id_atleta'] : 0;

    // CONTROLE DE ACESSO:
    // Se o usuário logado for atleta (id_nivel = 3),
    // ignoramos qualquer id_atleta que venha pela URL
    // e usamos sempre o id_atleta salvo na sessão.
    // Isso impede que um atleta veja os treinos de outro alterando a URL.
    if($id_nivel === 3){
        $_GET['id_atleta'] = $id_atleta_sessao;
    }

    if(isset($_GET['id'])){
        // Busca um treino específico pelo id do treino
        $stmt = $conexao->prepare("
            SELECT treinos.*, treinadores.nome AS nome_treinador,
                GROUP_CONCAT(treino_exercicios.exercicio_id) AS exercicio_ids
            FROM treinos
            LEFT JOIN treinadores ON treinadores.id = treinos.id_treinador
            LEFT JOIN treino_exercicios ON treino_exercicios.treino_id = treinos.id
            WHERE treinos.id = ?
            GROUP BY treinos.id
        ");
        $stmt->bind_param("i", $_GET['id']);
    }

    elseif(isset($_GET['id_atleta'])){ // se veio um id pela url
        // RECEBENDO O ID por GET
        $stmt = $conexao->prepare("
            SELECT treinos.*, treinadores.nome AS nome_treinador 
            FROM treinos
            LEFT JOIN treinadores ON treinadores.id = treinos.id_treinador
            WHERE treinos.id_atleta = ?
        ");
        $stmt->bind_param("i", $_GET['id_atleta']);
    }
    else{
        // Sem filtro - Admin e Treinador veem todos os treinos
        $stmt = $conexao->prepare("
            SELECT treinos.*, treinadores.nome AS nome_treinador
            FROM treinos
            LEFT JOIN treinadores ON treinadores.id = treinos.id_treinador
        ");
    }

    // Executando a query
    $stmt->execute();
    $resultado = $stmt->get_result();
    // Criando um array vazio para receber o resultado do bd
    $tabela = [];

    if($resultado->num_rows > 0){
        while($linha = $resultado->fetch_assoc()){
            $tabela[] = $linha;
        }

        $retorno = [
            'status'   => 'ok',
            'mensagem' => 'Sucesso, consulta efetuada no bd.', // mensagem que envio para o front
            'data'     => $tabela
        ];
    }
    else{
        $retorno = [
            'status'   => 'nok',
            'mensagem' => 'Não há registros no bd', // mensagem que envio para o front
            'data'     => []
        ];
    }
    // Fechamento do estado e conexão.
    $stmt->close();
    $conexao->close();

    // Estou enviando para o frontend o array RETORNO
    // mas no formato JSON
    echo json_encode($retorno);
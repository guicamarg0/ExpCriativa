<?php
    header("Content-type:application/json;charset:utf-8");
    include_once('../conexao.php');
    // Estrutura padrão de retorno da API
    $retorno = [
        'status' => '',    
        'mensagem' => '',   
        'data' => []       
    ];

    // Query base (consulta principal dos treinos)
    // JOIN com treinadores e atletas para trazer nomes
    $sql_base = "
        SELECT
            treinos.*,
            treinadores.nome AS nome_treinador,
            atletas.nome AS nome_atleta
        FROM treinos
        LEFT JOIN treinadores ON treinadores.id = treinos.id_treinador
        LEFT JOIN atletas ON atletas.id = treinos.id_atleta
    ";

    // FILTROS DA CONSULTA (API)
    if (isset($_GET['id'])) {
        //Busca um treino específico pelo ID
        $stmt = $conexao->prepare($sql_base . " WHERE treinos.id = ?");
        $stmt->bind_param("i", $_GET['id']);

    } elseif (isset($_GET['id_atleta'])) {
        //Busca todos os treinos de um atleta
        $stmt = $conexao->prepare(
            $sql_base . " WHERE treinos.id_atleta = ? ORDER BY treinos.data DESC"
        );
        $stmt->bind_param("i", $_GET['id_atleta']);

    } elseif (isset($_GET['id_treinador'])) {
        //Busca todos os treinos de um treinador específico
        $stmt = $conexao->prepare(
            $sql_base . " WHERE treinos.id_treinador = ? ORDER BY treinos.data DESC"
        );
        $stmt->bind_param("i", $_GET['id_treinador']);

    } else {
        //Lista todos os treinos (admin geral)
        $stmt = $conexao->prepare(
            $sql_base . " ORDER BY treinos.id_treinador, treinos.data DESC"
        );
    }

    // Executa a query preparada
    $stmt->execute();
    // Pega o resultado do banco
    $resultado = $stmt->get_result();
    // Array onde serão armazenados os dados
    $tabela = [];
    // Se encontrou registros
    if ($resultado->num_rows > 0) {
        // Percorre todas as linhas do banco
        while ($linha = $resultado->fetch_assoc()) {
            $tabela[] = $linha;
        }

        $retorno = [
            'status' => 'ok',
            'mensagem' => 'Sucesso.',
            'data' => $tabela
        ];

    } else {
        $retorno = [
            'status' => 'nok',
            'mensagem' => 'Nao ha registros.',
            'data' => []
        ];
    }


    $stmt->close();
    $conexao->close();
    echo json_encode($retorno);
?>
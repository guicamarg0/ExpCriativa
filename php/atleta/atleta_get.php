<?php
    header("Content-type:application/json;charset:utf-8");
    include_once('../conexao.php');

    // Configurando o padrão de retorno
    $retorno = [
        'status' => '', // ok - nok
        'mensagem' => '', // mensagem que envio para o front
        'data' => []
    ];

    if (isset($_GET['id'])) {
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
        $stmt->bind_param("i", $_GET['id']);
    } else {
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

    // Executando a query
    $stmt->execute();
    $resultado = $stmt->get_result();
    // Criando um array vazio para receber o resultado do bd
    $tabela = [];

    if ($resultado->num_rows > 0) {
        while ($linha = $resultado->fetch_assoc()) {
            $tabela[] = $linha;
        }

        $retorno = [
            'status' => 'ok',
            'mensagem' => 'Sucesso, consulta efetuada.',
            'data' => $tabela
        ];
    }
    else {
        $retorno = [
            'status' => 'nok',
            'mensagem' => 'Não há registros',
            'data' => []
        ];
    }

    // Fechamento do estado e conexão.
    $stmt->close();
    $conexao->close();

    echo json_encode($retorno);

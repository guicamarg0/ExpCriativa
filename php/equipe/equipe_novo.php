<?php
    include_once('../conexao.php');
    // Estrutura padrão de retorno da API
    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    // Verificação básica de conexão (caso sua conexao.php use isso)
    if (!empty($conexao_error)) {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Erro de conexao com o banco.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    // Recebendo dados do POST
    $nome = isset($_POST['nome']) ? $_POST['nome'] : '';
    $descricao = isset($_POST['descricao']) ? $_POST['descricao'] : '';
    $id_modalidade = isset($_POST['id_modalidade']) ? $_POST['id_modalidade'] : '';
    $id_genero = isset($_POST['id_genero']) ? $_POST['id_genero'] : '';
    $categoria = isset($_POST['categoria']) ? $_POST['categoria'] : '';
    $status = 'ativa';
    $id_treinador_responsavel = isset($_POST['id_treinador_responsavel']) ? $_POST['id_treinador_responsavel'] : '';

    // Validação mínima obrigatória
    if ($nome === '') {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Nome obrigatorio.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    // Validações de integridade (mantidas como você fez)
    if ($id_treinador_responsavel !== '' && !ctype_digit($id_treinador_responsavel)) {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Treinador responsavel invalido.',
            'data'      => []
        ];
        echo json_encode($retorno);
        exit;
    }

    if ($id_modalidade !== '' && !ctype_digit($id_modalidade)) {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Modalidade invalida.',
            'data'      => []
        ];
        echo json_encode($retorno);
        exit;
    }

    if ($id_genero !== '' && !ctype_digit($id_genero)) {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Genero invalido.',
            'data'      => []
        ];
        echo json_encode($retorno);
        exit;
    }

    // SQL de inserção
    $stmt = $conexao->prepare(
        "INSERT INTO equipes (
            nome,
            descricao,
            id_modalidade,
            id_genero,
            categoria,
            status,
            id_treinador_responsavel
        ) VALUES (
            ?,
            ?,
            NULLIF(?, ''),
            NULLIF(?, ''),
            ?,
            ?,
            NULLIF(?, '')
        )"
    );

    // Se falhar ao preparar SQL
    if (!$stmt) {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Erro ao preparar insercao: ' . $conexao->error,
            'data'      => []
        ];
        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    // tipos corretos no bind_param
    // s = string, i = integer (mas aqui usamos tudo string porque NULLIF trata)
    $stmt->bind_param(
        "sssssss",
        $nome,
        $descricao,
        $id_modalidade,
        $id_genero,
        $categoria,
        $status,
        $id_treinador_responsavel
    );

    // Executa inserção
    if ($stmt->execute()) {
        // sucesso real da query
        $retorno = [
            'status' => 'ok',
            'mensagem' => 'Equipe cadastrada com sucesso.',
            'data' => [
                'id' => $stmt->insert_id
            ]
        ];
    } else {
        // erro real do MySQL
        $retorno = [
            'status' => 'nok',
            'mensagem' => 'Erro ao inserir equipe: ' . $stmt->error,
            'data' => []
        ];
    }
    // Fecha recursos
    $stmt->close();
    $conexao->close();
    // Resposta JSON final
    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
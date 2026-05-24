<?php
    header("Content-Type: application/json; charset=utf-8");
    include_once('../conexao.php');
    $retorno = [
        'status'   => '',
        'mensagem' => '',
        'data'     => []
    ];
 
    if (!empty($conexao_error)) {
        $retorno = ['status' => 'nok', 'mensagem' => 'Erro de conexao com o banco.', 'data' => []];
        echo json_encode($retorno);
        exit;
    }
 
    $sql_base = "
        SELECT
            atletas.id,
            atletas.nome,
            atletas.data_nascimento  AS datadenasc,
            atletas.id_genero,
            atletas.altura,
            atletas.peso,
            atletas.status,
            genero.nome  AS nome_genero
        FROM atletas
        LEFT JOIN genero ON genero.id = atletas.id_genero
    ";
 
    if (isset($_GET['id'])) {
        // Busca por id do atleta
        $stmt = $conexao->prepare($sql_base . " WHERE atletas.id = ?");
        $stmt->bind_param("i", $_GET['id']);
 
    } elseif (isset($_GET['id_usuario'])) {
        // Atleta logado buscando o próprio registro
        $stmt = $conexao->prepare($sql_base . " WHERE atletas.id_usuario = ?");
        $stmt->bind_param("i", $_GET['id_usuario']);
 
    } elseif (isset($_GET['id_treinador'])) {
        // Treinador vê só os atletas das equipes que ele é responsável
        $sql_treinador = "
            SELECT
                atletas.id,
                atletas.nome,
                atletas.data_nascimento AS datadenasc,
                atletas.id_genero,
                atletas.altura,
                atletas.peso,
                atletas.status,
                genero.nome AS nome_genero
            FROM atletas
            LEFT JOIN genero  ON genero.id  = atletas.id_genero
            LEFT JOIN equipes ON equipes.id = atletas.id_equipe
            WHERE equipes.id_treinador_responsavel = ?
        ";
        $stmt = $conexao->prepare($sql_treinador);
        $stmt->bind_param("i", $_GET['id_treinador']);
 
    } else {
        // Admin — retorna todos os atletas
        $stmt = $conexao->prepare($sql_base);
    }
 
    if (!$stmt) {
        $retorno = ['status' => 'nok', 'mensagem' => 'Erro ao preparar consulta.', 'data' => []];
        echo json_encode($retorno);
        exit;
    }
 
    $stmt->execute();
    $resultado = $stmt->get_result();
    $tabela    = [];
 
    if ($resultado->num_rows > 0) {
        while ($linha = $resultado->fetch_assoc()) {
            $tabela[] = $linha;
        }
        $retorno = ['status' => 'ok', 'mensagem' => 'Sucesso, consulta efetuada.', 'data' => $tabela];
    } else {
        $retorno = ['status' => 'nok', 'mensagem' => 'Nao ha registros.', 'data' => []];
    }
 
    $stmt->close();
    $conexao->close();
    echo json_encode($retorno);
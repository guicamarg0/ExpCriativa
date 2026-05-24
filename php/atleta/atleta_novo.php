<?php
    header("Content-Type: application/json; charset=utf-8");
    include_once('../conexao.php');
 
    $retorno = ['status' => '', 'mensagem' => '', 'data' => []];
 
    if (!empty($conexao_error)) {
        $retorno = ['status' => 'nok', 'mensagem' => 'Erro de conexao com o banco.', 'data' => []];
        echo json_encode($retorno); exit;
    }
 
    $nome       = isset($_POST['nome'])            ? trim($_POST['nome'])              : '';
    $datadenasc = isset($_POST['data_nascimento']) ? trim($_POST['data_nascimento'])   : null;
    $id_genero  = isset($_POST['id_genero'])  && $_POST['id_genero']  !== '' ? (int)   $_POST['id_genero']  : null;
    $altura     = isset($_POST['altura'])     && $_POST['altura']     !== '' ? (float) $_POST['altura']     : null;
    $peso       = isset($_POST['peso'])       && $_POST['peso']       !== '' ? (float) $_POST['peso']       : null;
    $email      = isset($_POST['email'])           ? trim($_POST['email'])             : '';
    $senha      = isset($_POST['senha'])           ? trim($_POST['senha'])             : '';
    $status     = isset($_POST['status'])          ? trim($_POST['status'])            : 'ativo';
 
    if ($nome === '') {
        echo json_encode(['status' => 'nok', 'mensagem' => 'Nome obrigatorio.', 'data' => []]); exit;
    }
    if ($email === '' || $senha === '') {
        echo json_encode(['status' => 'nok', 'mensagem' => 'E-mail e senha obrigatorios.', 'data' => []]); exit;
    }
 
    // Cria o usuário primeiro (id_nivel = 3 = Atleta)
    $stmtUsuario = $conexao->prepare(
        "INSERT INTO usuarios (email, senha, id_nivel, status) VALUES (?, ?, 3, ?)"
    );
    if (!$stmtUsuario) {
        echo json_encode(['status' => 'nok', 'mensagem' => 'Erro ao preparar usuario.', 'data' => []]); exit;
    }
 
    $stmtAtleta = $conexao->prepare(
        "INSERT INTO atletas (id_usuario, nome, data_nascimento, id_genero, altura, peso, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    if (!$stmtAtleta) {
        $stmtUsuario->close();
        echo json_encode(['status' => 'nok', 'mensagem' => 'Erro ao preparar atleta.', 'data' => []]); exit;
    }
 
    $conexao->begin_transaction();
    $mensagemErro = '';
    $idUsuario = 0;
 
    $stmtUsuario->bind_param("sss", $email, $senha, $status);
    if (!$stmtUsuario->execute()) {
        $mensagemErro = $conexao->errno === 1062 ? 'E-mail já cadastrado.' : 'Falha ao cadastrar usuário.';
    } else {
        $idUsuario = (int) $stmtUsuario->insert_id;
        // s=nome s=datadenasc i=id_genero d=altura d=peso s=status
        $stmtAtleta->bind_param("issidds", $idUsuario, $nome, $datadenasc, $id_genero, $altura, $peso, $status);
        if (!$stmtAtleta->execute()) {
            $mensagemErro = 'Falha ao cadastrar atleta.';
        }
    }
 
    if ($mensagemErro !== '') {
        $conexao->rollback();
        $retorno = ['status' => 'nok', 'mensagem' => $mensagemErro, 'data' => []];
    } else {
        $conexao->commit();
        $retorno = ['status' => 'ok', 'mensagem' => 'Atleta cadastrado com sucesso.', 'data' => ['id' => $stmtAtleta->insert_id]];
    }
 
    $stmtAtleta->close();
    $stmtUsuario->close();
    $conexao->close();
    echo json_encode($retorno);
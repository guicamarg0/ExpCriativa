<?php
    header("Content-Type: application/json; charset=utf-8");
    include_once('../conexao.php');

    $retorno = ['status' => '', 'mensagem' => '', 'data' => []];

    if (!empty($conexao_error)) {
        echo json_encode(['status' => 'nok', 'mensagem' => 'Erro de conexao com o banco.', 'data' => []]); exit;
    }

    $id         = isset($_POST['id'])            ? (int)   $_POST['id']             : 0;
    $nome       = isset($_POST['nome'])          ? trim($_POST['nome'])              : '';
    // O form envia como 'data_nascimento' (name do input no HTML)
    $datadenasc = isset($_POST['data_nascimento']) ? trim($_POST['data_nascimento']) : null;
    $id_genero  = isset($_POST['id_genero'])  && $_POST['id_genero']  !== '' ? (int)   $_POST['id_genero']  : null;
    $altura     = isset($_POST['altura'])     && $_POST['altura']     !== '' ? (float) $_POST['altura']     : null;
    $peso       = isset($_POST['peso'])       && $_POST['peso']       !== '' ? (float) $_POST['peso']       : null;
    $status     = isset($_POST['status'])        ? trim($_POST['status'])            : 'ativo';

    if ($id <= 0) { echo json_encode(['status' => 'nok', 'mensagem' => 'ID obrigatorio.', 'data' => []]); exit; }
    if ($nome === '') { echo json_encode(['status' => 'nok', 'mensagem' => 'Nome obrigatorio.', 'data' => []]); exit; }

    // Coluna real no banco é data_nascimento
    $stmt = $conexao->prepare(
        "UPDATE atletas SET nome = ?, data_nascimento = ?, id_genero = ?, altura = ?, peso = ?, status = ? WHERE id = ?"
    );

    if (!$stmt) {
        echo json_encode(['status' => 'nok', 'mensagem' => 'Erro ao preparar alteracao.', 'data' => []]); exit;
    }

    // s=nome  s=data_nascimento  i=id_genero  d=altura  d=peso  s=status  i=id
    $stmt->bind_param("ssiddsi", $nome, $datadenasc, $id_genero, $altura, $peso, $status, $id);
    $stmt->execute();

    $retorno = $stmt->affected_rows >= 0
        ? ['status' => 'ok',  'mensagem' => 'Cadastro do atleta alterado com sucesso.', 'data' => []]
        : ['status' => 'nok', 'mensagem' => 'Nao foi possivel alterar o cadastro do atleta.', 'data' => []];

    $stmt->close();
    $conexao->close();
    echo json_encode($retorno);
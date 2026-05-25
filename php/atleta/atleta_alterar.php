<?php
header("Content-Type: application/json; charset=utf-8");
include_once('../conexao.php');

$retorno = ['status' => '', 
            'mensagem' => '',  
            'data' => []];

// erro de conexão
if (!empty($conexao_error)) {
    echo json_encode(['status' => 'nok', 
                      'mensagem' => 'Erro de conexao com o banco.', 
                      'data' => []]);
    exit;
}

// dados
$id         = isset($_POST['id']) ? (int) $_POST['id'] : 0;
$nome       = isset($_POST['nome']) ? trim($_POST['nome']) : '';
$datadenasc = isset($_POST['data_nascimento']) ? trim($_POST['data_nascimento']) : null;

// garante NULL real pro MySQL
$id_genero  = (isset($_POST['id_genero']) && $_POST['id_genero'] !== '') ? (int) $_POST['id_genero'] : null;
$altura     = (isset($_POST['altura']) && $_POST['altura'] !== '') ? (float) $_POST['altura'] : null;
$peso       = (isset($_POST['peso']) && $_POST['peso'] !== '') ? (float) $_POST['peso'] : null;

$status     = isset($_POST['status']) ? trim($_POST['status']) : 'ativo';

// validações básicas
if ($id <= 0) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'ID obrigatorio.', 'data' => []]);
    exit;
}

if ($nome === '') {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Nome obrigatorio.', 'data' => []]);
    exit;
}

// update
$stmt = $conexao->prepare(
    "UPDATE atletas 
     SET nome = ?, data_nascimento = ?, id_genero = ?, altura = ?, peso = ?, status = ? 
     WHERE id = ?"
);

if (!$stmt) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Erro ao preparar alteracao.', 'data' => []]);
    exit;
}

// bind (mantido igual, mas agora mais seguro com nulls tratados)
$stmt->bind_param("ssiddsi", $nome, $datadenasc, $id_genero, $altura, $peso, $status, $id);

// EXECUÇÃO REAL VERIFICADA
if (!$stmt->execute()) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Erro ao executar alteracao.', 'data' => []]);
    exit;
}

/*
  affected_rows:
  -1 = erro
   0 = nada mudou
   1 = atualizado
*/
if ($stmt->affected_rows >= 0) {
    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Cadastro do atleta alterado com sucesso.',
        'data' => []
    ];
}

$stmt->close();
$conexao->close();
echo json_encode($retorno);
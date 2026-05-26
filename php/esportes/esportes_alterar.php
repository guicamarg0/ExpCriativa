<?php
header("Content-type:application/json;charset:utf-8");
include_once('../conexao.php');

$retorno = [
    'status'    => 'nok',
    'mensagem'  => 'Falha ao processar a requisição.',
    'data'      => []
];

if (isset($_GET['id']) && isset($_POST['nome']) && isset($_POST['status'])) {
    $id = (int) $_GET['id'];
    $nome = $_POST['nome'];
    $status = $_POST['status'];

    $stmt = $conexao->prepare("UPDATE modalidades SET nome = ?, status = ? WHERE id = ?");
    $stmt->bind_param("ssi", $nome, $status, $id);

    if ($stmt->execute()) {
        $retorno = [
            'status'    => 'ok',
            'mensagem'  => 'Registro alterado com sucesso.',
            'data'      => []
        ];
    } else {
        $retorno['mensagem'] = 'Erro ao executar a consulta de atualização: ' . $stmt->error;
    }

    $stmt->close();
} else {
    if (!isset($_GET['id'])) {
        $retorno['mensagem'] = 'Não posso alterar um registro sem um ID informado.';
    } else {
        $retorno['mensagem'] = 'Dados insuficientes para alterar o registro.';
    }
}

$conexao->close();
echo json_encode($retorno);

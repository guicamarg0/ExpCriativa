<?php
header("Content-type:application/json;charset=utf-8");
include_once('../conexao.php');

$retorno = [
    'status' => 'nok',
    'mensagem' => 'Falha ao processar a requisição.',
    'data' => []
];

if (isset($_GET['id']) && isset($_POST['nome']) && isset($_POST['status'])) {

    $id = $_GET['id'];
    $nome = $_POST['nome'];
    $status = $_POST['status'];

    $stmt = $conexao->prepare("UPDATE modalidades SET nome = ?, status = ? WHERE id = ?");
    $stmt->bind_param("ssi", $nome, $status, $id);

    if ($stmt->execute()) {
        if ($stmt->affected_rows >= 0) {
            $retorno = [
                'status' => 'ok',
                'mensagem' => 'Registro alterado com sucesso.',
                'data' => []
            ];
        } else {
            $retorno['mensagem'] = 'Nenhum registro foi alterado.';
        }
    } else {
        $retorno['mensagem'] = 'Erro: ' . $stmt->error;
    }

    $stmt->close();
}

$conexao->close();
echo json_encode($retorno);
?>
<?php
include_once('../conexao.php');

header("Content-Type: application/json; charset=utf-8");

// Configuração padrão de retorno
$retorno = [
    'status'    => 'nok',
    'mensagem'  => 'Falha ao processar a requisição.',
    'data'      => []
];

if (isset($_GET['id'], $_POST['nome'], $_POST['status'])) {

    $id     = (int) $_GET['id'];
    $nome   = $_POST['nome'];
    $status = $_POST['status'];

    $stmt = $conexao->prepare(
        "UPDATE modalidades SET nome = ?, status = ? WHERE id = ?"
    );

    if (!$stmt) {
        $retorno['mensagem'] = 'Erro ao preparar consulta.';
        echo json_encode($retorno);
        exit;
    }

    $stmt->bind_param("ssi", $nome, $status, $id);

    if ($stmt->execute()) {

        if ($stmt->affected_rows > 0) {
            $retorno = [
                'status'   => 'ok',
                'mensagem' => 'Registro alterado com sucesso.',
                'data'     => []
            ];
        } else {
            $retorno['mensagem'] = 'Nenhum registro foi alterado.';
        }

    } else {
        $retorno['mensagem'] = 'Erro ao executar atualização: ' . $stmt->error;
    }

    $stmt->close();

} else {
    if (!isset($_GET['id'])) {
        $retorno['mensagem'] = 'ID não informado.';
    } else {
        $retorno['mensagem'] = 'Nome e status são obrigatórios.';
    }
}

$conexao->close();

echo json_encode($retorno);
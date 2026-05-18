<?php
include_once('../conexao.php');

$simples = isset($_GET['simples']) && $_GET['simples'] === '1';

if ($simples) {
    $stmt = $conexao->prepare("SELECT id, nome FROM modalidades ORDER BY nome ASC");
} elseif (isset($_GET['id'])) {
    $id = (int) $_GET['id'];
    $stmt = $conexao->prepare("SELECT id, nome, status FROM modalidades WHERE id = ?");
    $stmt->bind_param("i", $id);
} else {
    $stmt = $conexao->prepare(
        "SELECT
            modalidades.id,
            modalidades.nome,
            modalidades.status,
            (SELECT COUNT(*) FROM equipes WHERE equipes.id_modalidade = modalidades.id) AS equipes_vinculadas
         FROM modalidades
         ORDER BY modalidades.nome ASC"
    );
}

$stmt->execute();
$resultado = $stmt->get_result();

$tabela = [];
while ($linha = $resultado->fetch_assoc()) {
    $tabela[] = $linha;
}

$retorno = [
    'status' => 'ok',
    'mensagem' => 'Sucesso, consulta efetuada.',
    'data' => $tabela
];

$stmt->close();
$conexao->close();

header("Content-type:application/json;charset=utf-8");
echo json_encode($retorno);

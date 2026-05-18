<?php
include_once('../conexao.php');

if (isset($_GET['id'])) {
    $id = (int) $_GET['id'];
    $stmt = $conexao->prepare(
        "SELECT
            atletas.id,
            atletas.nome,
            atletas.data_nascimento,
            atletas.id_genero,
            atletas.altura,
            atletas.peso,
            atletas.status,
            genero.nome AS genero_nome
         FROM atletas
         LEFT JOIN genero ON genero.id = atletas.id_genero
         WHERE atletas.id = ?
         ORDER BY atletas.nome ASC"
    );
    $stmt->bind_param("i", $id);
} else {
    $stmt = $conexao->prepare(
        "SELECT
            atletas.id,
            atletas.nome,
            atletas.data_nascimento,
            atletas.id_genero,
            atletas.altura,
            atletas.peso,
            atletas.status,
            genero.nome AS genero_nome
         FROM atletas
         LEFT JOIN genero ON genero.id = atletas.id_genero
         ORDER BY atletas.nome ASC"
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

header("Content-type:application/json;charset:utf-8");
echo json_encode($retorno);

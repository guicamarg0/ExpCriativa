<?php
include_once('../conexao.php');

if (isset($_GET['id'])) {
    $id = (int) $_GET['id'];
    $stmt = $conexao->prepare(
        "SELECT
            equipes.id,
            equipes.nome,
            equipes.descricao,
            equipes.id_modalidade,
            equipes.id_genero,
            equipes.id_treinador_responsavel,
            equipes.status,
            equipes.categoria,
            genero.nome AS genero,
            modalidades.nome AS modalidade,
            treinador.nome AS treinador_responsavel_nome,
            (SELECT COUNT(*) FROM atletas WHERE atletas.id_equipe = equipes.id) AS integrantes
        FROM equipes
        LEFT JOIN modalidades ON modalidades.id = equipes.id_modalidade
        LEFT JOIN genero ON genero.id = equipes.id_genero
        LEFT JOIN treinadores AS treinador ON treinador.id = equipes.id_treinador_responsavel
        WHERE equipes.id = ?
        ORDER BY equipes.nome ASC"
    );
    $stmt->bind_param("i", $id);
} else {
    $stmt = $conexao->prepare(
        "SELECT
            equipes.id,
            equipes.nome,
            equipes.descricao,
            equipes.id_modalidade,
            equipes.id_genero,
            equipes.id_treinador_responsavel,
            equipes.status,
            equipes.categoria,
            genero.nome AS genero,
            modalidades.nome AS modalidade,
            treinador.nome AS treinador_responsavel_nome,
            (SELECT COUNT(*) FROM atletas WHERE atletas.id_equipe = equipes.id) AS integrantes
        FROM equipes
        LEFT JOIN modalidades ON modalidades.id = equipes.id_modalidade
        LEFT JOIN genero ON genero.id = equipes.id_genero
        LEFT JOIN treinadores AS treinador ON treinador.id = equipes.id_treinador_responsavel
        ORDER BY equipes.nome ASC"
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

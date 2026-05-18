<?php
include_once('../conexao.php');

$simples = isset($_GET['simples']) && $_GET['simples'] === '1';

if ($simples) {
    $stmt = $conexao->prepare("SELECT id, nome FROM treinadores ORDER BY nome ASC");
} elseif (isset($_GET['id'])) {
    $id = (int) $_GET['id'];
    $stmt = $conexao->prepare(
        "SELECT
            treinadores.id,
            treinadores.nome,
            treinadores.cref,
            treinadores.telefone,
            treinadores.data_nascimento,
            treinadores.data_inicio,
            treinadores.status,
            usuarios.email,
            GROUP_CONCAT(DISTINCT equipes.nome ORDER BY equipes.nome SEPARATOR ', ') AS equipes_responsavel
        FROM treinadores
        LEFT JOIN usuarios ON usuarios.id = treinadores.id_usuario
        LEFT JOIN equipes ON equipes.id_treinador_responsavel = treinadores.id
        WHERE treinadores.id = ?
        GROUP BY
            treinadores.id,
            treinadores.nome,
            treinadores.cref,
            treinadores.telefone,
            treinadores.data_nascimento,
            treinadores.data_inicio,
            treinadores.status,
            usuarios.email
        ORDER BY treinadores.nome ASC"
    );
    $stmt->bind_param("i", $id);
} else {
    $stmt = $conexao->prepare(
        "SELECT
            treinadores.id,
            treinadores.nome,
            treinadores.cref,
            treinadores.telefone,
            treinadores.data_nascimento,
            treinadores.data_inicio,
            treinadores.status,
            usuarios.email,
            GROUP_CONCAT(DISTINCT equipes.nome ORDER BY equipes.nome SEPARATOR ', ') AS equipes_responsavel
        FROM treinadores
        LEFT JOIN usuarios ON usuarios.id = treinadores.id_usuario
        LEFT JOIN equipes ON equipes.id_treinador_responsavel = treinadores.id
        GROUP BY
            treinadores.id,
            treinadores.nome,
            treinadores.cref,
            treinadores.telefone,
            treinadores.data_nascimento,
            treinadores.data_inicio,
            treinadores.status,
            usuarios.email
        ORDER BY treinadores.nome ASC"
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

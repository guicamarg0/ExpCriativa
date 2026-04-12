<?php
include_once('../conexao.php');

$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];

if (!empty($conexao_error)) {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Erro de conexão com o banco.',
        'data' => []
    ];

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
    exit;
}

$statusFiltro = isset($_GET['status']) ? strtolower(trim($_GET['status'])) : 'ativo';
$filtrarStatus = true;
$statusBanco = 'ativo';

if ($statusFiltro === 'todos') {
    $filtrarStatus = false;
} elseif ($statusFiltro === 'inativo') {
    $statusBanco = 'inativo';
}

if (isset($_GET['id'])) {
    $id = (int) $_GET['id'];

    if ($id <= 0) {
        $retorno = [
            'status' => 'nok',
            'mensagem' => 'ID inválido.',
            'data' => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    if ($filtrarStatus) {
        $stmt = $conexao->prepare(
            "SELECT
                modalidades.id,
                modalidades.nome,
                modalidades.status,
                (SELECT COUNT(*) FROM equipes WHERE equipes.id_modalidade = modalidades.id) AS equipes_vinculadas
            FROM modalidades
            WHERE modalidades.id = ? AND modalidades.status = ?"
        );
        if ($stmt) {
            $stmt->bind_param("is", $id, $statusBanco);
        }
    } else {
        $stmt = $conexao->prepare(
            "SELECT
                modalidades.id,
                modalidades.nome,
                modalidades.status,
                (SELECT COUNT(*) FROM equipes WHERE equipes.id_modalidade = modalidades.id) AS equipes_vinculadas
            FROM modalidades
            WHERE modalidades.id = ?"
        );
        if ($stmt) {
            $stmt->bind_param("i", $id);
        }
    }
} else {
    if ($filtrarStatus) {
        $stmt = $conexao->prepare(
            "SELECT
                modalidades.id,
                modalidades.nome,
                modalidades.status,
                (SELECT COUNT(*) FROM equipes WHERE equipes.id_modalidade = modalidades.id) AS equipes_vinculadas
            FROM modalidades
            WHERE modalidades.status = ?
            ORDER BY modalidades.nome ASC"
        );
        if ($stmt) {
            $stmt->bind_param("s", $statusBanco);
        }
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
}

if (!isset($stmt) || !$stmt) {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Erro ao preparar consulta.',
        'data' => []
    ];

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
    exit;
}

$stmt->execute();
$resultado = $stmt->get_result();
$tabela = [];

if ($resultado->num_rows > 0) {
    while ($linha = $resultado->fetch_assoc()) {
        $tabela[] = $linha;
    }

    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Sucesso, consulta efetuada.',
        'data' => $tabela
    ];
} else {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Não há registros.',
        'data' => []
    ];
}

$stmt->close();
$conexao->close();

header("Content-type:application/json;charset:utf-8");
echo json_encode($retorno);

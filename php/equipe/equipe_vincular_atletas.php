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
        'mensagem' => 'Erro de conexao com o banco.',
        'data' => []
    ];

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
    exit;
}

$idEquipe = isset($_POST['id_equipe']) ? (int) $_POST['id_equipe'] : 0;
$idsTexto = isset($_POST['atletas_ids']) ? trim($_POST['atletas_ids']) : '';
$forcarVinculo = isset($_POST['forcar_vinculo']) && $_POST['forcar_vinculo'] === '1';

if ($idEquipe <= 0) {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Equipe invalida.',
        'data' => []
    ];

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
    exit;
}

$ids = [];
if ($idsTexto !== '') {
    $partes = explode(',', $idsTexto);
    foreach ($partes as $parte) {
        $valor = (int) trim($parte);
        if ($valor > 0) {
            $ids[] = $valor;
        }
    }
}
$ids = array_values(array_unique($ids));

if (count($ids) === 0) {
    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Nenhum atleta selecionado.',
        'data' => []
    ];

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
    exit;
}

$idsSql = implode(',', $ids);

$stmtEquipe = $conexao->prepare("SELECT id FROM equipes WHERE id = ? LIMIT 1");
if (!$stmtEquipe) {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Erro ao validar equipe.',
        'data' => []
    ];
    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
    exit;
}

$stmtEquipe->bind_param("i", $idEquipe);
$stmtEquipe->execute();
$resultadoEquipe = $stmtEquipe->get_result();
$stmtEquipe->close();

if ($resultadoEquipe->num_rows === 0) {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Equipe nao encontrada.',
        'data' => []
    ];
    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
    exit;
}

$queryAtletas = "
    SELECT atletas.id, atletas.nome, atletas.id_equipe
    FROM atletas
    WHERE atletas.id IN ($idsSql)
      AND atletas.status = 'ativo'
";
$resultadoAtletas = $conexao->query($queryAtletas);

if (!$resultadoAtletas) {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Erro ao validar atletas selecionados.',
        'data' => []
    ];
    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
    exit;
}

$atletasValidos = [];
while ($linha = $resultadoAtletas->fetch_assoc()) {
    $atletasValidos[] = $linha;
}

if (count($atletasValidos) !== count($ids)) {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Selecione apenas atletas ativos validos.',
        'data' => []
    ];
    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
    exit;
}

$conflitos = [];
foreach ($atletasValidos as $atleta) {
    $idEquipeAtleta = (int) ($atleta['id_equipe'] ?? 0);
    if ($idEquipeAtleta > 0 && $idEquipeAtleta !== $idEquipe) {
        $conflitos[] = [
            'id' => (int) $atleta['id'],
            'nome' => $atleta['nome']
        ];
    }
}

if (count($conflitos) > 0 && !$forcarVinculo) {
    $retorno = [
        'status' => 'confirmar',
        'mensagem' => 'Algum atleta selecionado ja tem equipe, tem certeza que deseja alterar a equipe?',
        'data' => [
            'conflitos' => $conflitos
        ]
    ];
    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
    exit;
}

$stmtVincular = $conexao->prepare("UPDATE atletas SET id_equipe = ? WHERE id IN ($idsSql)");
if (!$stmtVincular) {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Erro ao preparar vinculo de atletas.',
        'data' => []
    ];
    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
    exit;
}

$stmtVincular->bind_param("i", $idEquipe);
$stmtVincular->execute();
$stmtVincular->close();

$conexao->close();

$retorno = [
    'status' => 'ok',
    'mensagem' => 'Atletas vinculados com sucesso.',
    'data' => []
];

header("Content-type:application/json;charset:utf-8");
echo json_encode($retorno);

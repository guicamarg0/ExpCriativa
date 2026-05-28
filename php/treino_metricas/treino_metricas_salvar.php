<?php
header("Content-type:application/json;charset:utf-8");
include_once('../conexao.php');
include_once('../permissao.php');
exigir_admin_ou_treinador();

$retorno = [
    'status' => 'nok',
    'mensagem' => 'Falha ao salvar métricas do treino.',
    'data' => []
];

$idTreino = (int) ($_POST['id_treino'] ?? 0);
$metricasIdsTexto = $_POST['metricas_ids'] ?? '';

if ($idTreino <= 0) {
    $retorno['mensagem'] = 'Informe o treino.';
    echo json_encode($retorno);
    exit;
}

if (!treino_permitido($conexao, $idTreino)) {
    responder_sem_permissao();
}

$stmtTreino = $conexao->prepare("SELECT id FROM treinos WHERE id = ? LIMIT 1");

if (!$stmtTreino) {
    $retorno['mensagem'] = 'Erro ao preparar consulta do treino: ' . $conexao->error;
    echo json_encode($retorno);
    exit;
}

$stmtTreino->bind_param("i", $idTreino);
$stmtTreino->execute();
$resultadoTreino = $stmtTreino->get_result();
$treino = $resultadoTreino->fetch_assoc();
$stmtTreino->close();

if (!$treino) {
    $retorno['mensagem'] = 'Treino nao encontrado para vincular metricas.';
    echo json_encode($retorno);
    exit;
}

$nomeFixo = 'Percepcao de esforco';
$stmtFixo = $conexao->prepare("SELECT id FROM metricas WHERE nome = ? LIMIT 1");

if (!$stmtFixo) {
    $retorno['mensagem'] = 'Erro ao preparar metrica fixa: ' . $conexao->error;
    echo json_encode($retorno);
    exit;
}

$stmtFixo->bind_param("s", $nomeFixo);
$stmtFixo->execute();
$resultadoFixo = $stmtFixo->get_result();
$metricaFixa = $resultadoFixo->fetch_assoc();
$stmtFixo->close();

if (!$metricaFixa) {
    $descricaoFixa = 'Escala de esforco percebido pelo atleta';
    $unidadeFixa = '0-10';
    $tipoFixo = 'escala_0_10';
    $statusFixo = 'ativo';
    $stmtNovoFixo = $conexao->prepare("INSERT INTO metricas (nome, descricao, unidade_medida, tipo, status) VALUES (?, ?, ?, ?, ?)");

    if (!$stmtNovoFixo) {
        $retorno['mensagem'] = 'Erro ao preparar cadastro da metrica fixa: ' . $conexao->error;
        echo json_encode($retorno);
        exit;
    }

    $stmtNovoFixo->bind_param("sssss", $nomeFixo, $descricaoFixa, $unidadeFixa, $tipoFixo, $statusFixo);

    if (!$stmtNovoFixo->execute()) {
        $retorno['mensagem'] = 'Erro ao cadastrar metrica fixa: ' . $stmtNovoFixo->error;
        echo json_encode($retorno);
        exit;
    }

    $idMetricaFixa = (int) $stmtNovoFixo->insert_id;
    $stmtNovoFixo->close();
} else {
    $idMetricaFixa = (int) $metricaFixa['id'];
}

$metricasIds = [$idMetricaFixa];
$partes = explode(',', $metricasIdsTexto);

for ($i = 0; $i < count($partes); $i++) {
    $idMetrica = (int) trim($partes[$i]);

    if ($idMetrica > 0 && !in_array($idMetrica, $metricasIds)) {
        $metricasIds[] = $idMetrica;
    }
}

$stmtExcluir = $conexao->prepare("DELETE FROM treino_metricas WHERE id_treino = ?");

if (!$stmtExcluir) {
    $retorno['mensagem'] = 'Erro ao preparar limpeza das metricas: ' . $conexao->error;
    echo json_encode($retorno);
    exit;
}

$stmtExcluir->bind_param("i", $idTreino);

if (!$stmtExcluir->execute()) {
    $retorno['mensagem'] = 'Erro ao limpar metricas do treino: ' . $stmtExcluir->error;
    echo json_encode($retorno);
    exit;
}

$stmtExcluir->close();

$stmtInserir = $conexao->prepare("INSERT INTO treino_metricas (id_treino, id_metrica) VALUES (?, ?)");

if (!$stmtInserir) {
    $retorno['mensagem'] = 'Erro ao preparar vínculo: ' . $conexao->error;
    echo json_encode($retorno);
    exit;
}

for ($i = 0; $i < count($metricasIds); $i++) {
    $idMetrica = (int) $metricasIds[$i];
    $stmtInserir->bind_param("ii", $idTreino, $idMetrica);

    if (!$stmtInserir->execute()) {
        $retorno['mensagem'] = 'Erro ao vincular metrica ao treino: ' . $stmtInserir->error;
        echo json_encode($retorno);
        exit;
    }
}

$stmtInserir->close();
$conexao->close();

$retorno = [
    'status' => 'ok',
    'mensagem' => 'Métricas do treino salvas com sucesso.',
    'data' => []
];

echo json_encode($retorno);

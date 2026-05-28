<?php
header("Content-type:application/json;charset:utf-8");
include_once('../conexao.php');

$retorno = [
    'status' => 'nok',
    'mensagem' => 'Nenhum exercicio encontrado.',
    'data' => []
];

if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    $retorno['mensagem'] = 'id da modalidade ausente ou invalido';
    echo json_encode($retorno);
    exit;
}

$idModalidade = (int) $_GET['id'];

$stmt = $conexao->prepare("
    SELECT
        exercicios.id AS id_exercicio,
        exercicios.nome AS nome_exercicio,
        metricas.id AS id_metrica,
        metricas.nome AS nome_metrica,
        metricas.unidade_medida,
        metricas.tipo
    FROM modalidade_exercicio
    INNER JOIN exercicios ON exercicios.id = modalidade_exercicio.id_exercicio
    LEFT JOIN exercicio_metricas ON exercicio_metricas.id_exercicio = exercicios.id
    LEFT JOIN metricas ON metricas.id = exercicio_metricas.id_metrica
    WHERE modalidade_exercicio.id_modalidade = ?
      AND (metricas.status = 'ativo' OR metricas.status IS NULL)
    ORDER BY exercicios.nome,
      CASE WHEN metricas.nome = 'Percepcao de esforco' THEN 0 ELSE 1 END,
      metricas.nome
");

if (!$stmt) {
    $retorno['mensagem'] = 'Erro ao preparar consulta: ' . $conexao->error;
    echo json_encode($retorno);
    exit;
}

$stmt->bind_param("i", $idModalidade);
$stmt->execute();
$resultado = $stmt->get_result();
$exercicios = [];

while ($linha = $resultado->fetch_assoc()) {
    $idExercicio = (int) $linha['id_exercicio'];

    if (!isset($exercicios[$idExercicio])) {
        $exercicios[$idExercicio] = [
            'id' => $idExercicio,
            'nome' => $linha['nome_exercicio'],
            'metricas' => []
        ];
    }

    if (!empty($linha['id_metrica'])) {
        $exercicios[$idExercicio]['metricas'][] = [
            'id' => (int) $linha['id_metrica'],
            'nome' => $linha['nome_metrica'],
            'unidade_medida' => $linha['unidade_medida'],
            'tipo' => $linha['tipo']
        ];
    }
}

$data = array_values($exercicios);

if (count($data) > 0) {
    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Exercicios encontrados.',
        'data' => $data
    ];
}

$stmt->close();
$conexao->close();

echo json_encode($retorno);

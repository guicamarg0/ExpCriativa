<?php
include_once('../conexao.php');

// Configurando o padrão de retorno inicial
$retorno = [
    'status'    => 'nok', // Default to 'nok' (not ok)
    'mensagem'  => 'Falha ao processar a requisição.', // Default error message
    'data'      => []
];

$stmt = null; // Inicializa a variável de declaração

if (isset($_GET['id'])) {
    // Situação 1: Busca por um registro específico pelo ID
    $id = $_GET['id'];
    // Seleciona colunas específicas para clareza e eficiência
    $stmt = $conexao->prepare("SELECT id, nome, status FROM modalidades WHERE id = ?");
    // Vincula o parâmetro: "i" indica integer
    $stmt->bind_param("i", $id);
} else {
    // Situação 2: Busca por todos os registros
    // Seleciona colunas específicas para clareza e eficiência
    $stmt = $conexao->prepare("SELECT id, nome, status FROM modalidades");
}

// Executa a query preparada
if ($stmt->execute()) {
    // Obtém o resultado da query
    $resultado = $stmt->get_result();
    $tabela = []; // Array para armazenar os resultados

    if ($resultado->num_rows > 0) {
        // Se houver resultados, preenche o array $tabela
        while ($linha = $resultado->fetch_assoc()) {
            $tabela[] = $linha;
        }

        $retorno = [
            'status'    => 'ok',
            'mensagem'  => 'Registros consultados com sucesso.',
            'data'      => $tabela
        ];
    } else {
        // Nenhum registro encontrado
        if (isset($_GET['id'])) {
            $retorno['mensagem'] = 'Nenhum registro encontrado com o ID informado.';
        } else {
            $retorno['mensagem'] = 'Não há registros de modalidades no banco de dados.';
        }
    }
    // Fecha a declaração preparada
    $stmt->close();
} else {
    // Erro durante a execução da query
    $retorno['mensagem'] = 'Erro ao executar a consulta: ' . $stmt->error;
}

// Fecha a conexão com o banco de dados
$conexao->close();

// Define o cabeçalho para indicar que o conteúdo é JSON
header("Content-type:application/json;charset=utf-8");
// Codifica o array de retorno para JSON e o exibe
echo json_encode($retorno);
?>

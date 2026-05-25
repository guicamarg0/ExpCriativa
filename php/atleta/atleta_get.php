<?php
    header("Content-Type: application/json; charset=utf-8");
    include_once('../conexao.php');

if (isset($_GET['id'])) {
    $id = (int) $_GET['id'];
    $stmt = $conexao->prepare("SELECT * FROM atletas WHERE id = ?");
    $stmt->bind_param("i", $id);
} else {
    $stmt = $conexao->prepare("SELECT * FROM atletas");
}

$stmt->execute();
$resultado = $stmt->get_result();

    if(isset($_GET['id'])){
        $stmt = $conexao->prepare(
            "SELECT
                atletas.id,
                atletas.nome,
                atletas.data_nascimento,
                atletas.id_genero,
                atletas.altura,
                atletas.peso,
                genero.nome AS nome_genero
            FROM atletas
            LEFT JOIN genero ON genero.id = atletas.id_genero
            WHERE atletas.id = ?"
        );
        $stmt->bind_param("i",$_GET['id']);
    }else{
        $stmt = $conexao->prepare(
            "SELECT
                atletas.id,
                atletas.nome,
                atletas.data_nascimento,
                atletas.id_genero,
                atletas.altura,
                atletas.peso,
                genero.nome AS nome_genero
            FROM atletas
            LEFT JOIN genero ON genero.id = atletas.id_genero"
        );
    }

$retorno = [
    'status' => 'ok',
    'mensagem' => 'Sucesso, consulta efetuada.',
    'data' => $tabela
];

$stmt->close();
$conexao->close();

        $retorno = [
            'status'    => 'ok', // ok - nok
            'mensagem'  => 'Sucesso, consulta efetuada.', 
            'data'      => $tabela
        ];
    }else{
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Não há registros', 
            'data'      => []
        ];
    }

    $stmt->close();
    $conexao->close();

    echo json_encode($retorno);

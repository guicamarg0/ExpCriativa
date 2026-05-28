<?php
    header("Content-type:application/json;charset:utf-8");
    include_once('../conexao.php');
    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    $nome       = $_POST['nome']; // $_POST['nome'];
    $status      = $_POST['status'];
    $exercicios_raw = isset($_POST['exercicios']) ? $_POST['exercicios'] : '';

    // Preparando para insercao no banco de dados
    $stmt = $conexao->prepare("
    INSERT INTO modalidades(nome, status) VALUES(?,?)");
    $stmt->bind_param("ss",$nome, $status);
    $stmt->execute();

    if($stmt->affected_rows > 0){
        $modalidade_id = $stmt->insert_id;
        $lines = preg_split('/\r\n|\r|\n/', $exercicios_raw);
        foreach($lines as $line){
            $ex = trim($line);
            if($ex === '') continue;

            $search = $conexao->prepare("SELECT id FROM exercicios WHERE nome = ?");
            $search->bind_param("s", $ex);
            $search->execute();
            $result = $search->get_result();
            if($result && $result->num_rows > 0){
                $row = $result->fetch_assoc();
                $exercicio_id = $row['id'];
                $search->close();
            } else {
                $search->close();
                $insertEx = $conexao->prepare("INSERT INTO exercicios(nome) VALUES(?)");
                $insertEx->bind_param("s", $ex);
                $insertEx->execute();
                $exercicio_id = $insertEx->insert_id;
                $insertEx->close();
            }

            $link = $conexao->prepare("INSERT IGNORE INTO modalidade_exercicio(id_modalidade, id_exercicio) VALUES(?,?)");
            $link->bind_param("ii", $modalidade_id, $exercicio_id);
            $link->execute();
            $link->close();
        }

        $retorno = [
            'status' => 'ok',
            'mensagem' => 'registro inserido com sucesso',
            'data' => []
        ];
    }else{
        $retorno = [
            'status' => 'nok',
            'mensagem' => 'falha ao inserir o registro',
            'data' => []
        ];
    }

    $stmt->close();
    echo json_encode($retorno);

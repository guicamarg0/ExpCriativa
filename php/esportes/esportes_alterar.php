<?php
    header("Content-type:application/json;charset:utf-8");
    include_once('../conexao.php');

$retorno = [
    'status'    => 'nok',
    'mensagem'  => 'Falha ao processar a requisição.',
    'data'      => []
];

    if(isset($_GET['id'])){
        $modalidade_id = intval($_GET['id']);
        $nome        = $_POST['nome']; 
        $status      = $_POST['status'];
        $exercicios_raw = isset($_POST['exercicios']) ? $_POST['exercicios'] : '';
    
        // Atualizando modalidade
        $stmt = $conexao->prepare("UPDATE modalidades SET nome = ?,  status = ? WHERE id = ?");
        $stmt->bind_param("ssi",$nome, $status, $modalidade_id);
        $stmt->execute();

        if($stmt->affected_rows >= 0){
            $stmt->close();

            $delete = $conexao->prepare("DELETE FROM modalidade_exercicio WHERE id_modalidade = ?");
            $delete->bind_param("i", $modalidade_id);
            $delete->execute();
            $delete->close();

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
                'status'    => 'ok',
                'mensagem'  => 'Registro alterado com sucesso.',
                'data'      => []
            ];
        }else{
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Não consegui alterar o registro.'.json_encode($_GET),
                'data'      => []
            ];
            $stmt->close();
        }
    }else{
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Não posso alterar um registro sem um ID informado.',
            'data'      => []
        ];
    }
       
    $conexao->close();

    echo json_encode($retorno);

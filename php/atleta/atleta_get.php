<?php
    include_once('../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    if(!empty($conexao_error)){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Erro de conexao com o banco.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    $statusFiltro = isset($_GET['status']) ? strtolower($_GET['status']) : 'todos';
    $filtrarStatus = false;
    $statusBanco = '';

    if($statusFiltro === 'ativo' || $statusFiltro === 'inativo'){
        $filtrarStatus = true;
        $statusBanco = $statusFiltro;
    }

    if(isset($_GET['id'])){
        $id = (int) $_GET['id'];
        if($id <= 0){
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'ID invalido.',
                'data'      => []
            ];

            header("Content-type:application/json;charset:utf-8");
            echo json_encode($retorno);
            exit;
        }

        if($filtrarStatus){
            $stmt = $conexao->prepare(
                "SELECT
                    atletas.id,
                    atletas.id_usuario,
                    atletas.id_equipe,
                    atletas.id_genero,
                    atletas.nome,
                    atletas.data_nascimento,
                    atletas.altura,
                    atletas.peso,
                    atletas.status,
                    usuarios.email,
                    genero.nome AS genero_nome,
                    equipes.nome AS equipe_nome
                 FROM atletas
                 LEFT JOIN usuarios ON usuarios.id = atletas.id_usuario
                 LEFT JOIN genero ON genero.id = atletas.id_genero
                 LEFT JOIN equipes ON equipes.id = atletas.id_equipe
                 WHERE atletas.id = ? AND atletas.status = ?"
            );
            $stmt->bind_param("is", $id, $statusBanco);
        }else{
            $stmt = $conexao->prepare(
                "SELECT
                    atletas.id,
                    atletas.id_usuario,
                    atletas.id_equipe,
                    atletas.id_genero,
                    atletas.nome,
                    atletas.data_nascimento,
                    atletas.altura,
                    atletas.peso,
                    atletas.status,
                    usuarios.email,
                    genero.nome AS genero_nome,
                    equipes.nome AS equipe_nome
                 FROM atletas
                 LEFT JOIN usuarios ON usuarios.id = atletas.id_usuario
                 LEFT JOIN genero ON genero.id = atletas.id_genero
                 LEFT JOIN equipes ON equipes.id = atletas.id_equipe
                 WHERE atletas.id = ?"
            );
            $stmt->bind_param("i", $id);
        }
    }else{
        if($filtrarStatus){
            $stmt = $conexao->prepare(
                "SELECT
                    atletas.id,
                    atletas.id_usuario,
                    atletas.id_equipe,
                    atletas.id_genero,
                    atletas.nome,
                    atletas.data_nascimento,
                    atletas.altura,
                    atletas.peso,
                    atletas.status,
                    usuarios.email,
                    genero.nome AS genero_nome,
                    equipes.nome AS equipe_nome
                 FROM atletas
                 LEFT JOIN usuarios ON usuarios.id = atletas.id_usuario
                 LEFT JOIN genero ON genero.id = atletas.id_genero
                 LEFT JOIN equipes ON equipes.id = atletas.id_equipe
                 WHERE atletas.status = ?
                 ORDER BY atletas.nome ASC"
            );
            $stmt->bind_param("s", $statusBanco);
        }else{
            $stmt = $conexao->prepare(
                "SELECT
                    atletas.id,
                    atletas.id_usuario,
                    atletas.id_equipe,
                    atletas.id_genero,
                    atletas.nome,
                    atletas.data_nascimento,
                    atletas.altura,
                    atletas.peso,
                    atletas.status,
                    usuarios.email,
                    genero.nome AS genero_nome,
                    equipes.nome AS equipe_nome
                 FROM atletas
                 LEFT JOIN usuarios ON usuarios.id = atletas.id_usuario
                 LEFT JOIN genero ON genero.id = atletas.id_genero
                 LEFT JOIN equipes ON equipes.id = atletas.id_equipe
                 ORDER BY atletas.nome ASC"
            );
        }
    }

    if(!$stmt){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Erro ao preparar consulta.',
            'data'      => []
        ];

        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    $stmt->execute();
    $resultado = $stmt->get_result();
    $tabela = [];

    if($resultado->num_rows > 0){
        while($linha = $resultado->fetch_assoc()){
            $tabela[] = $linha;
        }

        $retorno = [
            'status'    => 'ok',
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

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);

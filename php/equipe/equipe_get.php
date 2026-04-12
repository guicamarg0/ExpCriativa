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

    $statusFiltro = isset($_GET['status']) ? strtolower(trim($_GET['status'])) : 'ativa';
    $filtrarStatus = true;
    $statusBanco = 'ativa';

    if($statusFiltro === 'todos'){
        $filtrarStatus = false;
    }elseif($statusFiltro === 'inativa'){
        $statusBanco = 'inativa';
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
                    equipes.id,
                    equipes.nome,
                    equipes.descricao,
                    equipes.id_modalidade,
                    equipes.id_genero,
                    equipes.id_treinador_responsavel,
                    equipes.status,
                    equipes.categoria,
                    genero.nome AS genero,
                    modalidades.nome AS modalidade,
                    treinador.nome AS treinador_responsavel_nome,
                    (SELECT COUNT(*) FROM atletas WHERE atletas.id_equipe = equipes.id) AS integrantes
                FROM equipes
                LEFT JOIN modalidades ON modalidades.id = equipes.id_modalidade
                LEFT JOIN genero ON genero.id = equipes.id_genero
                LEFT JOIN treinadores AS treinador ON treinador.id = equipes.id_treinador_responsavel
                WHERE equipes.id = ? AND equipes.status = ?"
            );
            $stmt->bind_param("is", $id, $statusBanco);
        }else{
            $stmt = $conexao->prepare(
                "SELECT
                    equipes.id,
                    equipes.nome,
                    equipes.descricao,
                    equipes.id_modalidade,
                    equipes.id_genero,
                    equipes.id_treinador_responsavel,
                    equipes.status,
                    equipes.categoria,
                    genero.nome AS genero,
                    modalidades.nome AS modalidade,
                    treinador.nome AS treinador_responsavel_nome,
                    (SELECT COUNT(*) FROM atletas WHERE atletas.id_equipe = equipes.id) AS integrantes
                FROM equipes
                LEFT JOIN modalidades ON modalidades.id = equipes.id_modalidade
                LEFT JOIN genero ON genero.id = equipes.id_genero
                LEFT JOIN treinadores AS treinador ON treinador.id = equipes.id_treinador_responsavel
                WHERE equipes.id = ?"
            );
            $stmt->bind_param("i", $id);
        }
    }else{
        if($filtrarStatus){
            $stmt = $conexao->prepare(
                "SELECT
                    equipes.id,
                    equipes.nome,
                    equipes.descricao,
                    equipes.id_modalidade,
                    equipes.id_genero,
                    equipes.id_treinador_responsavel,
                    equipes.status,
                    equipes.categoria,
                    genero.nome AS genero,
                    modalidades.nome AS modalidade,
                    treinador.nome AS treinador_responsavel_nome,
                    (SELECT COUNT(*) FROM atletas WHERE atletas.id_equipe = equipes.id) AS integrantes
                FROM equipes
                LEFT JOIN modalidades ON modalidades.id = equipes.id_modalidade
                LEFT JOIN genero ON genero.id = equipes.id_genero
                LEFT JOIN treinadores AS treinador ON treinador.id = equipes.id_treinador_responsavel
                WHERE equipes.status = ?
                ORDER BY equipes.nome ASC"
            );
            $stmt->bind_param("s", $statusBanco);
        }else{
            $stmt = $conexao->prepare(
                "SELECT
                    equipes.id,
                    equipes.nome,
                    equipes.descricao,
                    equipes.id_modalidade,
                    equipes.id_genero,
                    equipes.id_treinador_responsavel,
                    equipes.status,
                    equipes.categoria,
                    genero.nome AS genero,
                    modalidades.nome AS modalidade,
                    treinador.nome AS treinador_responsavel_nome,
                    (SELECT COUNT(*) FROM atletas WHERE atletas.id_equipe = equipes.id) AS integrantes
                FROM equipes
                LEFT JOIN modalidades ON modalidades.id = equipes.id_modalidade
                LEFT JOIN genero ON genero.id = equipes.id_genero
                LEFT JOIN treinadores AS treinador ON treinador.id = equipes.id_treinador_responsavel
                ORDER BY equipes.nome ASC"
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

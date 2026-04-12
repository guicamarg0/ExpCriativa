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

    $statusFiltro = isset($_GET['status']) ? strtolower(trim($_GET['status'])) : 'ativo';
    $filtrarStatus = true;
    $statusBanco = 'ativo';

    if($statusFiltro === 'todos'){
        $filtrarStatus = false;
    }elseif($statusFiltro === 'inativo'){
        $statusBanco = 'inativo';
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
                    treinadores.id,
                    treinadores.id_usuario,
                    treinadores.nome,
                    treinadores.cref,
                    treinadores.telefone,
                    treinadores.data_nascimento,
                    treinadores.data_inicio,
                    treinadores.status,
                    usuarios.email,
                    GROUP_CONCAT(DISTINCT equipes.nome ORDER BY equipes.nome SEPARATOR ', ') AS equipes_responsavel
                FROM treinadores
                LEFT JOIN usuarios ON usuarios.id = treinadores.id_usuario
                LEFT JOIN equipes ON equipes.id_treinador_responsavel = treinadores.id
                WHERE treinadores.id = ? AND treinadores.status = ?
                GROUP BY
                    treinadores.id,
                    treinadores.id_usuario,
                    treinadores.nome,
                    treinadores.cref,
                    treinadores.telefone,
                    treinadores.data_nascimento,
                    treinadores.data_inicio,
                    treinadores.status,
                    usuarios.email"
            );
            $stmt->bind_param("is", $id, $statusBanco);
        }else{
            $stmt = $conexao->prepare(
                "SELECT
                    treinadores.id,
                    treinadores.id_usuario,
                    treinadores.nome,
                    treinadores.cref,
                    treinadores.telefone,
                    treinadores.data_nascimento,
                    treinadores.data_inicio,
                    treinadores.status,
                    usuarios.email,
                    GROUP_CONCAT(DISTINCT equipes.nome ORDER BY equipes.nome SEPARATOR ', ') AS equipes_responsavel
                FROM treinadores
                LEFT JOIN usuarios ON usuarios.id = treinadores.id_usuario
                LEFT JOIN equipes ON equipes.id_treinador_responsavel = treinadores.id
                WHERE treinadores.id = ?
                GROUP BY
                    treinadores.id,
                    treinadores.id_usuario,
                    treinadores.nome,
                    treinadores.cref,
                    treinadores.telefone,
                    treinadores.data_nascimento,
                    treinadores.data_inicio,
                    treinadores.status,
                    usuarios.email"
            );
            $stmt->bind_param("i", $id);
        }
    }else{
        if($filtrarStatus){
            $stmt = $conexao->prepare(
                "SELECT
                    treinadores.id,
                    treinadores.id_usuario,
                    treinadores.nome,
                    treinadores.cref,
                    treinadores.telefone,
                    treinadores.data_nascimento,
                    treinadores.data_inicio,
                    treinadores.status,
                    usuarios.email,
                    GROUP_CONCAT(DISTINCT equipes.nome ORDER BY equipes.nome SEPARATOR ', ') AS equipes_responsavel
                FROM treinadores
                LEFT JOIN usuarios ON usuarios.id = treinadores.id_usuario
                LEFT JOIN equipes ON equipes.id_treinador_responsavel = treinadores.id
                WHERE treinadores.status = ?
                GROUP BY
                    treinadores.id,
                    treinadores.id_usuario,
                    treinadores.nome,
                    treinadores.cref,
                    treinadores.telefone,
                    treinadores.data_nascimento,
                    treinadores.data_inicio,
                    treinadores.status,
                    usuarios.email
                ORDER BY treinadores.nome ASC"
            );
            $stmt->bind_param("s", $statusBanco);
        }else{
            $stmt = $conexao->prepare(
                "SELECT
                    treinadores.id,
                    treinadores.id_usuario,
                    treinadores.nome,
                    treinadores.cref,
                    treinadores.telefone,
                    treinadores.data_nascimento,
                    treinadores.data_inicio,
                    treinadores.status,
                    usuarios.email,
                    GROUP_CONCAT(DISTINCT equipes.nome ORDER BY equipes.nome SEPARATOR ', ') AS equipes_responsavel
                FROM treinadores
                LEFT JOIN usuarios ON usuarios.id = treinadores.id_usuario
                LEFT JOIN equipes ON equipes.id_treinador_responsavel = treinadores.id
                GROUP BY
                    treinadores.id,
                    treinadores.id_usuario,
                    treinadores.nome,
                    treinadores.cref,
                    treinadores.telefone,
                    treinadores.data_nascimento,
                    treinadores.data_inicio,
                    treinadores.status,
                    usuarios.email
                ORDER BY treinadores.nome ASC"
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

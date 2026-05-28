<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function usuario_logado_id()
{
    return (int) ($_SESSION['usuario_id'] ?? 0);
}

function usuario_logado_nivel()
{
    return (int) ($_SESSION['id_nivel'] ?? 0);
}

function responder_sem_permissao($mensagem = 'Sem permissao para acessar este recurso.')
{
    if (!headers_sent()) {
        header("Content-type:application/json;charset:utf-8");
    }

    echo json_encode([
        'status' => 'nok',
        'mensagem' => $mensagem,
        'data' => []
    ]);
    exit;
}

function exigir_usuario_logado()
{
    if (usuario_logado_id() <= 0 || usuario_logado_nivel() <= 0) {
        responder_sem_permissao('Sessao expirada. Faca login novamente.');
    }
}

function exigir_admin()
{
    exigir_usuario_logado();
    if (usuario_logado_nivel() !== 1) {
        responder_sem_permissao();
    }
}

function exigir_admin_ou_treinador()
{
    exigir_usuario_logado();
    if (!in_array(usuario_logado_nivel(), [1, 2], true)) {
        responder_sem_permissao();
    }
}

function treinador_logado_id($conexao)
{
    $stmt = $conexao->prepare("SELECT id FROM treinadores WHERE id_usuario = ? LIMIT 1");
    $idUsuario = usuario_logado_id();
    $stmt->bind_param("i", $idUsuario);
    $stmt->execute();
    $treinador = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    return (int) ($treinador['id'] ?? 0);
}

function atleta_logado_id($conexao)
{
    $stmt = $conexao->prepare("SELECT id FROM atletas WHERE id_usuario = ? LIMIT 1");
    $idUsuario = usuario_logado_id();
    $stmt->bind_param("i", $idUsuario);
    $stmt->execute();
    $atleta = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    return (int) ($atleta['id'] ?? 0);
}

function equipe_permitida($conexao, $idEquipe)
{
    $idEquipe = (int) $idEquipe;

    if ($idEquipe <= 0) {
        return false;
    }

    if (usuario_logado_nivel() === 1) {
        return true;
    }

    if (usuario_logado_nivel() === 2) {
        $idTreinador = treinador_logado_id($conexao);
        $stmt = $conexao->prepare("SELECT id FROM equipes WHERE id = ? AND id_treinador_responsavel = ? LIMIT 1");
        $stmt->bind_param("ii", $idEquipe, $idTreinador);
    } elseif (usuario_logado_nivel() === 3) {
        $idAtleta = atleta_logado_id($conexao);
        $stmt = $conexao->prepare("SELECT id FROM atletas WHERE id = ? AND id_equipe = ? LIMIT 1");
        $stmt->bind_param("ii", $idAtleta, $idEquipe);
    } else {
        return false;
    }

    $stmt->execute();
    $permitido = (bool) $stmt->get_result()->fetch_assoc();
    $stmt->close();

    return $permitido;
}

function atleta_permitido($conexao, $idAtleta)
{
    $idAtleta = (int) $idAtleta;

    if ($idAtleta <= 0) {
        return false;
    }

    if (usuario_logado_nivel() === 1) {
        return true;
    }

    if (usuario_logado_nivel() === 3) {
        return atleta_logado_id($conexao) === $idAtleta;
    }

    if (usuario_logado_nivel() === 2) {
        $idTreinador = treinador_logado_id($conexao);
        $stmt = $conexao->prepare("
            SELECT atletas.id
            FROM atletas
            INNER JOIN equipes ON equipes.id = atletas.id_equipe
            WHERE atletas.id = ? AND equipes.id_treinador_responsavel = ?
            LIMIT 1
        ");
        $stmt->bind_param("ii", $idAtleta, $idTreinador);
        $stmt->execute();
        $permitido = (bool) $stmt->get_result()->fetch_assoc();
        $stmt->close();

        return $permitido;
    }

    return false;
}

function treino_permitido($conexao, $idTreino)
{
    $idTreino = (int) $idTreino;

    if ($idTreino <= 0) {
        return false;
    }

    if (usuario_logado_nivel() === 1) {
        return true;
    }

    if (usuario_logado_nivel() === 2) {
        $idTreinador = treinador_logado_id($conexao);
        $stmt = $conexao->prepare("SELECT id FROM treinos WHERE id = ? AND id_treinador = ? LIMIT 1");
        $stmt->bind_param("ii", $idTreino, $idTreinador);
    } elseif (usuario_logado_nivel() === 3) {
        $idAtleta = atleta_logado_id($conexao);
        $stmt = $conexao->prepare("SELECT id FROM treino_atletas WHERE id_treino = ? AND id_atleta = ? LIMIT 1");
        $stmt->bind_param("ii", $idTreino, $idAtleta);
    } else {
        return false;
    }

    $stmt->execute();
    $permitido = (bool) $stmt->get_result()->fetch_assoc();
    $stmt->close();

    return $permitido;
}

function treino_atleta_permitido($conexao, $idTreinoAtleta)
{
    $idTreinoAtleta = (int) $idTreinoAtleta;

    if ($idTreinoAtleta <= 0) {
        return false;
    }

    if (usuario_logado_nivel() === 1) {
        return true;
    }

    if (usuario_logado_nivel() === 3) {
        $idAtleta = atleta_logado_id($conexao);
        $stmt = $conexao->prepare("SELECT id FROM treino_atletas WHERE id = ? AND id_atleta = ? LIMIT 1");
        $stmt->bind_param("ii", $idTreinoAtleta, $idAtleta);
    } elseif (usuario_logado_nivel() === 2) {
        $idTreinador = treinador_logado_id($conexao);
        $stmt = $conexao->prepare("
            SELECT treino_atletas.id
            FROM treino_atletas
            INNER JOIN atletas ON atletas.id = treino_atletas.id_atleta
            INNER JOIN equipes ON equipes.id = atletas.id_equipe
            WHERE treino_atletas.id = ? AND equipes.id_treinador_responsavel = ?
            LIMIT 1
        ");
        $stmt->bind_param("ii", $idTreinoAtleta, $idTreinador);
    } else {
        return false;
    }

    $stmt->execute();
    $permitido = (bool) $stmt->get_result()->fetch_assoc();
    $stmt->close();

    return $permitido;
}

function desempenho_permitido($conexao, $idDesempenho)
{
    $idDesempenho = (int) $idDesempenho;

    if ($idDesempenho <= 0) {
        return false;
    }

    $stmt = $conexao->prepare("SELECT id_treino_atleta FROM desempenho_atleta WHERE id = ? LIMIT 1");
    $stmt->bind_param("i", $idDesempenho);
    $stmt->execute();
    $desempenho = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$desempenho) {
        return false;
    }

    return treino_atleta_permitido($conexao, (int) $desempenho['id_treino_atleta']);
}

<?php
session_start();
include_once(__DIR__ . '/conexao.php');

function resposta_json($payload) {
    header("Content-type:application/json;charset:utf-8");
    echo json_encode($payload);
    exit;
}

function encerrar_sessao() {
    if (session_status() === PHP_SESSION_ACTIVE) {
        session_unset();
        session_destroy();
    }
}

if (
    !isset($_SESSION['usuario_id']) ||
    !isset($_SESSION['id_nivel']) ||
    !isset($_SESSION['session_key'])
) {
    resposta_json([
        'status' => 'nok',
        'mensagem' => 'Sessão inválida.'
    ]);
}

$chaveCabecalho = $_SERVER['HTTP_X_SESSION_KEY'] ?? '';
$chaveSessao = (string) ($_SESSION['session_key'] ?? '');

if ($chaveCabecalho === '' || $chaveCabecalho !== $chaveSessao) {
    encerrar_sessao();
    resposta_json([
        'status' => 'nok',
        'mensagem' => 'Sessão expirada.'
    ]);
}

if (!empty($conexao_error)) {
    resposta_json([
        'status' => 'nok',
        'mensagem' => 'Erro de conexão com o banco.'
    ]);
}

$usuarioId = (int) $_SESSION['usuario_id'];

if ($usuarioId <= 0) {
    encerrar_sessao();
    resposta_json([
        'status' => 'nok',
        'mensagem' => 'Sessão inválida.'
    ]);
}

$stmtUsuario = $conexao->prepare(
    "SELECT
        usuarios.id,
        usuarios.email,
        usuarios.id_nivel,
        usuarios.status,
        nivel_acesso.nome AS nivel_nome
     FROM usuarios
     LEFT JOIN nivel_acesso ON nivel_acesso.id = usuarios.id_nivel
     WHERE usuarios.id = ?
     LIMIT 1"
);

if (!$stmtUsuario) {
    resposta_json([
        'status' => 'nok',
        'mensagem' => 'Falha ao validar usuário.'
    ]);
}

$stmtUsuario->bind_param("i", $usuarioId);
$stmtUsuario->execute();
$resultadoUsuario = $stmtUsuario->get_result();
$usuario = $resultadoUsuario->fetch_assoc();
$stmtUsuario->close();

if (!$usuario) {
    encerrar_sessao();
    resposta_json([
        'status' => 'nok',
        'mensagem' => 'Usuário não encontrado.'
    ]);
}

$statusUsuario = strtolower(trim($usuario['status'] ?? ''));
if ($statusUsuario !== 'ativo' && $statusUsuario !== 'ativa') {
    encerrar_sessao();
    resposta_json([
        'status' => 'nok',
        'mensagem' => 'Usuário inativo.'
    ]);
}

$idNivel = (int) ($usuario['id_nivel'] ?? 0);
$perfil = [
    'tipo' => 'usuario',
    'nome' => $usuario['email'] ?? 'Usuário'
];

if ($idNivel === 1) {
    $perfil = [
        'tipo' => 'admin',
        'nome' => 'Admin'
    ];
} elseif ($idNivel === 2) {
    $stmtTreinador = $conexao->prepare(
        "SELECT id, nome, telefone, cref, data_inicio
         FROM treinadores
         WHERE id_usuario = ?
         LIMIT 1"
    );

    if ($stmtTreinador) {
        $stmtTreinador->bind_param("i", $usuarioId);
        $stmtTreinador->execute();
        $resultadoTreinador = $stmtTreinador->get_result();
        $treinador = $resultadoTreinador->fetch_assoc();
        $stmtTreinador->close();

        if ($treinador) {
            $perfil = [
                'tipo' => 'treinador',
                'id' => (int) $treinador['id'],
                'nome' => $treinador['nome'] ?: ($usuario['email'] ?? 'Treinador'),
                'telefone' => $treinador['telefone'],
                'cref' => $treinador['cref'],
                'data_inicio' => $treinador['data_inicio']
            ];
        } else {
            $perfil = [
                'tipo' => 'treinador',
                'nome' => $usuario['email'] ?? 'Treinador'
            ];
        }
    }
} elseif ($idNivel === 3) {
    $stmtAtleta = $conexao->prepare(
        "SELECT
            atletas.id,
            atletas.nome,
            atletas.altura,
            atletas.peso,
            atletas.id_equipe,
            equipes.nome AS equipe_nome
         FROM atletas
         LEFT JOIN equipes ON equipes.id = atletas.id_equipe
         WHERE atletas.id_usuario = ?
         LIMIT 1"
    );

    if ($stmtAtleta) {
        $stmtAtleta->bind_param("i", $usuarioId);
        $stmtAtleta->execute();
        $resultadoAtleta = $stmtAtleta->get_result();
        $atleta = $resultadoAtleta->fetch_assoc();
        $stmtAtleta->close();

        if ($atleta) {
            $equipes = [];
            if (!empty($atleta['id_equipe'])) {
                $equipes[] = [
                    'id' => (int) $atleta['id_equipe'],
                    'nome' => $atleta['equipe_nome'] ?: 'Equipe'
                ];
            }

            $perfil = [
                'tipo' => 'atleta',
                'id' => (int) $atleta['id'],
                'nome' => $atleta['nome'] ?: ($usuario['email'] ?? 'Atleta'),
                'altura' => $atleta['altura'],
                'peso' => $atleta['peso'],
                'equipes' => $equipes
            ];
        } else {
            $perfil = [
                'tipo' => 'atleta',
                'nome' => $usuario['email'] ?? 'Atleta',
                'altura' => null,
                'peso' => null,
                'equipes' => []
            ];
        }
    }
}

$usuarioRetorno = [
    'id' => (int) $usuario['id'],
    'email' => $usuario['email'],
    'id_nivel' => $idNivel,
    'nivel_nome' => $usuario['nivel_nome'] ?? '',
    'nome' => $perfil['nome'] ?? ($usuario['email'] ?? 'Usuário'),
    'status' => $usuario['status']
];

$conexao->close();

resposta_json([
    'status' => 'ok',
    'mensagem' => 'Sessão válida.',
    'id' => (int) $usuario['id'],
    'id_nivel' => $idNivel,
    'usuario' => $usuarioRetorno,
    'perfil' => $perfil,
    'data' => [$usuarioRetorno]
]);

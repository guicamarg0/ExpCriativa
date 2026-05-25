<?php
// Inicia a sessão
session_start();
// Inclui conexão com banco
include_once(__DIR__ . '/conexao.php');

// Função para retornar JSON
function resposta_json($payload) {
    header("Content-type:application/json;charset:utf-8");
    echo json_encode($payload);
    exit;
}

// Função para encerrar sessão
function encerrar_sessao() {
    if (session_status() === PHP_SESSION_ACTIVE) {
        session_unset();
        session_destroy();
    }
}

// Verifica se os dados principais da sessão existem
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

// Captura chave enviada no header
$chaveCabecalho = $_SERVER['HTTP_X_SESSION_KEY'] ?? '';
// Captura chave salva na sessão
$chaveSessao = (string) ($_SESSION['session_key'] ?? '');

// Verifica se a chave da sessão é válida
if ($chaveCabecalho === '' || $chaveCabecalho !== $chaveSessao) {
    encerrar_sessao();
    resposta_json([
        'status' => 'nok',
        'mensagem' => 'Sessão expirada.'
    ]);
}

// Verifica conexão com banco
if (!empty($conexao_error)) {
    resposta_json([
        'status' => 'nok',
        'mensagem' => 'Erro de conexão com o banco.'
    ]);
}

// Obtém ID do usuário logado
$usuarioId = (int) $_SESSION['usuario_id'];

// Verifica se ID é válido
if ($usuarioId <= 0) {
    encerrar_sessao();
    resposta_json([
        'status' => 'nok',
        'mensagem' => 'Sessão inválida.'
    ]);
}

// Consulta dados principais do usuário
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

// Verifica se query foi preparada
if (!$stmtUsuario) {
    resposta_json([
        'status' => 'nok',
        'mensagem' => 'Falha ao validar usuário.'
    ]);
}

// Vincula ID na query
$stmtUsuario->bind_param("i", $usuarioId);
// Executa consulta
$stmtUsuario->execute();
// Obtém resultado
$resultadoUsuario = $stmtUsuario->get_result();
// Converte resultado em array
$usuario = $resultadoUsuario->fetch_assoc();
// Fecha statement
$stmtUsuario->close();

// Verifica se usuário existe
if (!$usuario) {
    encerrar_sessao();
    resposta_json([
        'status' => 'nok',
        'mensagem' => 'Usuário não encontrado.'
    ]);
}

// Obtém status do usuário
$statusUsuario = strtolower(($usuario['status'] ?? ''));
// Verifica se usuário está ativo
if ($statusUsuario !== 'ativo' && $statusUsuario !== 'ativa') {
    encerrar_sessao();
    resposta_json([
        'status' => 'nok',
        'mensagem' => 'Usuário inativo.'
    ]);
}

// Obtém nível de acesso
$idNivel = (int) ($usuario['id_nivel'] ?? 0);

// Perfil padrão
$perfil = [
    'tipo' => 'usuario',
    'nome' => $usuario['email'] ?? 'Usuário'
];

// Perfil administrador
if ($idNivel === 1) {
    $perfil = [
        'tipo' => 'admin',
        'nome' => 'Admin'
    ];

// Perfil treinador
} elseif ($idNivel === 2) {
    // Busca dados do treinador
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

        // Se encontrou treinador
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
            // Caso não encontre treinador
            $perfil = [
                'tipo' => 'treinador',
                'nome' => $usuario['email'] ?? 'Treinador'
            ];
        }
    }

// Perfil atleta
} elseif ($idNivel === 3) {
    // Busca dados do atleta
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

        // Se encontrou atleta
        if ($atleta) {
            $equipes = [];
            // Verifica se atleta possui equipe
            if (!empty($atleta['id_equipe'])) {
                $equipes[] = [
                    'id' => (int) $atleta['id_equipe'],
                    'nome' => $atleta['equipe_nome'] ?: 'Equipe'
                ];
            }

            // Monta perfil atleta
            $perfil = [
                'tipo' => 'atleta',
                'id' => (int) $atleta['id'],
                'nome' => $atleta['nome'] ?: ($usuario['email'] ?? 'Atleta'),
                'altura' => $atleta['altura'],
                'peso' => $atleta['peso'],
                'equipes' => $equipes
            ];

        } else {
            // Caso atleta não seja encontrado
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

// Dados principais do usuário
$usuarioRetorno = [
    'id' => (int) $usuario['id'],
    'email' => $usuario['email'],
    'id_nivel' => $idNivel,
    'nivel_nome' => $usuario['nivel_nome'] ?? '',
    'nome' => $perfil['nome'] ?? ($usuario['email'] ?? 'Usuário'),
    'status' => $usuario['status']
];

// Fecha conexão com banco
$conexao->close();

// Retorna sucesso
resposta_json([
    'status' => 'ok',
    'mensagem' => 'Sessão válida.',
    'id' => (int) $usuario['id'],
    'id_nivel' => $idNivel,
    'usuario' => $usuarioRetorno,
    'perfil' => $perfil,
    'data' => [$usuarioRetorno]
]);
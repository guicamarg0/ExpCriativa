<?php
session_start();

session_unset();
session_destroy();

if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}

$retorno = [
    'status' => 'ok',
    'mensagem' => 'Sessão encerrada.',
    'data' => []
];

header("Content-type:application/json;charset:utf-8");
echo json_encode($retorno);

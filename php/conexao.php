<?php
// Define as variáveis de conexão com o banco de dados
$servidor = "localhost:3305"; // endereço do servidor MySQL (com porta 3305)
$usuario  = "root";           // usuário do banco
$senha    = "";               // senha do banco (vazia no XAMPP/WAMP padrão)
$nome_banco = "mitra_db";     // nome do banco de dados

// Cria conexão com o MySQL usando mysqli
$conexao = new mysqli($servidor, $usuario, $senha, $nome_banco);
// Variável para armazenar erro de conexão (caso exista)
$conexao_error = null;

// Verifica se houve erro na conexão
if ($conexao->connect_error) {
    $conexao_error = $conexao->connect_error; // salva a mensagem de erro
}
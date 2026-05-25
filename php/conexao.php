<?php
// Variáveis de conexão com o Banco de Dados
$servidor = "localhost:3306";
$usuario  = "root";
$senha    = "PUC@1234";
$nome_banco = "mitra_db";

$conexao = new mysqli($servidor, $usuario, $senha, $nome_banco);
$conexao_error = null;
if($conexao->connect_error){
    $conexao_error = $conexao->connect_error;
}
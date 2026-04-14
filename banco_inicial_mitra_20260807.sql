DROP DATABASE IF EXISTS mitra_db;
 CREATE DATABASE mitra_db;
 USE mitra_db;
 
-- Nível de acesso
 CREATE TABLE nivel_acesso (
     id INT AUTO_INCREMENT PRIMARY KEY,
     nome VARCHAR(50) NOT NULL UNIQUE,
     status VARCHAR(20) DEFAULT 'ativo'
 );
 
-- genero
 CREATE TABLE genero (
     id INT AUTO_INCREMENT PRIMARY KEY,
     nome VARCHAR(20) NOT NULL UNIQUE,
     status VARCHAR(20) DEFAULT 'ativo'
 );
 
 -- usuários
 CREATE TABLE usuarios (
     id INT AUTO_INCREMENT PRIMARY KEY,
     email VARCHAR(100) UNIQUE NOT NULL,
     senha VARCHAR(255) NOT NULL,
     id_nivel INT,
     status VARCHAR(20) DEFAULT 'ativo',
 
     FOREIGN KEY (id_nivel) REFERENCES nivel_acesso(id)
 );
 
 -- Modalidades
 CREATE TABLE modalidades (
     id INT AUTO_INCREMENT PRIMARY KEY,
     nome VARCHAR(50) NOT NULL UNIQUE,
     status VARCHAR(20) DEFAULT 'ativo'
 );
 
 -- Treinadores
 CREATE TABLE treinadores (
     id INT AUTO_INCREMENT PRIMARY KEY,
 
     id_usuario INT UNIQUE,
 
     nome VARCHAR(100) NOT NULL,
     cref VARCHAR(20) NOT NULL UNIQUE,
     telefone VARCHAR(20),
 
     data_nascimento DATE,
     data_inicio DATE,
 
     status VARCHAR(20) DEFAULT 'ativo',
 
     FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
 );
 
 -- equipes
 CREATE TABLE equipes (
     id INT AUTO_INCREMENT PRIMARY KEY,
 
     nome VARCHAR(100) NOT NULL,
     descricao TEXT,
 
     id_modalidade INT,
     id_genero INT,
     id_treinador_responsavel INT,
     categoria VARCHAR(50),
 
     status VARCHAR(20) DEFAULT 'ativa',
 
     FOREIGN KEY (id_modalidade) REFERENCES modalidades(id) ON DELETE CASCADE,
     FOREIGN KEY (id_genero) REFERENCES genero(id),
     FOREIGN KEY (id_treinador_responsavel) REFERENCES treinadores(id) ON DELETE SET NULL
 );
 
 -- atletas
 CREATE TABLE atletas (
     id INT AUTO_INCREMENT PRIMARY KEY,
 
     id_usuario INT UNIQUE,
     id_equipe INT,
     id_genero INT,
 
     nome VARCHAR(100) NOT NULL,
 
     data_nascimento DATE,
 
     peso DECIMAL(5,2),
     altura DECIMAL(4,2),
 
     data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 
     status VARCHAR(20) DEFAULT 'ativo',
 
     FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
     FOREIGN KEY (id_equipe) REFERENCES equipes(id) ON DELETE SET NULL,
     FOREIGN KEY (id_genero) REFERENCES genero(id)
 );
 
 
 -- nível de acesso
 INSERT INTO nivel_acesso (nome) VALUES
 ('Admin'),
 ('Treinador'),
 ('Atleta');
 
 INSERT INTO genero (nome) VALUES
 ('Masculino'),
 ('Feminino'),
 ('Misto');
 
 INSERT INTO modalidades (nome) VALUES
 ('Futebol'),
 ('Musculação'),
 ('Crossfit');
 
 -- admin
 INSERT INTO usuarios (email, senha, id_nivel)
 VALUES ('admin@mitra.com', '123', 1);
 
 -- treinador
 INSERT INTO usuarios (email, senha, id_nivel)
 VALUES ('treinador@mitra.com', '123', 2);
 SET @id_usuario_treinador = LAST_INSERT_ID();
 
 INSERT INTO treinadores (
     id_usuario, nome, cref, telefone, data_nascimento, data_inicio
 )
 VALUES (
     @id_usuario_treinador, 'Guilherme', '123456-G/PR', '41999999999', '1990-05-10', '2022-01-01'
 );
 SET @id_treinador = LAST_INSERT_ID();
 
 -- equipe
 INSERT INTO equipes (
     nome, descricao, id_modalidade, id_genero, id_treinador_responsavel, categoria
 )
 VALUES (
     'Time Principal', 'Equipe principal', 1, 1, @id_treinador, 'Adulto'
 );
 SET @id_equipe = LAST_INSERT_ID();
 
 -- atleta
 INSERT INTO usuarios (email, senha, id_nivel)
 VALUES ('atleta@mitra.com', '123', 3);
 SET @id_usuario_atleta = LAST_INSERT_ID();
 
 INSERT INTO atletas (
     id_usuario, id_equipe, id_genero, nome, data_nascimento, peso, altura
 )
 VALUES (
     @id_usuario_atleta, @id_equipe, 1, 'João Silva', '2000-08-15', 75.50, 1.78
 );
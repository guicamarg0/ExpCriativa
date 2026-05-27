 -- =====================================
 -- DROP E CREATE DATABASE
 -- =====================================
 DROP DATABASE IF EXISTS mitra_db;
 CREATE DATABASE mitra_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
 USE mitra_db;
 
 -- =====================================
 -- 1. NÍVEL DE ACESSO
 -- =====================================
 CREATE TABLE nivel_acesso (
     id INT AUTO_INCREMENT PRIMARY KEY,
     nome VARCHAR(50) NOT NULL UNIQUE,
     status VARCHAR(20) DEFAULT 'ativo'
 );
 
 -- =====================================
 -- 2. GÊNERO
 -- =====================================
 CREATE TABLE genero (
     id INT AUTO_INCREMENT PRIMARY KEY,
     nome VARCHAR(20) NOT NULL UNIQUE,
     status VARCHAR(20) DEFAULT 'ativo'
 );
 
 -- =====================================
 -- 3. USUÁRIOS
 -- =====================================
 CREATE TABLE usuarios (
     id INT AUTO_INCREMENT PRIMARY KEY,
     email VARCHAR(100) UNIQUE NOT NULL,
     senha VARCHAR(255) NOT NULL,
     id_nivel INT,
     status VARCHAR(20) DEFAULT 'ativo',
 
     FOREIGN KEY (id_nivel) REFERENCES nivel_acesso(id)
 );
 
 -- =====================================
 -- 4. MODALIDADES
 -- =====================================
 CREATE TABLE modalidades (
     id INT AUTO_INCREMENT PRIMARY KEY,
     nome VARCHAR(50) NOT NULL UNIQUE,
     status VARCHAR(20) DEFAULT 'ativo'
 );
 
 -- =====================================
 -- 5. TREINADORES
 -- =====================================
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
 
 -- =====================================
 -- 6. EQUIPES
 -- =====================================
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
 
 -- =====================================
 -- 7. ATLETAS
 -- =====================================
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
 
 -- =====================================
 -- DADOS INICIAIS
 -- =====================================
 
 -- NÍVEL DE ACESSO
 INSERT INTO nivel_acesso (nome) VALUES
 ('Admin'),
 ('Treinador'),
 ('Atleta');
 
 -- GÊNEROS
 INSERT INTO genero (nome) VALUES
 ('Masculino'),
 ('Feminino'),
 ('Misto');
 
 -- MODALIDADES
 INSERT INTO modalidades (nome) VALUES
 ('Futebol'),
 ('Musculação'),
 ('Crossfit');
 
 -- USUÁRIO ADMIN
 INSERT INTO usuarios (email, senha, id_nivel)
 VALUES ('admin@mitra.com', '123', 1);
 
 -- TREINADOR
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
 
 -- EQUIPE (com treinador responsável)
 INSERT INTO equipes (
     nome, descricao, id_modalidade, id_genero, id_treinador_responsavel, categoria
 )
 VALUES (
     'Time Principal', 'Equipe principal', 1, 1, @id_treinador, 'Adulto'
 );
 SET @id_equipe = LAST_INSERT_ID();
 
 -- ATLETA
 INSERT INTO usuarios (email, senha, id_nivel)
 VALUES ('atleta@mitra.com', '123', 3);
 SET @id_usuario_atleta = LAST_INSERT_ID();
 
 INSERT INTO atletas (
     id_usuario, id_equipe, id_genero, nome, data_nascimento, peso, altura
 )
 VALUES (
     @id_usuario_atleta, @id_equipe, 1, 'João Silva', '2000-08-15', 75.50, 1.78
 );

-- =====================================
-- 8. TREINOS, PRESENÇAS E DESEMPENHO
-- =====================================
CREATE TABLE treinos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_equipe INT,
    data_inicio DATETIME NOT NULL,
    tipo VARCHAR(100),
    treinador VARCHAR(100),
    descricao TEXT,
    status VARCHAR(20) DEFAULT 'agendado',
    FOREIGN KEY (id_equipe) REFERENCES equipes(id) ON DELETE SET NULL
);

CREATE TABLE presencas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_treino INT,
    id_atleta INT,
    presente TINYINT(1) DEFAULT 0,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_treino) REFERENCES treinos(id) ON DELETE CASCADE,
    FOREIGN KEY (id_atleta) REFERENCES atletas(id) ON DELETE CASCADE
);

CREATE TABLE desempenho (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_atleta INT,
    data_registro DATE,
    velocidade DECIMAL(5,2),
    resistencia INT,
    observacao TEXT,
    FOREIGN KEY (id_atleta) REFERENCES atletas(id) ON DELETE CASCADE
);

-- Exemplo: treinos e presenças iniciais
INSERT INTO treinos (id_equipe, data_inicio, tipo, treinador, descricao) VALUES
(@id_equipe, DATE_ADD(NOW(), INTERVAL 3 DAY), 'Treino tático', 'Guilherme', 'Treino focado em posicionamento'),
(@id_equipe, DATE_ADD(NOW(), INTERVAL 10 DAY), 'Treino físico', 'Guilherme', 'Resistência e velocidade');
SET @id_treino1 = LAST_INSERT_ID();

INSERT INTO presencas (id_treino, id_atleta, presente) VALUES
(@id_treino1, (SELECT id FROM atletas WHERE id_usuario = @id_usuario_atleta), 1);

INSERT INTO desempenho (id_atleta, data_registro, velocidade, resistencia) VALUES
((SELECT id FROM atletas WHERE id_usuario = @id_usuario_atleta), DATE_SUB(CURDATE(), INTERVAL 30 DAY), 19.2, 28),
((SELECT id FROM atletas WHERE id_usuario = @id_usuario_atleta), DATE_SUB(CURDATE(), INTERVAL 20 DAY), 19.8, 29),
((SELECT id FROM atletas WHERE id_usuario = @id_usuario_atleta), DATE_SUB(CURDATE(), INTERVAL 10 DAY), 20.5, 31);
DROP DATABASE IF EXISTS mitra_db;
CREATE DATABASE mitra_db;
USE mitra_db;

-- =====================================================
-- TABELAS BASE
-- =====================================================

CREATE TABLE nivel_acesso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'ativo'
);

CREATE TABLE genero (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(20) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'ativo'
);

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    id_nivel INT,
    status VARCHAR(20) DEFAULT 'ativo',

    FOREIGN KEY (id_nivel) REFERENCES nivel_acesso(id)
);

CREATE TABLE modalidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'ativo'
);

CREATE TABLE exercicios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL UNIQUE,
    descricao TEXT,
    status VARCHAR(20) DEFAULT 'ativo'
);

CREATE TABLE modalidade_exercicio (
    id_modalidade INT NOT NULL,
    id_exercicio INT NOT NULL,

    PRIMARY KEY (id_modalidade, id_exercicio),

    FOREIGN KEY (id_modalidade) REFERENCES modalidades(id) ON DELETE CASCADE,
    FOREIGN KEY (id_exercicio) REFERENCES exercicios(id) ON DELETE CASCADE
);

-- =====================================================
-- TREINADORES, EQUIPES E ATLETAS
-- =====================================================

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

CREATE TABLE atletas (
    id INT AUTO_INCREMENT PRIMARY KEY,

    id_usuario INT UNIQUE,
    id_equipe INT,
    id_genero INT,

    nome VARCHAR(100) NOT NULL,
    posicao VARCHAR(50),

    data_nascimento DATE,

    peso DECIMAL(5,2),
    altura DECIMAL(4,2),

    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    status VARCHAR(20) DEFAULT 'ativo',

    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_equipe) REFERENCES equipes(id) ON DELETE SET NULL,
    FOREIGN KEY (id_genero) REFERENCES genero(id)
);

-- =====================================================
-- MÉTRICAS E EXERCÍCIOS
-- =====================================================

CREATE TABLE metricas (
    id INT AUTO_INCREMENT PRIMARY KEY,

    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    unidade_medida VARCHAR(30),

    tipo VARCHAR(30) NOT NULL DEFAULT 'numero',

    status VARCHAR(20) DEFAULT 'ativo'
);

CREATE TABLE exercicio_metricas (
    id_exercicio INT NOT NULL,
    id_metrica INT NOT NULL,

    PRIMARY KEY (id_exercicio, id_metrica),

    FOREIGN KEY (id_exercicio) REFERENCES exercicios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_metrica) REFERENCES metricas(id) ON DELETE CASCADE
);

-- =====================================================
-- TREINOS
-- =====================================================

CREATE TABLE treinos (
    id INT AUTO_INCREMENT PRIMARY KEY,

    id_treinador INT NOT NULL,
    id_modalidade INT,

    titulo VARCHAR(100) NOT NULL,
    data_inicio DATETIME NOT NULL,
    data_fim DATETIME,

    descricao TEXT,

    status VARCHAR(20) DEFAULT 'ativo',

    FOREIGN KEY (id_treinador) REFERENCES treinadores(id) ON DELETE CASCADE,
    FOREIGN KEY (id_modalidade) REFERENCES modalidades(id) ON DELETE SET NULL
);

CREATE TABLE treino_exercicios (
    id_treino INT NOT NULL,
    id_exercicio INT NOT NULL,

    PRIMARY KEY (id_treino, id_exercicio),

    FOREIGN KEY (id_treino) REFERENCES treinos(id) ON DELETE CASCADE,
    FOREIGN KEY (id_exercicio) REFERENCES exercicios(id) ON DELETE CASCADE
);

CREATE TABLE treino_atletas (
    id INT AUTO_INCREMENT PRIMARY KEY,

    id_treino INT NOT NULL,
    id_atleta INT NOT NULL,

    status_presenca VARCHAR(20) DEFAULT 'presente',
    observacao TEXT,

    UNIQUE (id_treino, id_atleta),

    FOREIGN KEY (id_treino) REFERENCES treinos(id) ON DELETE CASCADE,
    FOREIGN KEY (id_atleta) REFERENCES atletas(id) ON DELETE CASCADE
);

-- =====================================================
-- PRESENÇAS, PROGRESSO E DESEMPENHO
-- =====================================================

CREATE TABLE presencas (
    id INT AUTO_INCREMENT PRIMARY KEY,

    id_atleta INT NOT NULL,
    id_treino INT NOT NULL,

    presente TINYINT(1) DEFAULT 0,
    observacao TEXT,

    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (id_atleta, id_treino),

    FOREIGN KEY (id_atleta) REFERENCES atletas(id) ON DELETE CASCADE,
    FOREIGN KEY (id_treino) REFERENCES treinos(id) ON DELETE CASCADE
);

CREATE TABLE progresso (
    id INT AUTO_INCREMENT PRIMARY KEY,

    id_atleta INT NOT NULL,
    id_treino INT,

    data DATE NOT NULL,

    peso DECIMAL(5,2),
    altura DECIMAL(4,2),

    observacao TEXT,

    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_atleta) REFERENCES atletas(id) ON DELETE CASCADE,
    FOREIGN KEY (id_treino) REFERENCES treinos(id) ON DELETE SET NULL
);

CREATE TABLE desempenho_atleta (
    id INT AUTO_INCREMENT PRIMARY KEY,

    id_treino_atleta INT NOT NULL,
    id_exercicio INT NOT NULL,
    id_metrica INT NOT NULL,

    valor VARCHAR(30) NOT NULL,
    observacao TEXT,

    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_treino_atleta) REFERENCES treino_atletas(id) ON DELETE CASCADE,
    FOREIGN KEY (id_exercicio) REFERENCES exercicios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_metrica) REFERENCES metricas(id) ON DELETE CASCADE
);

-- =====================================================
-- INSERTS BÁSICOS
-- =====================================================

INSERT INTO nivel_acesso (nome, status) VALUES
('Admin', 'ativo'),
('Treinador', 'ativo'),
('Atleta', 'ativo');

INSERT INTO genero (nome, status) VALUES
('Masculino', 'ativo'),
('Feminino', 'ativo'),
('Misto', 'ativo');

INSERT INTO usuarios (email, senha, id_nivel, status)
VALUES ('admin@mitra.com', '123', 1, 'ativo');

INSERT INTO metricas (nome, descricao, unidade_medida, tipo, status) VALUES
('Percepcao de esforco', 'Escala de esforço percebido pelo atleta', '0-10', 'escala_0_10', 'ativo'),
('Acertos', 'Quantidade de acertos no exercício', 'un', 'numero', 'ativo'),
('Tentativas', 'Quantidade de tentativas realizadas', 'un', 'numero', 'ativo'),
('Aproveitamento', 'Relação entre acertos e tentativas', 'acertos/tentativas', 'aproveitamento', 'ativo'),
('Repeticoes', 'Quantidade de repetições realizadas', 'rep', 'numero', 'ativo'),
('Tempo', 'Tempo total do exercício', 'min', 'numero', 'ativo'),
('Carga', 'Carga utilizada no exercício físico', 'kg', 'numero', 'ativo');

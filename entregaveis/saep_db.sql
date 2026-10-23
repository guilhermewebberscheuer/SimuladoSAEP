-- Banco de dados: Academia de Ginástica
-- Arquivo: saep_db.sql
-- Script de exemplo para MySQL 8+

CREATE DATABASE IF NOT EXISTS academia;
USE academia;

-- 1. Usuários que podem acessar o sistema
CREATE TABLE IF NOT EXISTS usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL
);

-- 2. Alunos da academia
CREATE TABLE IF NOT EXISTS aluno (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf_criptografado TEXT NOT NULL,
    email VARCHAR(150),
    telefone VARCHAR(20)
);

-- 3. Planos de treino vinculados a um aluno
CREATE TABLE IF NOT EXISTS plano_treino (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    CONSTRAINT fk_plano_aluno
        FOREIGN KEY (aluno_id) REFERENCES aluno(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 4. Agendamentos de aulas
CREATE TABLE IF NOT EXISTS agendamento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    plano_id INT NOT NULL,
    data_aula DATETIME NOT NULL,
    CONSTRAINT fk_agendamento_aluno
        FOREIGN KEY (aluno_id) REFERENCES aluno(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_agendamento_plano
        FOREIGN KEY (plano_id) REFERENCES plano_treino(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ATENÇÃO:
-- Os dados abaixo são apenas dados fictícios para desenvolvimento.
-- As senhas usam valores ilustrativos de hash, não credenciais reais.
-- O CPF deve ser criptografado pela aplicação antes de ser salvo.
-- Não grave senhas em texto puro nem use estes hashes ilustrativos em produção.

INSERT INTO usuario (nome, email, senha_hash) VALUES
('Ana Souza', 'ana@academia.local', '$2b$12$EXEMPLO_HASH_BCRYPT_NAO_VALIDO'),
('Bruno Lima', 'bruno@academia.local', '$2b$12$EXEMPLO_HASH_BCRYPT_NAO_VALIDO'),
('Carla Mendes', 'carla@academia.local', '$2b$12$EXEMPLO_HASH_BCRYPT_NAO_VALIDO');

-- CPFs fictícios já representados como texto criptografado ilustrativo.
-- Substitua por valores realmente criptografados pela aplicação antes de uso real.
INSERT INTO aluno (nome, cpf_criptografado, email, telefone) VALUES
('Diego Alves', 'CPF_CRIPTOGRAFADO_EXEMPLO_1', 'diego@exemplo.local', '(47) 90000-0001'),
('Elisa Rocha', 'CPF_CRIPTOGRAFADO_EXEMPLO_2', 'elisa@exemplo.local', '(47) 90000-0002'),
('Felipe Costa', 'CPF_CRIPTOGRAFADO_EXEMPLO_3', 'felipe@exemplo.local', '(47) 90000-0003');

INSERT INTO plano_treino (aluno_id, nome, descricao) VALUES
(1, 'Hipertrofia A', 'Treino de membros superiores'),
(2, 'Condicionamento B', 'Treino de condicionamento físico'),
(3, 'Resistência C', 'Treino de resistência muscular');

INSERT INTO agendamento (aluno_id, plano_id, data_aula) VALUES
(1, 1, '2026-10-23 08:00:00'),
(2, 2, '2026-10-23 09:00:00'),
(3, 3, '2026-10-23 10:00:00');


const express = require('express');
const crypto = require('crypto');
const db = require('../lib/db');

const router = express.Router();

function chaveCPF() {
    const chave = process.env.CPF_ENCRYPTION_KEY;

    if (!chave || !/^[0-9a-fA-F]{64}$/.test(chave)) {
        throw new Error('CPF_ENCRYPTION_KEY deve conter 64 caracteres hexadecimais.');
    }

    return Buffer.from(chave, 'hex');
}

function criptografarCPF(cpf) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', chaveCPF(), iv);

    const criptografado = Buffer.concat([
        cipher.update(cpf, 'utf8'),
        cipher.final()
    ]);

    const tag = cipher.getAuthTag();

    return Buffer.concat([iv, tag, criptografado]).toString('base64');
}

function descriptografarCPF(valor) {
    const dados = Buffer.from(valor, 'base64');

    if (dados.length < 29) {
        throw new Error('CPF criptografado inválido.');
    }

    const iv = dados.subarray(0, 12);
    const tag = dados.subarray(12, 28);
    const conteudo = dados.subarray(28);

    const decipher = crypto.createDecipheriv('aes-256-gcm', chaveCPF(), iv);
    decipher.setAuthTag(tag);

    return Buffer.concat([
        decipher.update(conteudo),
        decipher.final()
    ]).toString('utf8');
}

function validarAluno(dados) {
    const { nome, cpf, email, telefone } = dados;

    if (!nome || !nome.trim() || !cpf) {
        return 'Nome e CPF são obrigatórios.';
    }

    if (!/^\d{11}$/.test(cpf.replace(/\D/g, ''))) {
        return 'O CPF deve conter 11 números.';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return 'E-mail inválido.';
    }

    return null;
}

// Listar e buscar alunos
router.get('/', async (req, res) => {
    try {
        const termo = String(req.query.q || '').trim();

        const [alunos] = await db.execute(
            `SELECT id, nome, cpf_criptografado, email, telefone
             FROM aluno
             WHERE nome LIKE ? OR email LIKE ?
             ORDER BY nome`,
            [`%${termo}%`, `%${termo}%`]
        );

        const resultado = alunos.map(aluno => ({
            id: aluno.id,
            nome: aluno.nome,
            cpf: descriptografarCPF(aluno.cpf_criptografado),
            email: aluno.email,
            telefone: aluno.telefone
        }));

        res.json(resultado);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Não foi possível listar os alunos.' });
    }
});

// Cadastrar aluno
router.post('/', async (req, res) => {
    const erroValidacao = validarAluno(req.body);

    if (erroValidacao) {
        return res.status(400).json({ erro: erroValidacao });
    }

    try {
        const { nome, cpf, email, telefone } = req.body;
        const cpfCriptografado = criptografarCPF(cpf.replace(/\D/g, ''));

        const [resultado] = await db.execute(
            `INSERT INTO aluno (nome, cpf_criptografado, email, telefone)
             VALUES (?, ?, ?, ?)`,
            [nome.trim(), cpfCriptografado, email || null, telefone || null]
        );

        res.status(201).json({
            mensagem: 'Aluno cadastrado com sucesso.',
            id: resultado.insertId
        });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Não foi possível cadastrar o aluno.' });
    }
});

// Editar aluno existente
router.put('/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ erro: 'ID inválido.' });
    }

    const erroValidacao = validarAluno(req.body);

    if (erroValidacao) {
        return res.status(400).json({ erro: erroValidacao });
    }

    try {
        const { nome, cpf, email, telefone } = req.body;
        const cpfCriptografado = criptografarCPF(cpf.replace(/\D/g, ''));

        const [resultado] = await db.execute(
            `UPDATE aluno
             SET nome = ?, cpf_criptografado = ?, email = ?, telefone = ?
             WHERE id = ?`,
            [nome.trim(), cpfCriptografado, email || null, telefone || null, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: 'Aluno não encontrado.' });
        }

        res.json({ mensagem: 'Aluno atualizado com sucesso.' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Não foi possível atualizar o aluno.' });
    }
});

module.exports = router;

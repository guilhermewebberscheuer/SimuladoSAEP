const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ mensagem: 'Informe o e-mail e a senha.' });
  }

  try {
    const [usuarios] = await db.execute(
      'SELECT id, nome, email, senha_hash FROM usuario WHERE email = ? LIMIT 1',
      [email.trim()]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ mensagem: 'E-mail ou senha inválidos.' });
    }

    const usuario = usuarios[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ mensagem: 'E-mail ou senha inválidos.' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET não foi configurado no arquivo .env');
      return res.status(500).json({ mensagem: 'Configuração de autenticação ausente.' });
    }

    const token = jwt.sign(
      { nome: usuario.nome, email: usuario.email },
      process.env.JWT_SECRET,
      { subject: String(usuario.id), expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    return res.json({
      mensagem: 'Login realizado com sucesso.',
      token,
      expiraEm: process.env.JWT_EXPIRES_IN || '15m',
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }
    });
  } catch (erro) {
    console.error('Erro ao realizar login:', erro.message);
    return res.status(500).json({ mensagem: 'Não foi possível realizar o login.' });
  }
});

module.exports = router;

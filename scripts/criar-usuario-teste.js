require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../db');

async function main() {
  const nome = 'Usuário de Teste';
  const email = 'teste@academia.local';
  const senha = 'Academia123!';
  const senhaHash = await bcrypt.hash(senha, 12);

  try {
    await db.execute(
      `INSERT INTO usuario (nome, email, senha_hash)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE nome = VALUES(nome), senha_hash = VALUES(senha_hash)`,
      [nome, email, senhaHash]
    );
    console.log('Usuário de teste criado/atualizado.');
    console.log(`E-mail: ${email}`);
    console.log(`Senha: ${senha}`);
    console.log('Use estas credenciais apenas no ambiente local de teste.');
  } finally {
    await db.end();
  }
}

main().catch((erro) => {
  console.error('Não foi possível criar o usuário:', erro.message);
  process.exitCode = 1;
});

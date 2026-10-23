const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization;
  const token = cabecalho && cabecalho.startsWith('Bearer ')
    ? cabecalho.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ mensagem: 'Faça login para acessar este recurso.' });
  }

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (erro) {
    return res.status(401).json({ mensagem: 'Token inválido ou expirado. Faça login novamente.' });
  }
}

module.exports = autenticar;

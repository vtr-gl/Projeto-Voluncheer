const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'voluncheer_dev_secret';

function autenticar(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ erro: 'Token não informado.' });

  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ erro: 'Formato inválido. Use: Bearer <token>' });

  try {
    req.usuario = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

function apenasOng(req, res, next) {
  if (req.usuario?.tp_usuario !== 'ong')
    return res.status(403).json({ erro: 'Acesso exclusivo para ONGs.' });
  next();
}

function apenasVoluntario(req, res, next) {
  if (req.usuario?.tp_usuario !== 'voluntario')
    return res.status(403).json({ erro: 'Acesso exclusivo para voluntários.' });
  next();
}

module.exports = { autenticar, apenasOng, apenasVoluntario };

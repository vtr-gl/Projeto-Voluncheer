const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { um, executar } = require('../database/db');

const SECRET = process.env.JWT_SECRET || 'voluncheer_dev_secret';

// POST /auth/cadastro/voluntario
function cadastroVoluntario(req, res) {
  const { ds_email, ds_senha, nm_voluntario, tel_voluntario, dt_nascimento } = req.body;

  if (!ds_email || !ds_senha || !nm_voluntario)
    return res.status(400).json({ erro: 'E-mail, senha e nome são obrigatórios.' });

  if (um('SELECT id_usuario FROM usuario WHERE ds_email = ?', [ds_email]))
    return res.status(409).json({ erro: 'E-mail já cadastrado.' });

  const hash = bcrypt.hashSync(ds_senha, 10);
  const { lastID: id_usuario } = executar(
    `INSERT INTO usuario (ds_email, ds_senha_hash, tp_usuario) VALUES (?, ?, 'voluntario')`,
    [ds_email, hash]
  );

  executar(
    `INSERT INTO voluntario (id_usuario, nm_voluntario, tel_voluntario, dt_nascimento)
     VALUES (?, ?, ?, ?)`,
    [id_usuario, nm_voluntario, tel_voluntario || null, dt_nascimento || null]
  );

  res.status(201).json({ mensagem: 'Voluntário cadastrado!', id_usuario });
}

// POST /auth/cadastro/ong
function cadastroOng(req, res) {
  const { ds_email, ds_senha, ds_ong, ds_cnpj, tel_ong, end_ong, site_ong, comp_ong } = req.body;

  if (!ds_email || !ds_senha || !ds_ong)
    return res.status(400).json({ erro: 'E-mail, senha e nome da ONG são obrigatórios.' });

  if (um('SELECT id_usuario FROM usuario WHERE ds_email = ?', [ds_email]))
    return res.status(409).json({ erro: 'E-mail já cadastrado.' });

  const hash = bcrypt.hashSync(ds_senha, 10);
  const { lastID: id_usuario } = executar(
    `INSERT INTO usuario (ds_email, ds_senha_hash, tp_usuario) VALUES (?, ?, 'ong')`,
    [ds_email, hash]
  );

  executar(
    `INSERT INTO ong (id_usuario, ds_ong, ds_cnpj, tel_ong, end_ong, site_ong, comp_ong)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id_usuario, ds_ong, ds_cnpj || null, tel_ong || null,
     end_ong || null, site_ong || null, comp_ong || null]
  );

  res.status(201).json({ mensagem: 'ONG cadastrada!', id_usuario });
}

// POST /auth/login
function login(req, res) {
  const { ds_email, ds_senha } = req.body;

  if (!ds_email || !ds_senha)
    return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });

  const usuario = um('SELECT * FROM usuario WHERE ds_email = ?', [ds_email]);
  if (!usuario || !bcrypt.compareSync(ds_senha, usuario.ds_senha_hash))
    return res.status(401).json({ erro: 'Credenciais inválidas.' });

  if (usuario.st_usuario !== 'A')
    return res.status(403).json({ erro: 'Usuário inativo.' });

  const token = jwt.sign(
    { id_usuario: usuario.id_usuario, tp_usuario: usuario.tp_usuario, email: usuario.ds_email },
    SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token, tp_usuario: usuario.tp_usuario, id_usuario: usuario.id_usuario });
}

module.exports = { cadastroVoluntario, cadastroOng, login };

const { todos, um, executar } = require('../database/db');

// GET /ongs — lista todas (público)
function listarOngs(req, res) {
  let sql = 'SELECT * FROM ong WHERE 1=1';
  const params = [];

  if (req.query.ds_ong) {
    sql += ' AND ds_ong LIKE ?';
    params.push(`%${req.query.ds_ong}%`);
  }

  res.json(todos(sql, params));
}

// GET /ongs/:id — detalhe (público)
function buscarOng(req, res) {
  const ong = um('SELECT * FROM ong WHERE id_ong = ?', [req.params.id]);
  if (!ong) return res.status(404).json({ erro: 'ONG não encontrada.' });
  res.json(ong);
}

// GET /ongs/perfil — perfil da ONG logada
function meuPerfil(req, res) {
  const ong = um('SELECT * FROM ong WHERE id_usuario = ?', [req.usuario.id_usuario]);
  if (!ong) return res.status(404).json({ erro: 'Perfil ONG não encontrado.' });
  res.json(ong);
}

// PUT /ongs/perfil — editar própria ONG
function editarPerfil(req, res) {
  const ong = um('SELECT * FROM ong WHERE id_usuario = ?', [req.usuario.id_usuario]);
  if (!ong) return res.status(404).json({ erro: 'Perfil ONG não encontrado.' });

  const { ds_ong, ds_cnpj, tel_ong, end_ong, site_ong, comp_ong } = req.body;

  executar(
    `UPDATE ong SET
       ds_ong   = COALESCE(?, ds_ong),
       ds_cnpj  = COALESCE(?, ds_cnpj),
       tel_ong  = COALESCE(?, tel_ong),
       end_ong  = COALESCE(?, end_ong),
       site_ong = COALESCE(?, site_ong),
       comp_ong = COALESCE(?, comp_ong)
     WHERE id_ong = ?`,
    [ds_ong || null, ds_cnpj || null, tel_ong || null,
     end_ong || null, site_ong || null, comp_ong || null, ong.id_ong]
  );

  res.json({ mensagem: 'Perfil atualizado!' });
}

module.exports = { listarOngs, buscarOng, meuPerfil, editarPerfil };

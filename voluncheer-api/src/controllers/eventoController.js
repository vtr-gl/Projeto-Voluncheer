const { todos, um, executar } = require('../database/db');

// GET /eventos — lista todos (público, filtros opcionais)
function listarEventos(req, res) {
  let sql = `
    SELECT e.*, o.ds_ong
    FROM evento e
    JOIN ong o ON e.id_ong = o.id_ong
    WHERE 1=1
  `;
  const params = [];

  if (req.query.ds_evento) {
    sql += ' AND e.ds_evento LIKE ?';
    params.push(`%${req.query.ds_evento}%`);
  }
  if (req.query.id_ong) {
    sql += ' AND e.id_ong = ?';
    params.push(req.query.id_ong);
  }

  sql += ' ORDER BY e.dt_evento ASC';
  res.json(todos(sql, params));
}

// GET /eventos/:id — detalhe (público)
function buscarEvento(req, res) {
  const evento = um(
    `SELECT e.*, o.ds_ong, o.tel_ong, o.site_ong
     FROM evento e JOIN ong o ON e.id_ong = o.id_ong
     WHERE e.id_evento = ?`,
    [req.params.id]
  );
  if (!evento) return res.status(404).json({ erro: 'Evento não encontrado.' });
  res.json(evento);
}

// POST /eventos — cria (apenas ONG autenticada)
function criarEvento(req, res) {
  const { end_evento, dt_evento, ds_evento, qt_vagas } = req.body;
  if (!dt_evento || !ds_evento)
    return res.status(400).json({ erro: 'dt_evento e ds_evento são obrigatórios.' });

  const ong = um('SELECT id_ong FROM ong WHERE id_usuario = ?', [req.usuario.id_usuario]);
  if (!ong) return res.status(403).json({ erro: 'ONG não encontrada para este usuário.' });

  const { lastID } = executar(
    `INSERT INTO evento (id_ong, end_evento, dt_evento, ds_evento, qt_vagas)
     VALUES (?, ?, ?, ?, ?)`,
    [ong.id_ong, end_evento || null, dt_evento, ds_evento, qt_vagas ?? 0]
  );

  res.status(201).json({ mensagem: 'Evento criado!', id_evento: lastID });
}

// PUT /eventos/:id — edita (apenas ONG dona do evento)
function editarEvento(req, res) {
  const evento = um('SELECT * FROM evento WHERE id_evento = ?', [req.params.id]);
  if (!evento) return res.status(404).json({ erro: 'Evento não encontrado.' });

  const ong = um('SELECT id_ong FROM ong WHERE id_usuario = ?', [req.usuario.id_usuario]);
  if (!ong || ong.id_ong !== evento.id_ong)
    return res.status(403).json({ erro: 'Sem permissão para editar este evento.' });

  const { end_evento, dt_evento, ds_evento, qt_vagas } = req.body;

  executar(
    `UPDATE evento SET
       end_evento = COALESCE(?, end_evento),
       dt_evento  = COALESCE(?, dt_evento),
       ds_evento  = COALESCE(?, ds_evento),
       qt_vagas   = COALESCE(?, qt_vagas)
     WHERE id_evento = ?`,
    [end_evento || null, dt_evento || null, ds_evento || null,
     qt_vagas ?? null, req.params.id]
  );

  res.json({ mensagem: 'Evento atualizado!' });
}

// DELETE /eventos/:id — remove (apenas ONG dona)
function deletarEvento(req, res) {
  const evento = um('SELECT * FROM evento WHERE id_evento = ?', [req.params.id]);
  if (!evento) return res.status(404).json({ erro: 'Evento não encontrado.' });

  const ong = um('SELECT id_ong FROM ong WHERE id_usuario = ?', [req.usuario.id_usuario]);
  if (!ong || ong.id_ong !== evento.id_ong)
    return res.status(403).json({ erro: 'Sem permissão para deletar este evento.' });

  executar('DELETE FROM evento WHERE id_evento = ?', [req.params.id]);
  res.json({ mensagem: 'Evento removido.' });
}

module.exports = { listarEventos, buscarEvento, criarEvento, editarEvento, deletarEvento };

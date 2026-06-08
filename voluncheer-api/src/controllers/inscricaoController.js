const { todos, um, executar } = require('../database/db');

// POST /inscricoes — voluntário se inscreve em evento
function inscrever(req, res) {
  const { id_evento } = req.body;
  if (!id_evento)
    return res.status(400).json({ erro: 'id_evento é obrigatório.' });

  const voluntario = um('SELECT id_voluntario FROM voluntario WHERE id_usuario = ?', [req.usuario.id_usuario]);
  if (!voluntario)
    return res.status(403).json({ erro: 'Perfil de voluntário não encontrado.' });

  const evento = um('SELECT * FROM evento WHERE id_evento = ?', [id_evento]);
  if (!evento)
    return res.status(404).json({ erro: 'Evento não encontrado.' });

  const jaInscrito = um(
    'SELECT id_inscricao FROM inscricao WHERE id_voluntario = ? AND id_evento = ?',
    [voluntario.id_voluntario, id_evento]
  );
  if (jaInscrito)
    return res.status(409).json({ erro: 'Você já está inscrito neste evento.' });

  // Verifica vagas (0 = ilimitado)
  if (evento.qt_vagas > 0) {
    const { total } = um(
      'SELECT COUNT(*) as total FROM inscricao WHERE id_evento = ? AND status_inscricao != ?',
      [id_evento, 'cancelada']
    );
    if (total >= evento.qt_vagas)
      return res.status(409).json({ erro: 'Não há vagas disponíveis.' });
  }

  const { lastID } = executar(
    `INSERT INTO inscricao (id_voluntario, id_evento) VALUES (?, ?)`,
    [voluntario.id_voluntario, id_evento]
  );

  res.status(201).json({ mensagem: 'Inscrição realizada!', id_inscricao: lastID });
}

// GET /inscricoes/minhas — inscrições do voluntário logado
function minhasInscricoes(req, res) {
  const voluntario = um('SELECT id_voluntario FROM voluntario WHERE id_usuario = ?', [req.usuario.id_usuario]);
  if (!voluntario)
    return res.status(403).json({ erro: 'Perfil de voluntário não encontrado.' });

  const inscricoes = todos(
    `SELECT i.*, e.ds_evento, e.dt_evento, e.end_evento, o.ds_ong
     FROM inscricao i
     JOIN evento e ON i.id_evento = e.id_evento
     JOIN ong o ON e.id_ong = o.id_ong
     WHERE i.id_voluntario = ?
     ORDER BY i.dt_inscricao DESC`,
    [voluntario.id_voluntario]
  );

  res.json(inscricoes);
}

// GET /inscricoes/evento/:id_evento — inscrições de um evento (apenas ONG dona)
function inscricoesDoEvento(req, res) {
  const evento = um('SELECT * FROM evento WHERE id_evento = ?', [req.params.id_evento]);
  if (!evento) return res.status(404).json({ erro: 'Evento não encontrado.' });

  const ong = um('SELECT id_ong FROM ong WHERE id_usuario = ?', [req.usuario.id_usuario]);
  if (!ong || ong.id_ong !== evento.id_ong)
    return res.status(403).json({ erro: 'Sem permissão.' });

  const inscricoes = todos(
    `SELECT i.*, v.nm_voluntario, v.tel_voluntario
     FROM inscricao i
     JOIN voluntario v ON i.id_voluntario = v.id_voluntario
     WHERE i.id_evento = ?
     ORDER BY i.dt_inscricao ASC`,
    [req.params.id_evento]
  );

  res.json(inscricoes);
}

// PATCH /inscricoes/:id/cancelar — voluntário cancela própria inscrição
function cancelarInscricao(req, res) {
  const voluntario = um('SELECT id_voluntario FROM voluntario WHERE id_usuario = ?', [req.usuario.id_usuario]);
  if (!voluntario)
    return res.status(403).json({ erro: 'Perfil de voluntário não encontrado.' });

  const inscricao = um('SELECT * FROM inscricao WHERE id_inscricao = ?', [req.params.id]);
  if (!inscricao) return res.status(404).json({ erro: 'Inscrição não encontrada.' });
  if (inscricao.id_voluntario !== voluntario.id_voluntario)
    return res.status(403).json({ erro: 'Sem permissão.' });

  executar(
    `UPDATE inscricao SET status_inscricao = 'cancelada' WHERE id_inscricao = ?`,
    [req.params.id]
  );

  res.json({ mensagem: 'Inscrição cancelada.' });
}

// PATCH /inscricoes/:id/status — ONG atualiza status (confirmar, recusar)
function atualizarStatus(req, res) {
  const { status_inscricao } = req.body;
  const statusValidos = ['pendente', 'confirmada', 'recusada', 'cancelada'];
  if (!statusValidos.includes(status_inscricao))
    return res.status(400).json({ erro: `Status inválido. Use: ${statusValidos.join(', ')}` });

  const inscricao = um(
    `SELECT i.*, e.id_ong FROM inscricao i JOIN evento e ON i.id_evento = e.id_evento
     WHERE i.id_inscricao = ?`,
    [req.params.id]
  );
  if (!inscricao) return res.status(404).json({ erro: 'Inscrição não encontrada.' });

  const ong = um('SELECT id_ong FROM ong WHERE id_usuario = ?', [req.usuario.id_usuario]);
  if (!ong || ong.id_ong !== inscricao.id_ong)
    return res.status(403).json({ erro: 'Sem permissão.' });

  executar(
    `UPDATE inscricao SET status_inscricao = ? WHERE id_inscricao = ?`,
    [status_inscricao, req.params.id]
  );

  res.json({ mensagem: 'Status atualizado!' });
}

module.exports = { inscrever, minhasInscricoes, inscricoesDoEvento, cancelarInscricao, atualizarStatus };
